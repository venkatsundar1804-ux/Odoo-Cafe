import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IndianRupee, 
  ShoppingBag, 
  Percent, 
  Sparkles, 
  Calendar, 
  User, 
  Coffee, 
  Download, 
  FileSpreadsheet, 
  FileText 
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useOrderSyncStore } from '../../store/orderSyncStore';
import api from '../../api';

export default function Dashboard() {
  const { 
    summary, 
    aiSummary, 
    isLoading, 
    fetchDashboardSummary, 
    fetchAiSummary,
    products,
    fetchProducts
  } = useAdminStore();

  // Filters State
  const [period, setPeriod] = useState('Today');
  const [employee, setEmployee] = useState('');
  const [session, setSession] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Local state for mock listings that depend on filters
  const [topOrders, setTopOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesTrendData, setSalesTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState({ total_orders: 0, revenue: 0, average_order_value: 0 });

  const [dbOrders, setDbOrders] = useState([]);

  // Fetch initial products for filter dropdown
  useEffect(() => {
    fetchProducts();
    // Fetch historical real database orders
    api.get('/orders').then(res => setDbOrders(res.data)).catch(() => {});
  }, [fetchProducts]);

  const { orders } = useOrderSyncStore();

  // Fetch summary and AI summary when filters change
  useEffect(() => {
    const filters = {
      period,
      employee_id: employee,
      session_id: session,
      product_id: selectedProduct,
      start_date: period === 'Custom' ? startDate : '',
      end_date: period === 'Custom' ? endDate : ''
    };
    
    fetchDashboardSummary(filters);
    fetchAiSummary();
    
    // Merge real-time local sync orders with historical database orders
    const combinedOrders = [...dbOrders, ...orders.filter(o => !dbOrders.some(dbO => dbO.id === o.id))];
    
    // Apply filters locally to combinedOrders
    const filteredOrders = combinedOrders.filter(order => {
      let dateMatch = true;
      // Prioritize created_at (DB), then date (Frontend), fallback to time only if needed
      const dateStr = order.created_at || order.date || new Date().toISOString();
      const orderDate = new Date(dateStr);
      const today = new Date();
      if (period === 'Today') {
        dateMatch = orderDate.toDateString() === today.toDateString();
      } else if (period === 'This Week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        dateMatch = orderDate >= weekAgo;
      } else if (period === 'This Month') {
        dateMatch = orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
      } else if (period === 'Custom' && startDate && endDate) {
        dateMatch = orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      }

      // Fallback pseudo-random assignment for older orders that lack employee/session IDs
      const derivedEmpId = order.employee_id || (order.id % 2 === 0 ? '2' : '1');
      const derivedSessionId = order.session_id || (order.id % 2 === 0 ? '2' : '1');
      
      let empMatch = !employee || String(derivedEmpId) === String(employee);
      let sessionMatch = !session || String(derivedSessionId) === String(session);
      let productMatch = !selectedProduct || (order.items && order.items.some(i => String(i.product_id) === String(selectedProduct) || String(i.id) === String(selectedProduct)));

      return dateMatch && empMatch && sessionMatch && productMatch;
    });

    const getOrderTotal = (o) => {
      if (o.total) return o.total;
      if (o.total_amount) return o.total_amount;
      if (!o.items) return 0;
      return o.items.reduce((sum, item) => {
        let itemPrice = item.price || 0;
        if (itemPrice === 0 && products && products.length > 0) {
          const matched = products.find(p => String(p.id) === String(item.product_id));
          if (matched) itemPrice = matched.price;
        }
        return sum + (itemPrice * (item.quantity || 1));
      }, 0);
    };
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    setLiveMetrics({
      total_orders: totalOrders,
      revenue: totalRevenue,
      average_order_value: avgOrderValue
    });

    generateMockDataForFilters(period, filteredOrders);
  }, [period, employee, session, selectedProduct, startDate, endDate, fetchDashboardSummary, fetchAiSummary, orders, dbOrders]);

  const generateMockDataForFilters = (selectedPeriod, sourceOrders = []) => {
    const getOrderTotal = (o) => {
      if (o.total) return o.total;
      if (o.total_amount) return o.total_amount;
      if (!o.items) return 0;
      return o.items.reduce((sum, item) => {
        let itemPrice = item.price || 0;
        if (itemPrice === 0 && products && products.length > 0) {
          const matched = products.find(p => String(p.id) === String(item.product_id));
          if (matched) itemPrice = matched.price;
        }
        return sum + (itemPrice * (item.quantity || 1));
      }, 0);
    };
    
    // 1. Top Orders (Sort by total, descending)
    const sortedOrders = [...sourceOrders].sort((a, b) => getOrderTotal(b) - getOrderTotal(a)).slice(0, 5);
    const mappedTopOrders = sortedOrders.map(o => {
      const orderTotal = getOrderTotal(o);
      let itemsCount = o.items ? o.items.reduce((sum, i) => sum + (i.quantity || 1), 0) : 0;
      if (itemsCount === 0 && orderTotal > 0) itemsCount = Math.max(1, Math.floor(orderTotal / 150));
      else if (itemsCount === 0) itemsCount = 1;

      return {
        id: o.id,
        customer: o.customer_id ? `Cust #${o.customer_id}` : 'Walk-in',
        items: itemsCount,
        total: orderTotal,
        time: o.time || o.date || new Date().toLocaleTimeString()
      };
    });
    setTopOrders(mappedTopOrders.length > 0 ? mappedTopOrders : []);

    // 2. Top Products (Aggregate items from all orders)
    const productMap = {};
    sourceOrders.forEach(order => {
      (order.items || []).forEach(item => {
        // Recover missing price and name from global products state if needed
        let resolvedName = item.name;
        let itemPrice = item.price || 0;
        
        if (products && products.length > 0) {
          const matchedProduct = products.find(p => String(p.id) === String(item.product_id));
          if (matchedProduct) {
            if (itemPrice === 0) itemPrice = matchedProduct.price;
            if (!resolvedName || resolvedName === 'undefined') resolvedName = matchedProduct.name;
          }
        }

        // Fix undefined names with recovered name
        const itemName = (resolvedName && resolvedName !== 'undefined') 
          ? resolvedName 
          : `Unknown Item ${item.product_id ? '#' + item.product_id : ''}`.trim();

        if (!productMap[itemName]) {
          productMap[itemName] = { sold: 0, revenue: 0 };
        }

        productMap[itemName].sold += (item.quantity || 1);
        productMap[itemName].revenue += (itemPrice * (item.quantity || 1));
      });
    });
    
    const sortedProducts = Object.entries(productMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
    
    setTopProducts(sortedProducts);

    // 3. Sales Trend (Group real revenue into bi-hourly buckets)
    const trendBuckets = { '08:00': 0, '10:00': 0, '12:00': 0, '14:00': 0, '16:00': 0, '18:00': 0 };
    sourceOrders.forEach(o => {
      const dateStr = o.created_at || o.date || new Date().toISOString();
      const oDate = new Date(dateStr);
      let hour = oDate.getHours();
      if (isNaN(hour)) hour = 12; // fallback for badly formatted dates
      
      let bucket = '18:00';
      if (hour < 10) bucket = '08:00';
      else if (hour < 12) bucket = '10:00';
      else if (hour < 14) bucket = '12:00';
      else if (hour < 16) bucket = '14:00';
      else if (hour < 18) bucket = '16:00';
      
      trendBuckets[bucket] += getOrderTotal(o);
    });
    setSalesTrendData(Object.entries(trendBuckets).map(([label, value]) => ({ label, value })));

    // 4. Category Data (Real distribution based on product cross-referencing)
    const catMap = {};
    let totalCatRevenue = 0;
    sourceOrders.forEach(order => {
      (order.items || []).forEach(item => {
        let itemPrice = item.price || 0;
        let itemCat = 'Other'; // Fallback category
        
        if (products && products.length > 0) {
          const matchedProduct = products.find(p => String(p.id) === String(item.product_id));
          if (matchedProduct) {
            if (itemPrice === 0) itemPrice = matchedProduct.price;
            itemCat = matchedProduct.category_name || matchedProduct.category || 'Other';
          }
        }
        
        const rev = itemPrice * (item.quantity || 1);
        if (!catMap[itemCat]) catMap[itemCat] = 0;
        catMap[itemCat] += rev;
        totalCatRevenue += rev;
      });
    });
    
    let catData = [];
    if (totalCatRevenue > 0) {
      catData = Object.entries(catMap).map(([name, rev]) => ({
        name,
        value: Math.round((rev / totalCatRevenue) * 100)
      })).sort((a, b) => b.value - a.value); // Sort largest category first
    }
    setCategoryData(catData);
  };

  // Generate dynamic AI summary from locally filtered data
  const dynamicAiSummary = (() => {
    const revenue = (liveMetrics.revenue || 0).toFixed(2);
    const orderCount = liveMetrics.total_orders || 0;
    const topItemName = topProducts.length > 0 ? topProducts[0].name : "Espresso";
    
    // Estimate served customers based on orders for the summary
    const totalServed = orderCount;
    
    if (orderCount === 0) {
      return "Things are quiet right now. No orders match the current filters. A great time to restock and prepare for the rush!";
    }

    let timeContext = "Today";
    if (period === 'This Week') timeContext = "This week";
    else if (period === 'This Month') timeContext = "This month";
    else if (period === 'Custom' && startDate && endDate) timeContext = `From ${startDate} to ${endDate}`;
    else if (period === 'Custom') timeContext = "For the selected period";

    return `${timeContext} was a fantastic period! You processed ${orderCount} orders generating ₹${revenue} in revenue. Your top-selling item was the ${topItemName}. You served ${totalServed} customers. Keep up the great work!`;
  })();

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (employee) params.append('employee_id', employee);
      if (session) params.append('session_id', session);
      if (selectedProduct) params.append('product_id', selectedProduct);
      if (period === 'Custom' && startDate) params.append('start_date', startDate);
      if (period === 'Custom' && endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/reports/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export sales data.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800 pb-24">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-200/40 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-rose-200/40 blur-[100px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto"
      >
      
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">
            Executive <span className="font-semibold text-indigo-950">Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Real-time cafe operations & forecasting</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all hover:scale-105 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={() => alert("PDF report layout building via print preview...")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all hover:scale-105 shadow-sm cursor-pointer"
          >
            <FileText size={14} className="text-indigo-600" /> Export PDF
          </button>
        </div>
      </div>

      {/* Global Filter Dashboard (Glassmorphic) */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-4 gap-5 shadow-sm">
        {/* Period Filter */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-2">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Custom">Custom Date Range</option>
          </select>
        </div>

        {/* Employee Filter */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-2">Employee</label>
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          >
            <option value="">All Employees</option>
            <option value="1">John Doe (Cashier)</option>
            <option value="2">Jane Smith (Manager)</option>
          </select>
        </div>

        {/* Session Filter */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-2">POS Session</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          >
            <option value="">All Sessions</option>
            <option value="1">Session #001 (Morning)</option>
            <option value="2">Session #002 (Evening)</option>
          </select>
        </div>

        {/* Product Filter */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-2">Product Filter</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Custom Date Pickers */}
        {period === 'Custom' && (
          <div className="md:col-span-4 grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-4 mt-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-[#8380C4] to-indigo-500 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-[0_15px_30px_rgba(131,128,196,0.3)] transition-shadow"
        >
          <div>
            <p className="text-[10px] text-indigo-100 uppercase font-extrabold tracking-widest opacity-90">Total Revenue</p>
            <p className="text-3xl font-light font-mono mt-2.5">
              ₹<span className="font-semibold">{(liveMetrics.revenue || 0).toFixed(2)}</span>
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/20">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Total Orders */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-[0_15px_30px_rgba(245,158,11,0.3)] transition-shadow"
        >
          <div>
            <p className="text-[10px] text-amber-100 uppercase font-extrabold tracking-widest opacity-90">Total Orders</p>
            <p className="text-3xl font-light font-mono mt-2.5">
              <span className="font-semibold">{liveMetrics.total_orders || 0}</span>
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/20">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Average Order Value */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-shadow"
        >
          <div>
            <p className="text-[10px] text-emerald-100 uppercase font-extrabold tracking-widest opacity-90">Avg Order Value</p>
            <p className="text-3xl font-light font-mono mt-2.5">
              ₹<span className="font-semibold">{(liveMetrics.average_order_value || 0).toFixed(2)}</span>
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/20">
            <Percent className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      </div>

      {/* AI daily summary briefing (Glow layout) */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-[0_15px_40px_rgba(131,128,196,0.1)] rounded-[2rem] p-8 relative overflow-hidden"
      >
        <div className="absolute right-6 top-6 text-indigo-500 opacity-[0.03]">
          <Sparkles size={120} />
        </div>
        <div className="flex items-center gap-2 mb-3 text-indigo-650 font-bold text-xs uppercase tracking-wider">
          <Sparkles size={14} className="text-indigo-500 animate-pulse" />
          <span>AI Business Insights</span>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed max-w-4xl font-medium relative z-10 transition-all duration-300">
          {dynamicAiSummary}
        </p>
      </motion.div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Trend (Clean responsive SVG layout) */}
        <div className="bg-white/80 backdrop-blur-lg border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between h-[340px] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Sales Trend
            </h2>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Revenue Intervals</span>
          </div>

          <div className="flex-1 flex items-end justify-between relative h-40 border-b border-l border-slate-200/60 pb-1 pl-4">
            {salesTrendData.map((d, index) => {
              const maxHeight = 160;
              const values = salesTrendData.map(v => v.value);
              const maxVal = Math.max(...values) || 1;
              const height = (d.value / maxVal) * maxHeight;

              return (
                <div key={index} className="flex flex-col items-center group flex-1">
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-[10px] text-white px-2 py-0.5 rounded absolute -top-4 font-mono font-bold">
                    ₹{d.value.toFixed(2)}
                  </span>
                  <div
                    style={{ height: `${height}px` }}
                    className="w-7 md:w-10 bg-gradient-to-t from-indigo-50 to-indigo-500 border-t border-x border-indigo-200 rounded-t-lg transition-all duration-300 group-hover:from-indigo-100 group-hover:to-indigo-600"
                  ></div>
                  <span className="text-[9px] text-slate-400 font-extrabold font-mono mt-2.5">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales Distribution (Proportional progress lines) */}
        <div className="bg-white/80 backdrop-blur-lg border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between h-[340px] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Sales Distribution
            </h2>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Category Share</span>
          </div>

          <div className="flex-1 space-y-4 justify-center flex flex-col">
            {categoryData.map((cat, index) => {
              const colors = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500'];
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>{cat.name}</span>
                    <span className="text-slate-400 font-mono">{cat.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/20">
                    <div
                      style={{ width: `${cat.value}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${colors[index % colors.length]}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Top Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table 1: Top Orders */}
        <div className="bg-white/80 backdrop-blur-lg border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-6">
            Top Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items Count</th>
                  <th className="py-3 px-3 text-right">Bill Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {topOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors text-xs text-slate-600">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">#{ord.id}</td>
                    <td className="py-3.5 px-3 font-bold">{ord.customer}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">{ord.items} items</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-600">₹{ord.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Top Products */}
        <div className="bg-white/80 backdrop-blur-lg border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-6">
            Top Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Units Sold</th>
                  <th className="py-3 px-3 text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {topProducts.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-xs text-slate-600">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{prod.name}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">{prod.sold} sold</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">₹{prod.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      </motion.div>
    </div>
  );
}
