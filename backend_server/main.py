import json
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session, joinedload
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
    order_items_to_create = []

    # 1. Calculate Subtotal & Taxes and prepare OrderItem records
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
            "quantity": item.quantity,
            "price": p_price
        })

        order_items_to_create.append(models.OrderItem(
            product_id=item.product_id,
            product_name=p_name,
            quantity=item.quantity,
            unit_price=p_price,
            line_total=line_total
        ))

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

    # 4. Save Order to Database
    db_order = models.Order(
        table_id=order_req.table_id,
        customer_id=order_req.customer_id,
        total_amount=final_total,
        tax_amount=total_tax,
        discount_amount=discount_amount,
        coupon_code=order_req.coupon_code,
        status="To Cook"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # 5. Save OrderItems to Database
    for oi in order_items_to_create:
        oi.order_id = db_order.id
        db.add(oi)
    db.commit()
    db.refresh(db_order)

    # 6. Broadcast to KDS
    kds_payload = {
        "event": "NEW_ORDER",
        "order_id": db_order.id,
        "table_id": db_order.table_id,
        "status": db_order.status,
        "total_amount": final_total,
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

# ── Products & Categories (DB-backed) ──────────────────────────────

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).options(joinedload(models.Product.category)).all()
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "category_id": p.category_id,
            "category_name": p.category.name if p.category else None,
            "unit_of_measure": p.unit_of_measure,
            "tax_percentage": p.tax_percentage,
            "description": p.description
        })
    return result

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@app.get("/api/tables")
def get_tables(db: Session = Depends(get_db)):
    return db.query(models.Table).all()

@app.get("/api/customers")
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()

@app.post("/api/customers/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerBase, db: Session = Depends(get_db)):
    existing = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

# ── Coupons ─────────────────────────────────────────────────────────

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

# ── Payment Methods (DB-backed) ────────────────────────────────────

@app.get("/api/payment-methods")
def get_payment_methods(db: Session = Depends(get_db)):
    return db.query(models.PaymentMethod).all()

@app.post("/api/payment-methods", response_model=schemas.PaymentMethodResponse)
def create_payment_method(pm: schemas.PaymentMethodCreate, db: Session = Depends(get_db)):
    db_pm = models.PaymentMethod(name=pm.name, is_active=pm.is_active)
    db.add(db_pm)
    db.commit()
    db.refresh(db_pm)
    return db_pm

@app.put("/api/payment-methods/{pm_id}/toggle")
def toggle_payment_method(pm_id: int, db: Session = Depends(get_db)):
    pm = db.query(models.PaymentMethod).filter(models.PaymentMethod.id == pm_id).first()
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    pm.is_active = not pm.is_active
    db.commit()
    db.refresh(pm)
    return pm

@app.delete("/api/payment-methods/{pm_id}")
def delete_payment_method(pm_id: int, db: Session = Depends(get_db)):
    pm = db.query(models.PaymentMethod).filter(models.PaymentMethod.id == pm_id).first()
    if not pm:
        raise HTTPException(status_code=404, detail="Payment method not found")
    db.delete(pm)
    db.commit()
    return {"status": "success"}

# ── Orders ──────────────────────────────────────────────────────────

class OrderPayRequest(BaseModel):
    payment_method: str
    details: Dict[str, Any]

@app.post("/api/orders/{order_id}/pay")
def pay_order(order_id: int, pay_req: OrderPayRequest, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = "Paid"
    
    # Create a Transaction record
    txn = models.Transaction(
        order_id=order_id,
        payment_method=pay_req.payment_method,
        amount=order.total_amount,
        status="Completed"
    )
    db.add(txn)
    db.commit()
    db.refresh(order)
    return {"status": "Paid", "order_id": order_id}

@app.get("/api/orders")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).options(joinedload(models.Order.items)).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "table_id": o.table_id,
            "customer_id": o.customer_id,
            "total_amount": o.total_amount,
            "tax_amount": o.tax_amount,
            "discount_amount": o.discount_amount,
            "coupon_code": o.coupon_code,
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "line_total": item.line_total
                }
                for item in o.items
            ]
        })
    return result

@app.get("/api/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).options(joinedload(models.Order.items)).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "id": order.id,
        "table_id": order.table_id,
        "customer_id": order.customer_id,
        "total_amount": order.total_amount,
        "tax_amount": order.tax_amount,
        "discount_amount": order.discount_amount,
        "coupon_code": order.coupon_code,
        "status": order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "line_total": item.line_total
            }
            for item in order.items
        ]
    }

# ── Transactions ────────────────────────────────────────────────────

@app.get("/api/transactions")
def get_transactions(db: Session = Depends(get_db)):
    txns = db.query(models.Transaction).options(joinedload(models.Transaction.order)).order_by(models.Transaction.created_at.desc()).all()
    result = []
    for t in txns:
        result.append({
            "id": t.id,
            "order_id": t.order_id,
            "payment_method": t.payment_method,
            "amount": t.amount,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "customer_name": None  # could join through order->customer
        })
    return result

# ── Webhooks & Status ───────────────────────────────────────────────

@app.post("/api/webhook/upi/{order_id}")
async def simulate_upi_webhook(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = "Paid"
    
    # Create a Transaction record for UPI payment
    txn = models.Transaction(
        order_id=order_id,
        payment_method="upi",
        amount=order.total_amount,
        status="Completed"
    )
    db.add(txn)
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
    
    # Create a Transaction record
    txn = models.Transaction(
        order_id=order_id,
        payment_method="card",
        amount=order.total_amount,
        status="Completed"
    )
    db.add(txn)
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
    
    # Broadcast status update to all connected KDS/Employee Dashboards
    payload = {
        "event": "STATUS_UPDATE",
        "order_id": order_id,
        "status": order.status
    }
    await manager.broadcast(json.dumps(payload))
    
    return {"status": "success", "order_id": order_id, "new_status": order.status}
