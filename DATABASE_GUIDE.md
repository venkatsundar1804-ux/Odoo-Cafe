# Odoo Cafe: Database Architecture & CLI Guide

Odoo Cafe utilizes an SQLite relational database managed by SQLAlchemy and FastAPI.

## Database Location
The active database file is stored at:
`d:\Odoo Cafe\backend_server\sql_app.db`

## Database Models & Tables
The database consists of several core tables to manage the application state:
- **users**: Stores authentication credentials, roles (`customer`, `employee`, `kds`), and active statuses.
- **categories**: Stores menu categories with specific color codes.
- **products**: Stores all menu items, linked to categories with pricing.
- **orders**: The central tracking table for all customer orders, including total amounts, table assignments, and states (`pending`, `sent`, `Preparing`, `Completed`).
- **order_items**: Maps products and quantities to specific orders.
- **transactions**: Logs all mock payments, recording the `order_id`, amount, and payment method used (Card, UPI, Cash).
- **coupons**: Stores active and inactive promotional codes, tracking flat/percentage discounts and linked products.
- **payment_methods**: Stores the available payment gateways (`Cash`, `Digital/Card Terminal`, `UPI Dynamic QR`, `Netbanking`) and their active state for checkout filtering.
- **pos_sessions**: Tracks Employee shift sessions, including expected cash-in-hand and closing amounts.

## Important Commands

All backend commands should be run from within the `backend_server` directory.

**1. Reset & Seed the Database**
If you ever need to completely wipe the database and re-seed it with the default Menu Items, Users, and Settings, run the database reset script:
```powershell
cd backend_server
python reset_db.py
```
*(Warning: This will delete all active orders and transactions!)*

**2. Start the Backend Server**
To run the FastAPI server (which handles WebSockets, REST APIs, and database reads):
```powershell
cd backend_server
uvicorn main:app --reload
```

## How to Access & Query the Database Directly

Since Odoo Cafe uses SQLite, you can natively interact with the database directly from your command line using the `sqlite3` tool.

**1. Open the SQLite shell**
```powershell
cd "d:\Odoo Cafe\backend_server"
sqlite3 sql_app.db
```

**2. Common SQL Commands**
Once inside the `sqlite3>` prompt, you can run native SQL commands:

- **See all tables:**
  ```sql
  .tables
  ```
- **View all registered users:**
  ```sql
  SELECT * FROM users;
  ```
- **Check current active orders:**
  ```sql
  SELECT id, status, total_amount FROM orders WHERE status != 'Completed';
  ```
- **View available payment methods:**
  ```sql
  SELECT * FROM payment_methods;
  ```
- **Manually update a value (e.g., enable UPI):**
  ```sql
  UPDATE payment_methods SET is_active = 1 WHERE name = 'UPI Dynamic QR';
  ```

*(To exit the sqlite prompt, type `.quit` or press `Ctrl+C`)*
