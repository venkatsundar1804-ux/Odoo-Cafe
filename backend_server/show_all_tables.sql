.mode column
.headers on
.nullvalue NULL

.print "\n==================== USERS ===================="
SELECT * FROM users;

.print "\n================ PAYMENT METHODS ================"
SELECT * FROM payment_methods;

.print "\n================== CATEGORIES =================="
SELECT * FROM categories;

.print "\n================= POS SESSIONS ================="
SELECT * FROM pos_sessions;

.print "\n=================== COUPONS ==================="
SELECT * FROM coupons;

.print "\n=================== ORDERS ==================="
SELECT * FROM orders LIMIT 10;

.print "\n================= TRANSACTIONS ================="
SELECT * FROM transactions LIMIT 10;

.print "\n================== PRODUCTS (Sample) =================="
SELECT * FROM products LIMIT 15;
