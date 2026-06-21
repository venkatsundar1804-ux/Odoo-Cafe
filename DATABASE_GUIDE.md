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

### Advanced SQLite CLI Commands
When inside the `sqlite3>` prompt, these dot-commands are incredibly useful for formatting and inspecting the database:

- **`.tables`** : Lists all tables in the database.
- **`.schema [table_name]`** : Shows the `CREATE TABLE` statement used to create a table.
- **`.mode column`** : Changes the output format to neatly aligned columns (highly recommended).
- **`.headers on`** : Displays the column names at the top of query results.
- **`.dump [table_name]`** : Dumps the entire database (or a specific table) as SQL text.
- **`.quit`** or **`.exit`** : Exits the sqlite3 prompt.
- **`.clear`** : Clears the screen.
- **`.databases`** : Lists names and files of attached databases.
- **`.show`** : Displays the current settings for various formats.

### Advanced SQL Queries for Odoo Cafe

**1. View orders with their items:**
```sql
SELECT o.id as order_id, o.status, o.total_amount, i.product_name, i.quantity 
FROM orders o 
JOIN order_items i ON o.id = i.order_id;
```

**2. See total revenue grouped by payment method:**
```sql
SELECT payment_method, SUM(amount) as total_revenue, COUNT(*) as transaction_count 
FROM transactions 
WHERE status = 'Completed' 
GROUP BY payment_method;
```

**3. Find the most popular menu items:**
```sql
SELECT product_name, SUM(quantity) as total_sold 
FROM order_items 
GROUP BY product_name 
ORDER BY total_sold DESC 
LIMIT 5;
```

**4. Check Employee Register Session details:**
```sql
SELECT id, employee_id, start_time, end_time, expected_cash, is_open 
FROM pos_sessions;
```

**5. Delete a specific order (and cascade):**
```sql
DELETE FROM orders WHERE id = 12;
-- (Note: you may need to delete associated order_items and transactions manually if cascade is not enabled)
```

*(To exit the sqlite prompt, type `.quit` or press `Ctrl+C`)*
