# Odoo Cafe Prototype

Odoo Cafe is a modern, high-performance web-based Point of Sale (POS) system designed specifically for cafes. It features an immersive, cinematic self-service checkout flow, real-time Kitchen Display System (KDS) synchronization, and a beautiful pixel-perfect admin dashboard.

## 🌟 Key Features

### Frontend (React + Vite)
- **Cinematic POS Layout:** Immersive self-service kiosk mode with a massive rotating hero image and infinite-scroll product carousels powered by `framer-motion`.
- **Backend-Free Tab Synchronization:** Utilizes the browser's native `BroadcastChannel` API to instantly sync tab states (e.g., table occupancy) without relying on WebSockets or backend polling.
- **Glassmorphism Auth Flow & Interception:** A dual-panel sliding authentication screen built with Tailwind backdrops that intelligently intercepts unauthenticated users and redirects them properly.
- **Floating Product Grid:** Modern 3D product cards that break out of traditional boundaries with cinematic hover scaling.
- **Pixel-Perfect Admin Dashboard:** A stunning light-mode administrative interface featuring soft, premium shadows and meticulously chosen pastel color palettes for reduced eye strain.
- **Real-time KDS & Notifications:** WebSockets integration via `zustand` to listen for backend order events and automatically show toast notifications to customers when their order is ready.

### Backend (Python + FastAPI)
- **FastAPI Core:** High-performance async API for creating, updating, and reading orders, users, and tables.
- **Real-Time WebSockets:** `ConnectionManager` pushing real-time order updates to connected KDS devices instantly after checkout.
- **SQLite Database Integration:** SQLAlchemy ORM managing persistent storage across `users`, `products`, `tables`, `orders`, and `coupons`.
- **Live Analytics Processing:** Computes real-time sales performance metrics for the admin and executive dashboards natively from database records.
- **Automated Table Management:** Frees tables dynamically via `BroadcastChannel` and robust session tracking.

---

## 🛠️ Tech Stack

**Frontend Architecture:**
*   **Framework:** React 19 + Vite
*   **Styling:** TailwindCSS + PostCSS + Vanilla CSS (`index.css`)
*   **State Management:** Zustand (with persist and `BroadcastChannel` middleware)
*   **Routing:** React Router DOM (v7)
*   **Animation:** Framer Motion
*   **Icons:** Lucide React

**Backend Architecture:**
*   **Framework:** FastAPI
*   **Database:** SQLite + SQLAlchemy
*   **Auth:** Passlib (Bcrypt) + Custom JWT Simulation
*   **Real-time:** FastAPI WebSockets (`/ws/kds`, `/ws/cfd`)
*   **Server:** Uvicorn

---

## 🚀 Setup & Installation

### 1. Prerequisites
- **Node.js:** v18+ 
- **Python:** 3.10+

### 2. Backend Setup
Navigate to the backend directory and install the necessary dependencies:

```bash
cd backend_server
pip install -r requirements.txt # (or install fastAPI, uvicorn, sqlalchemy, passlib)
```

Run the backend development server on port 8000:
```bash
python -m uvicorn main:app --reload --port 8000
```
*Note: The FastAPI application runs on `http://127.0.0.1:8000` and automatically builds the SQLite database (`sql_app.db`) on initialization.*

### 3. Frontend Setup
Open a new terminal session in the project root:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The React frontend will be available at `http://localhost:5173`. API requests to `/api` and WebSockets to `/ws` will automatically be proxied to the FastAPI backend running on port `8000` (as configured in `vite.config.js`).

---

## 🏗️ Future Development Roadmap
- Full external payment gateway integration.
- Migrate SQLite to PostgreSQL for high-concurrency production deployments.
- Build native Android companion application for Waiter terminals using existing APIs.
