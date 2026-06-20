import { useState, useEffect } from 'react';
import { 
  DollarSign, 
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

  // Fetch initial products for filter dropdown
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    
    // Simulate updating graphs and tables depending on the selected filter
    generateMockDataForFilters(period);
  }, [period, employee, session, selectedProduct, startDate, endDate, fetchDashboardSummary, fetchAiSummary]);

  const generateMockDataForFilters = (selectedPeriod) => {
    // Generates mock data variants to make the dashboard feel active and responsive to filter changes
    let multiplier = 1;
    if (selectedPeriod === 'This Week') multiplier = 5.2;
    if (selectedPeriod === 'This Month') multiplier = 22.4;

    setTopOrders([
      { id: 1205, customer: 'Alice Smith', items: 3, total: 24.50 * multiplier, time: '10:45 AM' },
      { id: 1206, customer: 'Bob Jones', items: 1, total: 8.00 * multiplier, time: '11:15 AM' },
      { id: 1207, customer: 'Walk-in', items: 2, total: 15.75 * multiplier, time: '11:40 AM' },
      { id: 1208, customer: 'Charlie Brown', items: 4, total: 32.20 * multiplier, time: '12:05 PM' }
    ]);

    setTopProducts([
      { name: 'Espresso', sold: Math.round(48 * multiplier), revenue: 144.00 * multiplier },
      { name: 'Croissant', sold: Math.round(35 * multiplier), revenue: 122.50 * multiplier },
      { name: 'Iced Latte', sold: Math.round(30 * multiplier), revenue: 135.00 * multiplier },
      { name: 'Blueberry Muffin', sold: Math.round(22 * multiplier), revenue: 77.00 * multiplier }
    ]);

    // Trend points (relative heights for custom SVG graph)
    setSalesTrendData([
      { label: '08:00', value: 120 * multiplier },
      { label: '10:00', value: 340 * multiplier },
      { label: '12:00', value: 520 * multiplier },
      { label: '14:00', value: 410 * multiplier },
      { label: '16:00', value: 290 * multiplier },
      { label: '18:00', value: 610 * multiplier }
    ]);

    setCategoryData([
      { name: 'Hot Coffee', value: 45 },
      { name: 'Cold Brews', value: 25 },
      { name: 'Pastries', value: 20 },
      { name: 'Food Items', value: 10 }
    ]);
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/reports/export', { responseType: 'blob' });
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
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Page Title & Export Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Manager Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live analytics, sales distributions, and AI predictions.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-500" /> Export CSV
          </button>
          <button
            onClick={() => alert("PDF report layout building via print preview...")}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <FileText size={14} className="text-amber-500" /> Export PDF
          </button>
        </div>
      </div>

      {/* Global Filtering Panel */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
        {/* Period Filter */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">Reporting Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Custom">Custom Date Range</option>
          </select>
        </div>

        {/* Employee Filter */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">Employee</label>
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="">All Staff</option>
            <option value="1">John Doe (Cashier)</option>
            <option value="2">Jane Smith (Manager)</option>
          </select>
        </div>

        {/* Session Filter */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">POS Session</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="">All Sessions</option>
            <option value="1">Session #001 (Morning)</option>
            <option value="2">Session #002 (Evening)</option>
          </select>
        </div>

        {/* Product Filter */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">Specific Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Conditional Custom Dates */}
        {period === 'Custom' && (
          <div className="md:col-span-4 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 mt-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2.5 px-3.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Revenue</p>
            <p className="text-3xl font-black font-mono text-emerald-400 mt-2">
              ${(summary.revenue || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Orders</p>
            <p className="text-3xl font-black font-mono text-slate-100 mt-2">
              {summary.total_orders || 0}
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Avg Order Value</p>
            <p className="text-3xl font-black font-mono text-sky-400 mt-2">
              ${(summary.average_order_value || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-4 rounded-2xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Daily Summary Briefing (Natural Language) */}
      <div className="bg-gradient-to-r from-amber-600/10 via-slate-900/40 to-slate-900/40 border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-6 top-6 text-amber-500 opacity-20">
          <Sparkles size={80} />
        </div>
        <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-bold text-sm">
          <Sparkles size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
          <span>AI Manager Insights & Predictions</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
          {aiSummary}
        </p>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Sales Trend (Interactive Area SVG Chart) */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between h-[340px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2">
              Sales Trend
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Revenue per interval</span>
          </div>

          <div className="flex-1 flex items-end justify-between relative h-40 border-b border-l border-slate-800/60 pb-1 pl-4">
            {salesTrendData.map((d, index) => {
              const maxHeight = 160;
              const values = salesTrendData.map(v => v.value);
              const maxVal = Math.max(...values) || 1;
              const height = (d.value / maxVal) * maxHeight;

              return (
                <div key={index} className="flex flex-col items-center group flex-1">
                  {/* Tooltip on hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 text-[10px] text-amber-400 px-2 py-0.5 rounded absolute -top-4 font-mono font-bold">
                    ${d.value.toFixed(2)}
                  </span>
                  {/* Visual Bar Accent */}
                  <div
                    style={{ height: `${height}px` }}
                    className="w-8 md:w-12 bg-gradient-to-t from-amber-600/10 to-amber-500/60 border-t border-x border-amber-500/40 rounded-t-lg transition-all duration-500 group-hover:from-amber-600/30 group-hover:to-amber-500"
                  ></div>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono mt-2">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph 2: Top Categories (Proportional SVG Bars) */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between h-[340px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">
              Sales Distribution
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Category Share</span>
          </div>

          <div className="flex-1 space-y-4">
            {categoryData.map((cat, index) => {
              // Standard tailwind bar colors mapping
              const colors = ['bg-amber-500', 'bg-sky-500', 'bg-emerald-500', 'bg-indigo-500'];
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>{cat.name}</span>
                    <span className="text-slate-400 font-mono">{cat.value}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
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

      {/* Analytics Lists / Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table 1: Top Orders */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 mb-6">
            Top Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items Count</th>
                  <th className="py-3 px-3 text-right">Bill Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {topOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-950/40 transition-colors text-xs text-slate-300">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-100">#{ord.id}</td>
                    <td className="py-3.5 px-3 font-semibold">{ord.customer}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">{ord.items} items</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-500">${ord.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Top Products */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 mb-6">
            Top Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Units Sold</th>
                  <th className="py-3 px-3 text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {topProducts.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/40 transition-colors text-xs text-slate-300">
                    <td className="py-3.5 px-3 font-semibold text-slate-100">{prod.name}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">{prod.sold} sold</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">${prod.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
