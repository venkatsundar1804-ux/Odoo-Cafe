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
app.include_router(analytics.router)

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/kds")
async def websocket_kds_endpoint(websocket: WebSocket):
    await websocket.accept()
    manager.active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.active_connections.remove(websocket)

@app.post("/api/orders/", response_model=schemas.Order)
async def create_order(order_req: schemas.OrderCreate, db: Session = Depends(get_db)):
    subtotal = 0.0
    total_tax = 0.0
    order_details_for_kds = []

    # 1. Calculate Subtotal & Taxes
    for item in order_req.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        
        line_total = product.price * item.quantity
        line_tax = line_total * (product.tax_percentage / 100.0) if hasattr(product, 'tax_percentage') else 0.0
        
        subtotal += line_total
        total_tax += line_tax
        
        order_details_for_kds.append({
            "product_name": product.name,
            "quantity": item.quantity
        })

    # 2. Apply Coupons (if provided)
    discount_amount = 0.0
    if order_req.coupon_code:
        coupon = db.query(models.Coupon).filter(models.Coupon.code == order_req.coupon_code, models.Coupon.is_active == True).first()
        if coupon:
            if coupon.discount_type == 'percentage':
                discount_amount = subtotal * (coupon.value / 100.0)
            elif coupon.discount_type == 'fixed':
                discount_amount = coupon.value
            
            # Ensure discount doesn't exceed subtotal
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

class SessionOpen(BaseModel):
    employee_id: int

class SessionClose(BaseModel):
    closing_amount: float

@app.post("/api/sessions/open")
def open_session(session_req: SessionOpen, db: Session = Depends(get_db)):
    db_session = models.POSSession(
        employee_id=session_req.employee_id,
        is_open=True
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.post("/api/sessions/{session_id}/close")
def close_session(session_id: int, session_req: SessionClose, db: Session = Depends(get_db)):
    db_session = db.query(models.POSSession).filter(models.POSSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not db_session.is_open:
        raise HTTPException(status_code=400, detail="Session is already closed")
    
    db_session.is_open = False
    db_session.closed_at = datetime.now(timezone.utc)
    db_session.closing_amount = session_req.closing_amount
    db.commit()
    db.refresh(db_session)
    return db_session

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

@app.get("/api/tables", response_model=List[schemas.Table])
def get_tables(db: Session = Depends(get_db)):
    return db.query(models.Table).all()

@app.patch("/api/tables/{table_id}", response_model=schemas.Table)
def update_table(table_id: int, table_update: schemas.TableUpdate, db: Session = Depends(get_db)):
    db_table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    db_table.status = table_update.status
    if table_update.occupied_by is not None:
        db_table.occupied_by = table_update.occupied_by
    elif table_update.status == "available":
        db_table.occupied_by = None
        
    db.commit()
    db.refresh(db_table)
    return db_table
