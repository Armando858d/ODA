import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend directory
load_dotenv(Path(__file__).parent / '.env')

class Settings:
    # Mercado Pago
    MP_ACCESS_TOKEN: str = os.getenv('MP_ACCESS_TOKEN', '')
    MP_PUBLIC_KEY: str = os.getenv('MP_PUBLIC_KEY', '')
    
    # Return URLs
    BASE_URL: str = os.getenv('BASE_URL', 'http://localhost:8000')
    MP_SUCCESS_URL: str = os.getenv('MP_SUCCESS_URL', 'http://localhost:8000/checkout-success.html')
    MP_FAILURE_URL: str = os.getenv('MP_FAILURE_URL', 'http://localhost:8000/checkout-failure.html')
    MP_PENDING_URL: str = os.getenv('MP_PENDING_URL', 'http://localhost:8000/checkout-pending.html')
    
    # Vendor
    VENDOR_WHATSAPP: str = os.getenv('VENDOR_WHATSAPP', '524492795557')
    
    # Server
    HOST: str = os.getenv('HOST', '0.0.0.0')
    PORT: int = int(os.getenv('PORT', '8000'))
    DEBUG: bool = os.getenv('DEBUG', 'true').lower() == 'true'

settings = Settings()
