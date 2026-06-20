import secrets
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, Column, String

import models
from database import get_db

router = APIRouter()

@router.get("/api/reports/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    total_revenue_result = db.query(func.sum(models.Order.total_amount)).filter(models.Order.status == "Paid").scalar()
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0

    total_orders = db.query(func.count(models.Order.id)).scalar() or 0

    average_order_value = 0.0
    if total_orders > 0:
        average_order_value = total_revenue / total_orders

    return {
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "average_order_value": round(average_order_value, 2)
    }

@router.post("/api/tables/{table_id}/generate-token")
def generate_table_token(table_id: int, db: Session = Depends(get_db)):
    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    token = secrets.token_urlsafe(6)
    table.token = token
    db.commit()
    
    return {
        "table_id": table.id,
        "qr_token": token,
        "qr_url": f"/s/{token}"
    }

@router.get("/s/{token}")
def redirect_to_self_order(token: str, db: Session = Depends(get_db)):
    table = db.query(models.Table).filter(models.Table.token == token).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    return RedirectResponse(url=f"http://localhost:5173/self-order?table_id={table.id}")
