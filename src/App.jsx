import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/admin/Home';
import Payments from './pages/admin/Payments';
import Coupons from './pages/admin/Coupons';
import Products from './pages/admin/Products';
import OrderView from './pages/OrderView';
import FloorSelection from './pages/FloorSelection';
import POS from './pages/POS';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import AuthPage from './pages/AuthPage';
import { useTableStore } from './store/tableStore';

// Pre-route check to force table selection
function TableRequired({ children }) {
  const [searchParams] = useSearchParams();
  const tableIdFromUrl = searchParams.get('table_id');
  const currentTableId = useTableStore((state) => state.currentTableId);

  const activeTableId = tableIdFromUrl || currentTableId;

  if (!activeTableId) {
    return <Navigate to="/floor" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        <Route path="/floor" element={<FloorSelection />} />
        
        {/* Our Cinematic POS screen */}
        <Route path="/pos" element={<POS />} />
        
        {/* Our New Checkout Screen */}
        <Route path="/checkout" element={<Checkout />} />

        {/* Our New Payment Screen */}
        <Route path="/payment" element={<Payment />} />

        {/* Upstream Order View with Table Requirements */}
        <Route path="/orderview" element={
          <TableRequired>
            <OrderView />
          </TableRequired>
        } />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="payments" element={<Payments />} />
          <Route path="coupons" element={<Coupons />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
