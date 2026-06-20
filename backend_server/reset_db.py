import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
import models
from passlib.context import CryptContext
import json
import random

# Recreate all tables
print("Dropping all existing tables...")
models.Base.metadata.drop_all(bind=engine)
print("Creating all tables from scratch...")
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("Seeding Users...")
admin = models.User(name="Admin User", email="admin@cafe.com", hashed_password=pwd_context.hash("admin123"), role="admin")
employee = models.User(name="Cashier John", email="john@cafe.com", hashed_password=pwd_context.hash("pos123"), role="employee")
kds_user = models.User(name="KDS Display", email="kds@cafe.com", hashed_password=pwd_context.hash("kds123"), role="kds")
db.add_all([admin, employee, kds_user])
db.commit()

print("Seeding Tables (Floor Plan)...")
tables = [
    models.Table(number=1, seats=2),
    models.Table(number=2, seats=2),
    models.Table(number=3, seats=4),
    models.Table(number=4, seats=4),
    models.Table(number=5, seats=6),
    models.Table(number=6, seats=8)
]
db.add_all(tables)
db.commit()

print("Seeding Coupons...")
coupons = [
    models.Coupon(code="WELCOME10", discount_type="percentage", value=10.0),
    models.Coupon(code="FESTIVE20", discount_type="percentage", value=20.0),
    models.Coupon(code="VIP50", discount_type="percentage", value=50.0),
    models.Coupon(code="FLAT100", discount_type="fixed", value=100.0),
    models.Coupon(code="NEWUSER", discount_type="percentage", value=15.0),
    models.Coupon(code="SUMMER", discount_type="fixed", value=50.0),
    models.Coupon(code="CAFE10", discount_type="percentage", value=10.0)
]
db.add_all(coupons)
db.commit()

print("Seeding Categories and Products...")
colors = ["#6F4E37", "#87CEEB", "#F5DEB3", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD", "#D4A5A5", "#A8E6CF", "#FFD3B6", "#FFAAA5"]

# Generate a basic list of mock categories to ensure we don't need the json file
mock_data = [
  {"categoryName": "Hot Coffee", "itemTypes": ["Espresso", "Americano", "Cappuccino", "Latte", "Mocha", "Flat White"]},
  {"categoryName": "Cold Beverages", "itemTypes": ["Iced Latte", "Cold Brew", "Frappuccino", "Lemonade", "Iced Tea"]},
  {"categoryName": "Pastries & Food", "itemTypes": ["Butter Croissant", "Blueberry Muffin", "Avocado Toast", "Bagel with Cream Cheese", "Cinnamon Roll"]},
  {"categoryName": "Burgers", "itemTypes": ["Classic Veg Burger", "Cheese Burger", "Crispy Chicken Burger", "Mushroom Burger"]},
  {"categoryName": "Pizzas", "itemTypes": ["Margherita Pizza", "Farmhouse Pizza", "Pepperoni Pizza", "BBQ Chicken Pizza"]},
  {"categoryName": "Pasta", "itemTypes": ["Alfredo Pasta", "Arrabbiata Pasta", "Pink Sauce Pasta", "Pesto Pasta"]},
  {"categoryName": "Desserts", "itemTypes": ["Chocolate Truffle Cake", "Cheesecake", "Brownie with Ice Cream", "Tiramisu"]}
]

for cat_info in mock_data:
    cat_name = cat_info['categoryName']
    color = random.choice(colors)
    
    cat = models.Category(name=cat_name, color=color)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    
    for item_name in cat_info['itemTypes']:
        # Assign realistic prices between 150 and 450
        price = random.choice([150.0, 180.0, 200.0, 220.0, 250.0, 280.0, 300.0, 350.0, 380.0, 400.0, 450.0])
        
        # Consistent pricing for specific known items
        if "Espresso" in item_name: price = 150.0
        elif "Americano" in item_name: price = 180.0
        elif "Cappuccino" in item_name: price = 250.0
        elif "Latte" in item_name: price = 250.0
        elif "Iced Latte" in item_name: price = 280.0
        elif "Cold Brew" in item_name: price = 300.0
        elif "Croissant" in item_name: price = 200.0
        elif "Avocado Toast" in item_name: price = 350.0
        elif "Pizza" in item_name: price = 450.0
        elif "Burger" in item_name: price = 300.0
        
        prod = models.Product(name=item_name, category_id=cat.id, price=price)
        db.add(prod)

db.commit()
db.close()
print("✅ Successfully recreated and seeded the entire database!")
