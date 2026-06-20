import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import CategoryAdmin from './pages/admin/CategoryAdmin';
import Home from './pages/admin/Home';
import POS from './pages/POS';
import Payments from './pages/admin/Payments';
import Coupons from './pages/admin/Coupons';
import Products from './pages/admin/Products';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pos" element={<POS />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<CategoryAdmin />} />
          <Route path="payments" element={<Payments />} />
          <Route path="coupons" element={<Coupons />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
