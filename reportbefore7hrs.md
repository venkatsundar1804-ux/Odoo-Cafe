# Odoo Cafe - Project Report

## Overview
Odoo Cafe is a modern, real-time Point of Sale (POS) and cafe management system. It features a rich, animated user interface and a fully decoupled backend, enabling seamless cross-device synchronization for cashiers, kitchen staff, and customers.

---

## Technology Stack

### Frontend
* **Core:** React 19, Vite
* **Styling & UI:** Tailwind CSS, Framer Motion (for fluid, cinematic animations)
* **Icons:** Lucide React
* **State Management:** Zustand (with local persistence)
* **Routing:** React Router v7
* **Cross-Tab Communication:** BroadcastChannel API

### Backend
* **Core:** FastAPI (Python)
* **Database:** SQLite with SQLAlchemy ORM
* **Real-time Communication:** WebSockets (for KDS, CFD, and Coupon syncing)
* **Authentication:** JWT (JSON Web Tokens), Passlib with Bcrypt hashing
* **Server:** Uvicorn

---

## Core Features

1. **Point of Sale (POS) & Checkout:**
   - Cinematic and grid product viewing modes.
   - Dynamic cart management with instant subtotal/tax calculations.
   - Integrated simulated payment gateway (Razorpay mockup) supporting Cash, UPI, Cards, Wallets, and Netbanking.

2. **Real-Time Kitchen Display System (KDS):**
   - WebSockets-powered interface for kitchen staff.
   - Real-time order pop-ups and status transitions (`To Cook` -> `Preparing` -> `Completed`).
   - Line-item strike-through functionality.

3. **Customer Facing Display (CFD):**
   - Real-time cart mirroring via WebSockets linked to specific tables.
   - Instant "Payment Successful" animations upon checkout completion.

4. **Employee Dispatch Dashboard:**
   - **Incoming Queue:** Holds cash orders pending physical payment verification.
   - **Live Kitchen Tracking:** Auto-tracks digital payments (Cards, UPI) and dispatched cash orders.
   - Shift and register management (opening/closing amounts).

5. **Advanced Coupon & Promotion System:**
   - Flat and percentage-based discounts.
   - Item-specific promotional codes.
   - Real-time WebSocket synchronization of active coupons across all active cashier and admin screens.

6. **Admin Analytics & Management:**
   - User and role management (Admin, Employee, Customer, KDS).
   - Table/Floor plan management and capacity tracking.
   - Menu management (Categories and Products).
   - AI-simulated dashboard summaries and financial metrics.

---

## Typical Order Workflow

1. **Order Creation:** A customer or cashier adds items to the cart using the POS interface. The cart is simultaneously mirrored to the CFD.
2. **Discount Application:** The user applies a generic or item-specific promo code, which is instantly validated against the backend.
3. **Checkout & Payment:** 
   - **Digital Payment (Card/UPI/Wallet):** The payment is processed online. The order is automatically marked as `sent` and bypassed directly to the Kitchen (KDS).
   - **Cash Payment:** The order is marked as `pending` and sent to the Employee Dashboard's "Incoming Queue".
4. **Verification & Dispatch:** For cash orders, the cashier verifies the money and clicks "Confirm & Dispatch", which routes the order to the kitchen.
5. **Kitchen Processing:** The kitchen receives a real-time WebSocket ping. As they prepare the food, they update the order status via the KDS.
6. **Fulfillment:** Once the kitchen marks the order as `Completed`, the cashier's Live Tracking dashboard turns green. The cashier hands over the food and clicks "Mark Delivered", concluding the lifecycle.
