# Odoo Cafe POS - Custom Branch Features (Preserved)

Before discarding this branch in favor of the full backend-integrated `prototype` branch, we preserved this summary of the custom front-end architecture and UI features built in this branch. 

These features can be referenced or ported into the final prototype branch later.

## 🌟 Best Features Built Here

### 1. Backend-Free Tab Synchronization (`BroadcastChannel`)
- **Location:** `src/store/tableStore.js`
- **What it does:** Uses the native browser `BroadcastChannel` API to instantly sync Zustand state across multiple open browser tabs.
- **Why it's cool:** When a waiter selects a table in Tab A, it instantly switches to "Occupied" in Tab B without needing WebSockets or a backend polling loop.

### 2. Glassmorphism Auth Flow & Interception
- **Locations:** `src/pages/AuthPage.jsx`, `src/pages/Checkout.jsx`
- **What it does:** A dual-panel sliding authentication screen (Sign In / Sign Up) built with Tailwind backdrops. It intelligently intercepts unauthenticated users at the Checkout screen, redirects them to Login with a `?redirect=/checkout` query parameter, and sends them right back upon success.

### 3. Cinematic POS Layout
- **Location:** `src/pages/POS.jsx`
- **What it does:** A highly artistic, immersive Point-of-Sale screen for cashiers/customers. Features a massive rotating hero image, an infinite scroll product carousel (using framer-motion), and glass backdrop UI over abstract ambient blobs.

### 4. Floating Product Grid
- **Location:** `src/components/OrderView/ProductGrid.jsx`
- **What it does:** Product cards with images that physically break out of the top border (`absolute -top-12`) with smooth, cinematic hover scaling (`group-hover:scale-110`).

### 5. Pixel-Perfect Admin Dashboard
- **Locations:** `src/layouts/AdminLayout.jsx`, `src/pages/admin/Home.jsx`, `src/pages/admin/Products.jsx`
- **What it does:** We transitioned the dark-mode table interface into a stunning, light-mode dashboard.
  - Used specific pastel hex colors (`#f8f9fa` backgrounds, `#c25a17` active states).
  - Built extremely soft, premium shadows (`shadow-[0_4px_20px_rgba(0,0,0,0.03)]`) and `3xl` border radiuses for the stat cards.
