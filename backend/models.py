from pydantic import BaseModel
from typing import List, Optional, Literal

class ProductVariant(BaseModel):
    name: str
    price_modifier: float

class Product(BaseModel):
    id: str
    name: str
    description: str
    category: str
    type: str
    price: float
    currency: str = "MXN"
    variants: List[ProductVariant] = []
    image: str
    tags: List[str] = []
    weight_g: float
    featured: bool = False
    stock: int = 100

class CartItem(BaseModel):
    product_id: str
    name: str
    variant: Optional[str] = None
    quantity: int
    unit_price: float
    image: str

class CustomerAddress(BaseModel):
    street: str
    colony: str
    city: str
    state: str
    zip_code: str

class Customer(BaseModel):
    name: str
    email: str
    phone: str
    address: CustomerAddress

class ShippingOption(BaseModel):
    zone: Literal["local", "centro", "nacional"]
    cost: float

class OrderRequest(BaseModel):
    items: List[CartItem]
    customer: Customer
    shipping: ShippingOption

class OrderResponse(BaseModel):
    order_id: str
    init_point: str
    total: float
    shipping_cost: float

class WebhookPayload(BaseModel):
    action: str
    data: dict
    type: str
