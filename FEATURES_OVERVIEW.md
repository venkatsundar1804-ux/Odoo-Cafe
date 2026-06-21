# Odoo Cafe: Features & Workflow Overview

Odoo Cafe is a modern, real-time Point of Sale (POS) and Cafe Management system. It is built with a React/Vite frontend and a FastAPI (Python) backend, synchronized via WebSockets and local BroadcastChannels for an instant, seamless experience.

## 1. Landing Page & Table Management
- **Interactive Floor Plan**: Customers and staff can view all available tables in the cafe. 
- **Real-Time Occupancy**: If a customer selects a table, it instantly shows as "Occupied" (or assigned to that user) for everyone else.
- **Auto-Routing**: Selecting a table seamlessly routes the user to the POS system specifically for that table.

## 2. Customer POS & Menu
- **Dynamic Menu**: Fetches real categories and products directly from the database.
- **Smart Cart**: Automatically calculates taxes, tracks item quantities, and allows quick modifications.
- **Real-Time Promotions**: Customers can apply promo codes created by staff. The system validates them via the backend in real-time (supporting percentage, flat-rate, and item-specific discounts).
- **Checkout Flow**: Fully integrated mock checkout supporting multiple payment methods.

## 3. Employee Dashboard (Admin Hub)
The Employee Dashboard is the central command center for staff.
- **Register Control**: Staff can "Start Shift" by opening a POS session, inputting the expected cash-in-hand, and safely closing the register at the end of the shift.
- **Incoming Queue**: All customer orders (regardless of payment method) route directly to the "Incoming Queue". Staff review the payment, verify it, and hit **Dispatch** to send it to the Kitchen.
- **Live Kitchen Tracking**: Once dispatched, staff can monitor the order's status as it is prepared by the kitchen and mark it as "Delivered" once handed to the customer.
- **Promo Code Management**: Staff can instantly generate new promo codes, specifying if they are flat discounts or percentages.
- **Payment Method Toggling**: Staff can instantly activate or deactivate specific payment methods (like UPI, Card, Netbanking). If deactivated, it instantly vanishes from the customer checkout screen.
- **Global Reset**: Staff can instantly free up all tables in the restaurant with a single click.

## 4. Kitchen Display System (KDS)
- **Real-time Queue**: The KDS connects via WebSockets to instantly receive orders the moment an employee dispatches them.
- **Order States**: Kitchen staff can see what needs to be prepared. Once finished, they click a button to mark the order as "Completed", instantly notifying the Employee Dashboard that the food is ready for delivery.

## 5. Security & Authentication
- **Role-Based Access**: The system distinguishes between `customer`, `employee`, and `kds` roles.
- **Smart Routing**: Logging in as an employee automatically routes you to the Employee Dashboard; logging in as KDS routes you directly to the Kitchen screen.

## Workflow Summary
1. **Customer** selects a table and adds items to their cart.
2. **Customer** pays via the Checkout Modal (using UPI/Card/etc.).
3. The order appears in the **Employee Dashboard** as `Pending`.
4. The **Employee** verifies the transaction and clicks "Dispatch".
5. The order instantly appears on the **KDS** (Kitchen Display System).
6. The Kitchen prepares the food and marks it `Completed`.
7. The Employee sees the order is ready, serves the customer, and marks the order as `Delivered`.
8. The customer's table is automatically freed up for the next guest!
