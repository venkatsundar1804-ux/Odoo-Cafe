import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AdminLayout from './layouts/AdminLayout';
import CategoryAdmin from './pages/admin/CategoryAdmin';
import Home from './pages/admin/Home';
import Payments from './pages/admin/Payments';
import Coupons from './pages/admin/Coupons';
import Products from './pages/admin/Products';
import OrderView from './pages/OrderView';
import LandingPage from './pages/LandingPage';
import KitchenDisplay from './pages/KitchenDisplay';
import Dashboard from './pages/admin/Dashboard';
import CustomerDashboard from './pages/admin/CustomerDashboard';
import EmployeeDashboard from './pages/admin/EmployeeDashboard';
import CustomerDisplay from './pages/CustomerDisplay';
import CustomerManagement from './pages/CustomerManagement';
import POS from './pages/POS';
import Checkout from './pages/Checkout';
import AuthPage from './pages/AuthPage';
import { useTableStore } from './store/tableStore';
import { useAuthStore } from './store/authStore';

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

// Role-based protection guard
function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/floor" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/floor" element={<LandingPage />} />
        <Route path="/kds" element={
          <ProtectedRoute allowedRoles={['employee', 'admin']}>
            <KitchenDisplay />
          </ProtectedRoute>
        } />
        <Route path="/cfd" element={<CustomerDisplay />} />
        <Route path="/pos" element={
          <TableRequired>
            <POS />
          </TableRequired>
        } />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orderview" element={
          <TableRequired>
            <OrderView />
          </TableRequired>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['employee', 'admin', 'customer']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="customer" element={<CustomerDashboard />} />
          <Route path="dispatch" element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="overview" element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="categories" element={<CategoryAdmin />} />
          <Route path="payments" element={<Payments />} />
          <Route path="coupons" element={<Coupons />} />
        </Route>
        <Route path="/" element={<Navigate to="/floor" replace />} />
        <Route path="*" element={<Navigate to="/floor" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
