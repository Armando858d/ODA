from fastapi import APIRouter, HTTPException, status
from models import OrderRequest, OrderResponse
from config import settings
import mercadopago
from datetime import datetime
import logging

router = APIRouter(prefix="/api", tags=["payments"])
logger = logging.getLogger(__name__)

# In-memory orders database for MVP
orders_db = {}

@router.post("/create-preference", response_model=OrderResponse)
async def create_preference(order: OrderRequest):
    if not settings.MP_ACCESS_TOKEN or "your-access-token-here" in settings.MP_ACCESS_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Mercado Pago credentials not configured. Please check your .env file."
        )

    try:
        sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
        
        # Generate sequential order ID
        date_str = datetime.now().strftime("%Y%m%d")
        seq = len(orders_db) + 1
        order_id = f"4RTB4N-{date_str}-{seq:04d}"
        
        # Calculate totals
        items_total = sum(item.quantity * item.unit_price for item in order.items)
        shipping_cost = order.shipping.cost
        total_amount = items_total + shipping_cost
        
        # Prepare preference data
        preference_data = {
            "items": [{
                "title": item.name + (f" ({item.variant})" if item.variant else ""),
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "currency_id": "MXN"
            } for item in order.items],
            "payer": {
                "name": order.customer.name,
                "email": order.customer.email
            },
            "back_urls": {
                "success": settings.MP_SUCCESS_URL,
                "failure": settings.MP_FAILURE_URL,
                "pending": settings.MP_PENDING_URL
            },
            "auto_return": "approved",
            "external_reference": order_id,
            "notification_url": f"{settings.BASE_URL}/api/webhooks/mercadopago",
            "shipments": {
                "cost": shipping_cost,
                "mode": "not_specified"
            }
        }
        
        # Create preference
        result = sdk.preference().create(preference_data)
        
        if result["status"] != 201:
            logger.error(f"Mercado Pago API error: {result}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to create payment preference with Mercado Pago."
            )
            
        init_point = result["response"]["init_point"]
        
        # Store in memory
        orders_db[order_id] = {
            "order": order.model_dump(),
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        return OrderResponse(
            order_id=order_id,
            init_point=init_point,
            total=total_amount,
            shipping_cost=shipping_cost
        )
        
    except Exception as e:
        logger.error(f"Error creating preference: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
