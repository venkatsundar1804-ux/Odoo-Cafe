from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

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
    product_id: Optional[int] = None

class CouponCreate(CouponBase):
    pass

class Coupon(CouponBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    name: Optional[str] = None
    price: Optional[float] = None

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    line_total: float
    model_config = ConfigDict(from_attributes=True)

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
    coupon_code: Optional[str] = None
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    model_config = ConfigDict(from_attributes=True)

class TransactionCreate(BaseModel):
    order_id: int
    payment_method: str
    amount: float
    status: Optional[str] = "Completed"

class TransactionResponse(BaseModel):
    id: int
    order_id: int
    payment_method: str
    amount: float
    status: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    unit_of_measure: Optional[str] = None
    tax_percentage: Optional[float] = None
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CategoryResponse(BaseModel):
    id: int
    name: str
    color: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentMethodResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class PaymentMethodCreate(BaseModel):
    name: str
    is_active: Optional[bool] = True
