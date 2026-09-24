from fastapi import APIRouter, Request, BackgroundTasks
from models import WebhookPayload
from config import settings
from routes.payments import orders_db
import mercadopago
import logging

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)

async def process_payment_notification(payment_id: str):
    try:
        sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
        payment_info = sdk.payment().get(payment_id)
        
        if payment_info["status"] == 200:
            payment_data = payment_info["response"]
            order_id = payment_data.get("external_reference")
            payment_status = payment_data.get("status")
            
            logger.info(f"Payment {payment_id} for order {order_id} is {payment_status}")
            
            if order_id and order_id in orders_db:
                orders_db[order_id]["status"] = payment_status
                
                if payment_status == "approved":
                    # TODO: Trigger shipping label generation or email notification
                    logger.info(f"Order {order_id} approved. WhatsApp notification should be sent to vendor.")
                    pass
    except Exception as e:
        logger.error(f"Error processing payment notification: {str(e)}")

@router.post("/mercadopago")
async def mercadopago_webhook(request: Request, background_tasks: BackgroundTasks):
    # MP sends webhooks in different formats, need to parse carefully
    try:
        body = await request.json()
        logger.info(f"Received webhook: {body}")
        
        # Depending on event type (payment created, updated, etc)
        action = body.get("action")
        type_str = body.get("type")
        
        if type_str == "payment" or action == "payment.created":
            data = body.get("data", {})
            payment_id = data.get("id")
            
            if payment_id:
                # Process asynchronously so we return 200 to MP immediately
                background_tasks.add_task(process_payment_notification, payment_id)
                
        return {"status": "received"}
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        return {"status": "error", "message": str(e)}
