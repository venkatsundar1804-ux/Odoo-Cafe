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
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Premium Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-amber-500">
            <Coffee className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Odoo Cafe POS
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
            <TableProperties size={14} className="text-amber-500" />
            <span>Table {selectedTableId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* Main 3-Pane Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-hidden min-h-0 bg-gradient-to-b from-slate-900/20 to-slate-950">
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
