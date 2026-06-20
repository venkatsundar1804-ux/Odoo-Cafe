import json
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models

client = TestClient(app)

def setup_db():
    db = SessionLocal()
    # Ensure there's a coupon
    if not db.query(models.Coupon).first():
        db.add(models.Coupon(code="TEST10", discount_type="percentage", value=10.0, is_active=True))
        db.commit()
    db.close()

def test_api():
    setup_db()
    
    print("--- 1. Testing Bad Data ---")
    response = client.post("/api/orders/", json={
        "table_id": 1,
        "items": [{"product_id": 999, "quantity": 1}]
    })
    print(f"POST /api/orders/ (Bad ID) -> Status: {response.status_code}")
    print(f"Response: {response.json()}")

    print("\n--- 2. Testing The Math ---")
    response = client.post("/api/orders/", json={
        "table_id": 1,
        "coupon_code": "TEST10",
        "items": [{"product_id": 1, "quantity": 2}] # Assuming product 1 exists from seed (Espresso 2.50)
    })
    print(f"POST /api/orders/ (With Coupon) -> Status: {response.status_code}")
    order_data = response.json()
    print(f"Response: {json.dumps(order_data, indent=2)}")

    print("\n--- 3. Verifying Export ---")
    db = SessionLocal()
    if order_data.get('id'):
        order = db.query(models.Order).filter(models.Order.id == order_data['id']).first()
        order.status = "Paid"
        db.commit()
    db.close()

    response = client.get("/api/reports/export")
    print(f"GET /api/reports/export -> Status: {response.status_code}")
    print("CSV Content Snippet:")
    print(response.text[:200])

    print("\n--- 4. Triggering AI Summary ---")
    response = client.get("/api/reports/ai-summary")
    print(f"GET /api/reports/ai-summary -> Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    test_api()
