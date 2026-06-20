import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import KitchenDisplaySystem from './components/KitchenDisplaySystem';
import CustomerFacingDisplay from './components/CustomerFacingDisplay';
import SelfOrderingMenu from './components/SelfOrderingMenu';

// Retaining your design assets if needed for splash screens later
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dynamic Client App Redirection Targets */}
        <Route path="/" element={<Navigate to="/customer-display" replace />} />

        {/* 1. Kitchen Display System (KDS) Screen Layout Mapping */}
        <Route path="/kds" element={<KitchenDisplaySystem />} />

        {/* 2. Customer Facing Display Endpoint Mapping */}
        <Route path="/customer-display" element={<CustomerFacingDisplay />} />

        {/* 3. QR Customer Self-Ordering Endpoint Mapping */}
        <Route path="/s/:token" element={<SelfOrderingMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;