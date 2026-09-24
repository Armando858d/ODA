from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

app = FastAPI(title="4RTB4N Studio API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from routes.products import router as products_router
from routes.payments import router as payments_router
from routes.webhooks import router as webhooks_router
from routes.shipping import router as shipping_router

app.include_router(products_router)
app.include_router(payments_router)
app.include_router(webhooks_router)
app.include_router(shipping_router)

# Serve static files (the frontend)
frontend_dir = Path(__file__).parent.parent  # Goes up to ODA/
app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    from config import settings
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
