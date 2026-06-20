import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Coffee, Clock, TableProperties } from 'lucide-react';
import api from '../api';

// Child components
import ProductGrid from '../components/OrderView/ProductGrid';
import CartList from '../components/OrderView/CartList';
import OrderSummary from '../components/OrderView/OrderSummary';

export default function OrderView() {
  const [searchParams] = useSearchParams();
  const tableIdFromUrl = searchParams.get('table_id');
  const selectedTableId = tableIdFromUrl ? parseInt(tableIdFromUrl, 10) : 1;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial products and categories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to fetch initial products/categories", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Premium Glassmorphic Header */}
      <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm flex items-center justify-between px-8 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-indigo-600">
            <Coffee className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-800 to-indigo-950 bg-clip-text text-transparent">
            Odoo Cafe POS
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <TableProperties size={14} className="text-indigo-600" />
            <span>Table {selectedTableId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 font-mono">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* Main 3-Pane Grid with Generous Spacing */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden min-h-0 bg-slate-50">
        {/* Pane 1: Products Section (Grid) - 6 cols */}
        <div className="lg:col-span-6 h-full overflow-hidden">
          <ProductGrid products={products} categories={categories} />
        </div>

        {/* Pane 2: Cart Section - 3 cols */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <CartList />
        </div>

        {/* Pane 3: Order Summary - 3 cols */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <OrderSummary selectedTableId={selectedTableId} />
        </div>
      </div>
    </div>
  );
}
