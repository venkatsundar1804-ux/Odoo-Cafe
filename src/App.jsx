import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import CategoryAdmin from './pages/admin/CategoryAdmin';
import Home from './pages/admin/Home';
import Payments from './pages/admin/Payments';
import Coupons from './pages/admin/Coupons';
import Products from './pages/admin/Products';
import OrderView from './pages/OrderView';
import FloorSelection from './pages/FloorSelection';
import KitchenDisplay from './pages/KitchenDisplay';
import Dashboard from './pages/admin/Dashboard';
import CustomerDisplay from './pages/CustomerDisplay';
import CustomerManagement from './pages/CustomerManagement';
import { useTableStore } from './store/tableStore';

// Table selection guard
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
        <Route path="/login" element={<div className="p-4">Auth Page</div>} />
        <Route path="/floor" element={<FloorSelection />} />
        <Route path="/kds" element={<KitchenDisplay />} />
        <Route path="/cfd" element={<CustomerDisplay />} />
        <Route path="/pos" element={
          <TableRequired>
            <OrderView />
          </TableRequired>
        } />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="overview" element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="categories" element={<CategoryAdmin />} />
          <Route path="payments" element={<Payments />} />
          <Route path="coupons" element={<Coupons />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
