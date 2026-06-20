from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "user"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class CustomerBase(BaseModel):
    name: str
    email: str
    phone_number: Optional[str] = None

class Customer(CustomerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class CouponBase(BaseModel):
    code: str
    discount_type: str
    value: float

class Coupon(CouponBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    table_id: Optional[int] = None
    customer_id: Optional[int] = None
    coupon_code: Optional[str] = None
    items: List[OrderItemCreate]

class Order(BaseModel):
    id: int
    table_id: Optional[int] = None
    customer_id: Optional[int] = None
    total_amount: float
    tax_amount: float
    discount_amount: float
    status: str
    model_config = ConfigDict(from_attributes=True)
