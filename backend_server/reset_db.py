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

# ── 1. Users ────────────────────────────────────────────────────────
print("Seeding Users...")
admin = models.User(name="Admin User", email="admin@cafe.com", hashed_password=pwd_context.hash("admin123"), role="admin")
employee = models.User(name="Cashier John", email="john@cafe.com", hashed_password=pwd_context.hash("pos123"), role="employee")
kds_user = models.User(name="KDS Display", email="kds@cafe.com", hashed_password=pwd_context.hash("kds123"), role="kds")
db.add_all([admin, employee, kds_user])
db.commit()

# ── 2. Tables (Floor Plan) ─────────────────────────────────────────
print("Seeding Tables (Floor Plan)...")
tables = [
    models.Table(number=1, seats=2),
    models.Table(number=2, seats=2),
    models.Table(number=3, seats=4),
    models.Table(number=4, seats=4),
    models.Table(number=5, seats=6),
    models.Table(number=6, seats=8),
    models.Table(number=7, seats=2),
    models.Table(number=8, seats=4),
    models.Table(number=9, seats=4),
    models.Table(number=10, seats=6),
    models.Table(number=11, seats=2),
    models.Table(number=12, seats=4),
]
db.add_all(tables)
db.commit()

# ── 3. Customers ───────────────────────────────────────────────────
print("Seeding Customers...")
customers = [
    models.Customer(name="Alice Johnson", email="alice@example.com", phone_number="555-0199"),
    models.Customer(name="Robert Smith", email="robert@example.com", phone_number="555-0144"),
    models.Customer(name="Elena Rodriguez", email="elena@example.com", phone_number="555-0177"),
    models.Customer(name="David Chen", email="david@example.com", phone_number="555-0133"),
    models.Customer(name="Priya Sharma", email="priya@example.com", phone_number="555-0155"),
]
db.add_all(customers)
db.commit()

# ── 4. Coupons ─────────────────────────────────────────────────────
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

# ── 5. Payment Methods ────────────────────────────────────────────
print("Seeding Payment Methods...")
payment_methods = [
    models.PaymentMethod(name="Cash", is_active=True),
    models.PaymentMethod(name="Digital/Card Terminal", is_active=True),
    models.PaymentMethod(name="UPI Dynamic QR", is_active=True),
]
db.add_all(payment_methods)
db.commit()

# ── 6. Categories & Products from items.json ──────────────────────
print("Seeding Categories and Products from items.json...")

# Load the JSON data files from the frontend
_script_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_script_dir)
items_json_path = os.path.join(_project_root, "src", "data", "items.json")
categories_json_path = os.path.join(_project_root, "src", "data", "categories.json")

colors = ["#6F4E37", "#87CEEB", "#F5DEB3", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD", "#D4A5A5", "#A8E6CF", "#FFD3B6", "#FFAAA5"]

# Price map for realistic pricing
price_map = {
    "Espresso": 150, "Americano": 180, "Cappuccino": 250, "Latte": 250,
    "Masala Tea": 80, "Green Tea": 100, "Cold Coffee": 200, "Fresh Lime Soda": 120,
    "Virgin Mojito": 180, "Fruit Punch": 200,
    "Pancakes": 220, "Waffles": 250, "French Toast": 200, "Omelette": 180,
    "Scrambled Eggs": 160, "Breakfast Platter": 350, "Avocado Toast": 300, "Granola Bowl": 280,
    "Veg Grilled Sandwich": 180, "Club Sandwich": 250, "Cheese Corn Sandwich": 200,
    "Paneer Sandwich": 220, "Chicken Sandwich": 280, "Tuna Sandwich": 320,
    "Classic Veg Burger": 250, "Cheese Burger": 280, "Crispy Chicken Burger": 320,
    "Paneer Burger": 260, "Mushroom Burger": 280,
    "Margherita Pizza": 350, "Farmhouse Pizza": 400, "Veggie Delight Pizza": 380,
    "Pepperoni Pizza": 450, "BBQ Chicken Pizza": 480,
    "Alfredo Pasta": 300, "Arrabbiata Pasta": 280, "Pink Sauce Pasta": 300,
    "Pesto Pasta": 320, "Mac and Cheese": 280,
    "Paneer Tikka Wrap": 250, "Chicken Wrap": 280, "Falafel Wrap": 260,
    "Veggie Wrap": 220, "Mexican Wrap": 280,
    "Caesar Salad": 250, "Greek Salad": 220, "Garden Salad": 180,
    "Chicken Salad": 300, "Quinoa Salad": 280,
    "Tomato Soup": 150, "Sweet Corn Soup": 150, "Hot and Sour Soup": 160,
    "Mushroom Soup": 180, "Chicken Clear Soup": 200,
    "French Fries": 150, "Peri Peri Fries": 180, "Potato Wedges": 160,
    "Garlic Bread": 120, "Cheese Garlic Bread": 160, "Onion Rings": 180,
    "Nachos": 200, "Spring Rolls": 180, "Mozzarella Sticks": 250,
    "Veg Nuggets": 200, "Chicken Nuggets": 250, "Loaded Nachos": 280,
    "Chocolate Pastry": 150, "Black Forest Pastry": 180, "Red Velvet Pastry": 200,
    "Butterscotch Pastry": 160, "Blueberry Pastry": 180,
    "Chocolate Truffle Cake": 350, "Cheesecake": 300, "Red Velvet Cake": 350,
    "Carrot Cake": 250, "Fruit Cake": 280,
    "Brownie with Ice Cream": 250, "Tiramisu": 350, "Mousse": 200,
    "Waffle Sundae": 300, "Caramel Pudding": 180,
    "Coffee and Sandwich Combo": 350, "Burger Fries and Coke Combo": 400,
    "Pizza and Mocktail Combo": 500, "Pasta and Garlic Bread Combo": 380,
    "Cake and Coffee Combo": 400,
}

if os.path.exists(items_json_path):
    with open(items_json_path, 'r', encoding='utf-8-sig') as f:
        items_data = json.load(f)
    
    for cat_group in items_data:
        cat_id = cat_group["categoryId"]
        cat_name = cat_group["categoryName"]
        color = colors[(cat_id - 1) % len(colors)]
        
        # Create category with matching ID
        cat = models.Category(id=cat_id, name=cat_name, color=color)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        
        for item_name in cat_group.get("itemTypes", []):
            price = price_map.get(item_name, 80 + (len(item_name) * 5))
            prod = models.Product(
                name=item_name,
                category_id=cat.id,
                price=float(price),
                tax_percentage=5.0,
                description=f"Freshly prepared {item_name}"
            )
            db.add(prod)
    
    db.commit()
else:
    print("⚠️  items.json not found, seeding fallback categories/products...")
    # Fallback mock data
    mock_data = [
      {"categoryName": "Hot Coffee", "itemTypes": ["Espresso", "Americano", "Cappuccino", "Latte", "Mocha", "Flat White"]},
      {"categoryName": "Cold Beverages", "itemTypes": ["Iced Latte", "Cold Brew", "Frappuccino", "Lemonade", "Iced Tea"]},
      {"categoryName": "Pastries & Food", "itemTypes": ["Butter Croissant", "Blueberry Muffin", "Avocado Toast", "Bagel with Cream Cheese", "Cinnamon Roll"]},
      {"categoryName": "Burgers", "itemTypes": ["Classic Veg Burger", "Cheese Burger", "Crispy Chicken Burger", "Mushroom Burger"]},
      {"categoryName": "Pizzas", "itemTypes": ["Margherita Pizza", "Farmhouse Pizza", "Pepperoni Pizza", "BBQ Chicken Pizza"]},
      {"categoryName": "Pasta", "itemTypes": ["Alfredo Pasta", "Arrabbiata Pasta", "Pink Sauce Pasta", "Pesto Pasta"]},
      {"categoryName": "Desserts", "itemTypes": ["Chocolate Truffle Cake", "Cheesecake", "Brownie with Ice Cream", "Tiramisu"]}
    ]

    for i, cat_info in enumerate(mock_data):
        cat = models.Category(name=cat_info['categoryName'], color=random.choice(colors))
        db.add(cat)
        db.commit()
        db.refresh(cat)
        
        for item_name in cat_info['itemTypes']:
            price = price_map.get(item_name, random.choice([150.0, 200.0, 250.0, 300.0, 350.0, 400.0]))
            prod = models.Product(name=item_name, category_id=cat.id, price=float(price), tax_percentage=5.0)
            db.add(prod)
    
    db.commit()

db.close()
print("[OK] Successfully recreated and seeded the entire database!")
print("   - Users: admin@cafe.com/admin123, john@cafe.com/pos123, kds@cafe.com/kds123")
print("   - Tables: 12 tables seeded")
print("   - Customers: 5 sample customers")
print("   - Coupons: 7 promo codes")
print("   - Payment Methods: Cash, Card, UPI")
print("   - Categories & Products: seeded from items.json")

