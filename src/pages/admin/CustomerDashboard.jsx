import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Tag, Clock, Plus, Trash2, MapPin, CheckCircle2, ChevronRight, Award, ShoppingBag, ChefHat, Send, Home, Bell, X, RefreshCw, Package } from 'lucide-react';
import { usePromoStore } from '../../store/promoStore';
import api from '../../api';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { promos, fetchPromos } = usePromoStore();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [notification, setNotification] = useState(null);
  const prevOrdersRef = useRef({});

  // ── Fetch all orders from the backend database ───────────────────
  const fetchOrdersFromDB = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const res = await api.get('/orders');
      const dbOrders = res.data;
      
      const mapped = dbOrders.map(o => ({
        id: o.id,
        orderId: `ORD-${o.id}`,
        table: o.table_id ? `T-${o.table_id}` : null,
        total: o.total_amount || 0,
        status: o.status || 'Unknown',
        date: o.created_at
          ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString('en-IN'),
        time: o.created_at
          ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        items: o.items
          ? o.items.map(i => ({
              product_id: i.product_id,
              name: i.product_name || `Item ${i.product_id}`,
              quantity: i.quantity,
              unit_price: i.unit_price,
              line_total: i.line_total
            }))
          : [],
        itemCount: o.items ? o.items.reduce((sum, i) => sum + i.quantity, 0) : 0
      }));

      // Sort by id descending (most recent first)
      mapped.sort((a, b) => b.id - a.id);
      
      // Check for status changes (compare with previous state)
      mapped.forEach(o => {
        const prev = prevOrdersRef.current[o.id];
        if (prev && prev !== o.status) {
          if (o.status === 'Delivered') {
            setNotification(`Order #${o.id} has been delivered! Enjoy!`);
          } else if (o.status === 'Preparing') {
            setNotification(`Order #${o.id} is now being prepared!`);
          } else if (o.status === 'Completed') {
            setNotification(`Order #${o.id} is ready to serve!`);
          } else if (o.status === 'sent' || o.status === 'To Cook') {
            setNotification(`Order #${o.id} has been received by the kitchen!`);
          }
          setTimeout(() => setNotification(null), 5000);
        }
      });

      // Store current statuses for next comparison
      const statusMap = {};
      mapped.forEach(o => { statusMap[o.id] = o.status; });
      prevOrdersRef.current = statusMap;

      setOrders(mapped);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrdersFromDB(true);
    fetchPromos();
  }, []);

  // Poll backend every 3 seconds for real-time status updates
  useEffect(() => {
    const interval = setInterval(() => fetchOrdersFromDB(false), 3000);
    return () => clearInterval(interval);
  }, []);

  // Listen for cross-tab delivery notifications
  useEffect(() => {
    const channel = new BroadcastChannel('odoo-cafe-order-sync');
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'ORDER_DELIVERED') {
        setNotification(`Order #${event.data.orderId} has been delivered! Enjoy!`);
        setTimeout(() => setNotification(null), 5000);
        // Immediately re-fetch to reflect changes
        fetchOrdersFromDB(false);
      }
    };
    channel.addEventListener('message', handleMessage);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  // ── Status helpers ───────────────────────────────────────────────
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
            <Clock className="w-3 h-3" /> Awaiting
          </div>
        );
      case 'sent':
      case 'To Cook':
        return (
          <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            <Send className="w-3 h-3" /> Sent to Kitchen
          </div>
        );
      case 'Preparing':
        return (
          <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 animate-pulse">
            <ChefHat className="w-3.5 h-3.5" /> Preparing...
          </div>
        );
      case 'Completed':
        return (
          <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            <Package className="w-3 h-3" /> Ready
          </div>
        );
      case 'Delivered':
        return (
          <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </div>
        );
      case 'Paid':
        return (
          <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            <Clock className="w-3 h-3" /> {status}
          </div>
        );
    }
  };

  // ── Stats ────────────────────────────────────────────────────────
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter(o => o.status === 'Delivered' || o.status === 'Paid' || o.status === 'Completed').length;
  const activeOrders = orders.filter(o => !['Delivered', 'Paid', 'Completed'].includes(o.status));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="p-4 sm:p-8 space-y-8 text-slate-800 font-sans pb-24"
    >
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] min-w-[300px] max-w-md w-max"
          >
            <Bell className="w-6 h-6 animate-bounce" />
            <span className="font-bold">{notification}</span>
            <button onClick={() => setNotification(null)} className="ml-auto p-1 hover:bg-emerald-600 rounded-full transition">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-slate-200/50 pb-6"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            Customer <span className="text-amber-500">Portal</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back! Here is your cafe history.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-amber-700 text-sm">Gold Member</span>
          </div>
          <button 
            onClick={() => navigate('/floor')}
            className="p-3 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-slate-800 hover:text-white text-slate-700 transition cursor-pointer border border-slate-200/50 flex items-center justify-center group"
            title="Back to Home"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Quick Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-5 text-center shadow-xl">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl"></div>
          <p className="text-3xl font-black text-white font-mono relative z-10">{orders.length}</p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 relative z-10">Total Orders</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-800 border border-emerald-700 rounded-2xl p-5 text-center shadow-xl">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/30 rounded-full blur-2xl"></div>
          <p className="text-3xl font-black text-emerald-400 font-mono relative z-10">{deliveredCount}</p>
          <p className="text-xs text-emerald-200/60 font-bold uppercase tracking-wider mt-1 relative z-10">Completed</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-900 to-amber-800 border border-amber-700 rounded-2xl p-5 text-center shadow-xl">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/30 rounded-full blur-2xl"></div>
          <p className="text-3xl font-black text-amber-400 font-mono relative z-10">₹{totalSpent.toFixed(0)}</p>
          <p className="text-xs text-amber-200/60 font-bold uppercase tracking-wider mt-1 relative z-10">Total Spent</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Orders */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-2 space-y-6">
          
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50/80 to-white/70 backdrop-blur-[40px] border border-amber-200/50 rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 p-2.5 rounded-xl text-white shadow-md animate-pulse">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">Active Orders</h2>
                  <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{activeOrders.length}</span>
                </div>
              </div>
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <motion.div 
                    variants={itemVariants}
                    key={`active-${order.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-5 bg-white border border-amber-100 rounded-[1.5rem] shadow-sm"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-amber-100 flex items-center justify-center text-amber-600 font-black font-mono text-lg border border-amber-200/50">
                        {order.itemCount}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{order.orderId}</p>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{order.table || 'Takeaway'} · {order.time}</p>
                        {order.items.length > 0 && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-black text-slate-900 font-mono text-xl">₹{order.total.toFixed(2)}</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Orders History */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-[2.5rem] p-8 shadow-xl">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-300/30 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-300/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-md">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-800">Order History</h2>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{orders.length}</span>
              </div>
              <button 
                onClick={() => fetchOrdersFromDB(false)} 
                className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-slate-400 py-10 font-semibold">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 opacity-50" />
                  Loading orders...
                </div>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <motion.div 
                    variants={itemVariants}
                    key={order.id} 
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:border-amber-100 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-amber-50 flex items-center justify-center text-amber-600 font-black font-mono text-lg border border-amber-100/50 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        {order.itemCount}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{order.orderId}</p>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{order.date}</p>
                        {order.items.length > 0 && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {order.items.map(i => i.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-black text-slate-900 font-mono text-xl">₹{order.total.toFixed(2)}</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-10 font-semibold border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <ShoppingBag className="w-8 h-8 opacity-50 mb-2" />
                  No orders found. Place an order from the POS!
                </div>
              )}
            </div>
          </div>
          </div>
        </motion.div>

        {/* Right Column: Payments & Coupons */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          


          {/* Coupons */}
          <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 rounded-[2.5rem] p-8 shadow-xl">
            <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-emerald-400/30 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-md">
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-800">Offers</h2>
            </div>
            
            <div className="space-y-4">
              {promos.filter(p => p.is_active !== false).map(promo => {
                const label = promo.discount_type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`;
                const description = promo.product_id ? 'Special Item Discount' : 'Store-Wide Discount';
                
                return (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={promo.code} 
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      setNotification(`Coupon ${promo.code} copied to clipboard!`);
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    className="relative overflow-hidden border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm cursor-pointer group"
                    title="Click to copy code"
                  >
                    {/* Decorative dashed line */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 border-r-2 border-dashed border-emerald-200"></div>
                    
                    <div className="pl-4">
                      <p className="font-black text-emerald-600 text-lg">{label}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-wider">{description}</p>
                    </div>
                    <div className="bg-emerald-600 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-lg shadow-md tracking-wider group-hover:bg-emerald-500 transition-colors">
                      {promo.code}
                    </div>
                  </motion.div>
                );
              })}
              {promos.filter(p => p.is_active !== false).length === 0 && (
                <div className="text-center text-slate-400 py-6 font-semibold border-2 border-dashed border-slate-200 rounded-2xl">
                  No active promotions.
                </div>
              )}
            </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </motion.div>
  );
}
