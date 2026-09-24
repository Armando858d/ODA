from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from models import ShippingOption
from routes.payments import orders_db
from fpdf import FPDF
import io

router = APIRouter(prefix="/api/shipping", tags=["shipping"])

@router.post("/calculate", response_model=ShippingOption)
async def calculate_shipping(zip_code: str):
    # Basic logic for shipping cost calculation
    try:
        zip_int = int(zip_code)
        
        # Local (Aguascalientes 20000-20999)
        if 20000 <= zip_int <= 20999:
            return ShippingOption(zone="local", cost=50.0)
            
        # Zona Centro (Simplified logic: assuming 10000-50000 roughly covers center)
        elif 10000 <= zip_int <= 50000:
            return ShippingOption(zone="centro", cost=150.0)
            
        # Nacional (Rest of Mexico)
        else:
            return ShippingOption(zone="nacional", cost=220.0)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid zip code format"
        )

@router.get("/label/{order_id}")
async def get_shipping_label(order_id: str):
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order_data = orders_db[order_id]["order"]
    customer = order_data["customer"]
    address = customer["address"]
    items = order_data["items"]
    
    # Generate PDF using fpdf2
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    
    # Header
    pdf.cell(0, 10, "SHIPPING LABEL", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.line(10, 25, 200, 25)
    pdf.ln(10)
    
    # From
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "FROM:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 8, "4RTB4N STUDIO", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, "Aguascalientes, AGS, Mexico", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    # To
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "TO:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 8, customer["name"], new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"{address['street']}, {address['colony']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"{address['city']}, {address['state']}, CP: {address['zip_code']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Phone: {customer['phone']}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    
    # Order Info
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, f"Order ID: {order_id}", new_x="LMARGIN", new_y="NEXT")
    
    # Items Summary
    pdf.set_font("helvetica", "", 10)
    total_qty = 0
    for item in items:
        variant_str = f" ({item['variant']})" if item.get('variant') else ""
        pdf.cell(0, 6, f"- {item['quantity']}x {item['name']}{variant_str}", new_x="LMARGIN", new_y="NEXT")
        total_qty += item['quantity']
        
    pdf.ln(5)
    pdf.set_font("helvetica", "I", 10)
    pdf.cell(0, 6, f"Total items: {total_qty}", new_x="LMARGIN", new_y="NEXT")
    
    # Output PDF to stream
    pdf_bytes = pdf.output(dest="S")
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=label_{order_id}.pdf"}
    )
