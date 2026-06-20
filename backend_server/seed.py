from database import SessionLocal, engine
import models
from passlib.context import CryptContext

# Set up password hashing for the seed users
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database():
    db = SessionLocal()

    print("🌱 Starting database seed...")

    # 1. Seed Users (Admin & Employee)
    if not db.query(models.User).first():
        admin = models.User(name="Admin User", email="admin@cafe.com", hashed_password=pwd_context.hash("admin123"), role="admin")
        employee = models.User(name="Cashier John", email="john@cafe.com", hashed_password=pwd_context.hash("pos123"), role="employee")
        db.add_all([admin, employee])
        print("✅ Users seeded.")

    # 2. Seed Categories (with colors for the frontend UI)
    if not db.query(models.Category).first():
        cat_coffee = models.Category(name="Hot Coffee", color="#6F4E37")
        cat_cold = models.Category(name="Cold Beverages", color="#87CEEB")
        cat_food = models.Category(name="Pastries & Food", color="#F5DEB3")
        db.add_all([cat_coffee, cat_cold, cat_food])
        db.commit() # Commit here so we can use their IDs for products
        print("✅ Categories seeded.")

    # 3. Seed Products
    if not db.query(models.Product).first():
        # Hot Coffee
        db.add(models.Product(name="Espresso", price=2.50, category_id=1))
        db.add(models.Product(name="Cappuccino", price=4.00, category_id=1))
        db.add(models.Product(name="Latte", price=4.50, category_id=1))
        
        # Cold Beverages
        db.add(models.Product(name="Iced Latte", price=5.00, category_id=2))
        db.add(models.Product(name="Cold Brew", price=4.50, category_id=2))
        
        # Food
        db.add(models.Product(name="Butter Croissant", price=3.50, category_id=3))
        db.add(models.Product(name="Blueberry Muffin", price=3.00, category_id=3))
        db.add(models.Product(name="Avocado Toast", price=7.50, category_id=3))
        print("✅ Products seeded.")

    # 4. Seed Tables (Floor Plan)
    if not db.query(models.Table).first():
        tables = [
            models.Table(number=1, seats=2),
            models.Table(number=2, seats=2),
            models.Table(number=3, seats=4),
            models.Table(number=4, seats=4),
            models.Table(number=5, seats=6) # Big table
        ]
        db.add_all(tables)
        print("✅ Tables seeded.")

    db.commit()
    db.close()
    print("🚀 Seeding complete! Your frontend team now has data.")

if __name__ == "__main__":
    # Ensure tables exist before seeding
    models.Base.metadata.create_all(bind=engine)
    seed_database()
