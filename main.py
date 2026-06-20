import json
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db
import auth
import analytics

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(analytics.router)

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

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
