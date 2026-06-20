from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    is_active = Column(Boolean, default=True)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    color = Column(String)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Float)
    category_id = Column(Integer, ForeignKey("categories.id"))
    unit_of_measure = Column(String, default="piece")
    tax_percentage = Column(Float, default=0.0)
    description = Column(String, nullable=True)

class Table(Base):
    __tablename__ = "tables"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer)
    seats = Column(Integer)
    token = Column(String, unique=True, index=True, nullable=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float)
    status = Column(String)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String, index=True, nullable=True)

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    discount_type = Column(String) # 'percentage' or 'fixed'
    value = Column(Float)
    is_active = Column(Boolean, default=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

class POSSession(Base):
    __tablename__ = "pos_sessions"
    id = Column(Integer, primary_key=True, index=True)
    opened_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    closed_at = Column(DateTime, nullable=True)
    closing_amount = Column(Float, nullable=True)
    is_open = Column(Boolean, default=True)
    employee_id = Column(Integer, ForeignKey("users.id"))

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    upi_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
