import csv
import io
import secrets
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse, StreamingResponse
from datetime import datetime
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

@router.get("/api/reports/export")
def export_sales_csv(db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(
        models.Order.status.in_(["Paid", "Completed"])
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Order ID", "Date", "Table ID", "Customer ID", "Tax Amount", "Discount Amount", "Final Total"])
    
    for order in orders:
        order_date = getattr(order, 'created_at', datetime.now()).strftime("%Y-%m-%d %H:%M:%S")
        writer.writerow([
            order.id,
            order_date,
            order.table_id or "",
            order.customer_id or "",
            f"{order.tax_amount:.2f}",
            f"{order.discount_amount:.2f}",
            f"{order.total_amount:.2f}"
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=odoo_cafe_sales_report.csv"}
    )

@router.get("/api/reports/ai-summary")
def get_ai_daily_summary(db: Session = Depends(get_db)):
    total_orders = db.query(func.count(models.Order.id)).filter(
        models.Order.status.in_(["Paid", "Completed"])
    ).scalar() or 0
    
    total_revenue_result = db.query(func.sum(models.Order.total_amount)).filter(
        models.Order.status.in_(["Paid", "Completed"])
    ).scalar()
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0

    best_selling_name = "Butter Croissant" # Default fallback for the hackathon
    if hasattr(models, 'OrderItem'):
        top_item = db.query(
            models.OrderItem.product_id, 
            func.sum(models.OrderItem.quantity).label('total_qty')
        ).group_by(models.OrderItem.product_id).order_by(
            func.sum(models.OrderItem.quantity).desc()
        ).first()

        if top_item:
            product = db.query(models.Product).filter(models.Product.id == top_item.product_id).first()
            if product:
                best_selling_name = product.name

    summary_text = (
        f"Today was a fantastic shift! You processed {total_orders} orders generating "
        f"${total_revenue:.2f} in revenue. Your top-selling item was the {best_selling_name}. "
        "Keep up the great work during the afternoon rush!"
    )

    return {"summary": summary_text}
