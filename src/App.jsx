import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import CategoryAdmin from './pages/admin/CategoryAdmin';
import POS from './pages/POS';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div className="p-4">Auth Page</div>} />
        <Route path="/pos" element={<POS />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<CategoryAdmin />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
