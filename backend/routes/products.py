from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Product
from data.products import PRODUCTS

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=List[Product])
async def get_products(category: Optional[str] = Query(None, description="Filter products by category")):
    if category:
        filtered_products = [p for p in PRODUCTS if p["category"] == category]
        return filtered_products
    return PRODUCTS

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    for product in PRODUCTS:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")
