import json
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone

import models
import schemas
from database import engine, get_db
import auth
import analytics

models.Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(auth.session_router)
app.include_router(analytics.router)

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()
coupon_manager = ConnectionManager()

@app.websocket("/ws/kds")
async def websocket_kds_endpoint(websocket: WebSocket):
    await websocket.accept()
    manager.active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.active_connections.remove(websocket)

@app.websocket("/ws/coupons")
async def websocket_coupons_endpoint(websocket: WebSocket):
    await websocket.accept()
    coupon_manager.active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        coupon_manager.active_connections.remove(websocket)

@app.post("/api/orders/", response_model=schemas.Order)
async def create_order(order_req: schemas.OrderCreate, db: Session = Depends(get_db)):
    subtotal = 0.0
    total_tax = 0.0
    order_details_for_kds = []

    # 1. Calculate Subtotal & Taxes
    for item in order_req.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        
        p_name = product.name if product else (item.name or f"Mock Product {item.product_id}")
        p_price = product.price if product else (item.price or 0.0)
        p_tax = product.tax_percentage if (product and hasattr(product, 'tax_percentage')) else 0.0
        
        line_total = p_price * item.quantity
        line_tax = line_total * (p_tax / 100.0)
        
        subtotal += line_total
        total_tax += line_tax
        
        order_details_for_kds.append({
            "product_id": item.product_id,
            "product_name": p_name,
            "quantity": item.quantity
        })

    # 2. Apply Coupons (if provided)
    discount_amount = 0.0
    if order_req.coupon_code:
        coupon = db.query(models.Coupon).filter(models.Coupon.code == order_req.coupon_code, models.Coupon.is_active == True).first()
        if coupon:
            applicable_subtotal = subtotal
            
            if coupon.product_id:
                applicable_subtotal = 0.0
                for item in order_req.items:
                    if item.product_id == coupon.product_id:
                        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
                        p_price = product.price if product else (item.price or 0.0)
                        applicable_subtotal += p_price * item.quantity

            if coupon.discount_type == 'percentage':
                discount_amount = applicable_subtotal * (coupon.value / 100.0)
            elif coupon.discount_type == 'fixed':
                discount_amount = min(coupon.value, applicable_subtotal)
            
            # Ensure discount doesn't exceed total subtotal
            discount_amount = min(discount_amount, subtotal)

    # 3. Final Total Calculation
    final_total = (subtotal + total_tax) - discount_amount

    # 4. Save to Database
    db_order = models.Order(
        table_id=order_req.table_id,
        customer_id=order_req.customer_id,
        total_amount=final_total,
        tax_amount=total_tax,
        discount_amount=discount_amount,
        status="To Cook"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # 5. Broadcast to KDS
    kds_payload = {
        "event": "NEW_ORDER",
        "order_id": db_order.id,
        "table_id": db_order.table_id,
        "status": db_order.status,
        "items": order_details_for_kds
    }
    await manager.broadcast(json.dumps(kds_payload))

    return db_order

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "access_token": f"mock-jwt-token-{user.id}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

@app.post("/api/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = pwd_context.hash(req.password)
    
    # Create new user, default to customer
    new_user = models.User(
        name=req.name,
        email=req.email,
        hashed_password=hashed_password,
        role="customer"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "access_token": f"mock-jwt-token-{new_user.id}",
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }



class CFDConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, table_id: int):
        await websocket.accept()
        if table_id not in self.active_connections:
            self.active_connections[table_id] = []
        self.active_connections[table_id].append(websocket)

    def disconnect(self, websocket: WebSocket, table_id: int):
        if table_id in self.active_connections:
            if websocket in self.active_connections[table_id]:
                self.active_connections[table_id].remove(websocket)
            if not self.active_connections[table_id]:
                del self.active_connections[table_id]

    async def broadcast_to_table(self, table_id: int, message: dict):
        if table_id in self.active_connections:
            for connection in self.active_connections[table_id]:
                await connection.send_json(message)

cfd_manager = CFDConnectionManager()

@app.websocket("/ws/cfd/{table_id}")
async def websocket_cfd_endpoint(websocket: WebSocket, table_id: int):
    await cfd_manager.connect(websocket, table_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        cfd_manager.disconnect(websocket, table_id)

class CFDUpdateRequest(BaseModel):
    table_id: int
    cart_items: List[Dict[str, Any]]
    subtotal: float
    tax: float
    total: float

@app.post("/api/cfd/update")
async def update_cfd(update_req: CFDUpdateRequest):
    payload = {
        "event": "CART_UPDATED",
        "cart_items": update_req.cart_items,
        "subtotal": update_req.subtotal,
        "tax": update_req.tax,
        "total": update_req.total
    }
    await cfd_manager.broadcast_to_table(update_req.table_id, payload)
    return {"status": "success", "message": f"Broadcasted to table {update_req.table_id}"}

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@app.get("/api/tables")
def get_tables(db: Session = Depends(get_db)):
    return db.query(models.Table).all()

@app.get("/api/customers")
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()

@app.get("/api/coupons")
def get_coupons(db: Session = Depends(get_db)):
    return db.query(models.Coupon).all()

@app.post("/api/coupons", response_model=schemas.Coupon)
async def create_coupon(coupon_req: schemas.CouponCreate, db: Session = Depends(get_db)):
    db_coupon = models.Coupon(**coupon_req.model_dump())
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)
    await coupon_manager.broadcast(json.dumps({"event": "COUPON_ADDED", "coupon": {"id": db_coupon.id, "code": db_coupon.code}}))
    return db_coupon

@app.delete("/api/coupons/{coupon_id}")
async def delete_coupon(coupon_id: int, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    await coupon_manager.broadcast(json.dumps({"event": "COUPON_DELETED", "coupon_id": coupon_id}))
    return {"status": "success"}

class OrderPayRequest(BaseModel):
    payment_method: str
    details: Dict[str, Any]

@app.post("/api/orders/{order_id}/pay")
def pay_order(order_id: int, pay_req: OrderPayRequest, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = "Paid"
    db.commit()
    db.refresh(order)
    return {"status": "Paid", "order_id": order_id}

@app.get("/api/orders")
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()

@app.get("/api/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.post("/api/webhook/upi/{order_id}")
async def simulate_upi_webhook(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = "Paid"
    db.commit()
    db.refresh(order)
    
    # Broadcast to CFD that payment was successful
    payload = {
        "mode": "success",
        "order_id": order_id
    }
    await cfd_manager.broadcast_to_table(order.table_id, payload)
    
    return {"status": "success", "message": f"Order {order_id} marked as Paid via webhook"}

@app.post("/api/orders/{order_id}/mock-webhook")
async def mock_payment_webhook(order_id: int, db: Session = Depends(get_db)):
    """Simulates a payment gateway webhook confirming payment."""
    # 1. Update the database
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = "Paid"
    db.commit()

    # 2. Broadcast to CFD to show the "Thank You" checkmark instantly
    await cfd_manager.broadcast_to_table(order.table_id, {
        "mode": "success",
        "order_id": order_id
    })

    return {"status": "success", "message": "Payment verified via mock webhook."}

@app.get("/api/orders/{order_id}/status")
async def get_order_status(order_id: int, db: Session = Depends(get_db)):
    """Simple endpoint for the POS to poll the current status."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    return {"status": order.status if order else "Unknown"}
class OrderStatusUpdate(BaseModel):
    status: str

@app.put("/api/orders/{order_id}/status")
async def update_order_status(order_id: int, req: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = req.status
    db.commit()
    db.refresh(order)
    return {"status": "success", "order_id": order_id, "new_status": order.status}
