import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div className="p-4">Auth Page</div>} />
        <Route path="/pos" element={<div className="p-4">POS Terminal</div>} />
        <Route path="/admin" element={<div className="p-4">Admin Dashboard</div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
