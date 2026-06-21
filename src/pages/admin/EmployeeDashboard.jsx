import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, CheckCircle2, Clock, Send, AlertTriangle, Banknote, QrCode, Home, Tag, Plus, Trash2, RefreshCw, CreditCard, Bell, X } from 'lucide-react';
import { useOrderSyncStore } from '../../store/orderSyncStore';
import { usePromoStore } from '../../store/promoStore';
import { useTableStore } from '../../store/tableStore';
import { useAuthStore } from '../../store/authStore';
import { usePaymentStore } from '../../store/paymentStore';
import { useKdsSocket } from '../../hooks/useKdsSocket';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { isConnected } = useKdsSocket(); // Listen to backend WebSocket
  const { orders, dispatchOrderToKds, markDelivered, fetchOrders } = useOrderSyncStore();
  const { promos, addPromo, removePromo } = usePromoStore();
  const { resetTables } = useTableStore();
  const { methods, fetchMethods, toggleMethod } = usePaymentStore();
  
  useEffect(() => {
    fetchOrders();
    fetchMethods();
  }, [fetchOrders, fetchMethods]);

  const [notification, setNotification] = useState(null);
  const prevOrdersRef = useRef({});

  // Monitor for new orders and KDS updates
  useEffect(() => {
    if (orders.length === 0) return;
    
    let alertMsg = null;
    
    // Check if total orders increased (new order arrived)
    const prevCount = Object.keys(prevOrdersRef.current).length;
    if (orders.length > prevCount && prevCount > 0) {
      alertMsg = 'New order received from customer!';
    } else {
      // Check for status updates from KDS
      for (const order of orders) {
        const prevStatus = prevOrdersRef.current[order.id];
        if (prevStatus && prevStatus !== order.status) {
          if (order.status === 'Preparing') alertMsg = `Kitchen started preparing Order #${order.id}`;
          if (order.status === 'Completed') alertMsg = `Order #${order.id} is ready to serve!`;
        }
      }
    }

    if (alertMsg) {
      setNotification(alertMsg);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
      audio.volume = 0.2;
      audio.play().catch(() => {});
      setTimeout(() => setNotification(null), 5000);
    }

    // Save current state
    const currentMap = {};
    orders.forEach(o => { currentMap[o.id] = o.status; });
    prevOrdersRef.current = currentMap;
  }, [orders]);
  
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoType, setNewPromoType] = useState('percentage');
  
  const { sessionId, openSession, closeSession } = useAuthStore();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [closingAmount, setClosingAmount] = useState('');

  const cashOrders = orders.filter(o => o.paymentMethod === 'cash');
  const getOrderTotal = (o) => o.total || o.total_amount || (o.items ? o.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) : 0);
  const expectedCash = cashOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);

  const sendToKds = (id) => {
    dispatchOrderToKds(id);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  // Combine all orders that have left the 'pending' state
  const liveKitchenOrders = orders.filter(o => ['sent', 'To Cook', 'Preparing', 'Completed'].includes(o.status));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-amber-200/40 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-emerald-200/40 blur-[100px]" 
        />
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 flex items-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(79,70,229,0.4)] min-w-[300px] max-w-md w-max"
          >
            <Bell className="w-6 h-6 animate-bounce" />
            <span className="font-bold">{notification}</span>
            <button onClick={() => setNotification(null)} className="ml-auto p-1 hover:bg-indigo-700 rounded-full transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="relative z-10 p-4 sm:p-8 space-y-8 text-slate-800 pb-24 max-w-7xl mx-auto"
      >
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-slate-200/50 pb-6"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            Order <span className="text-rose-500">Dispatch</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Verify cash & route orders to the Kitchen.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl shadow-sm">
            <div className="relative">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              {pendingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </div>
            <span className="font-bold text-rose-700 text-sm">{pendingOrders.length} Pending</span>
          </div>
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className={`flex items-center gap-2 p-3 backdrop-blur shadow-sm rounded-2xl transition cursor-pointer border ${sessionId ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            title="Register Control"
          >
            <Banknote className="w-5 h-5" />
            <span className="hidden sm:inline font-bold text-sm">{sessionId ? 'Session Active' : 'Start Shift'}</span>
          </button>
          <button 
            onClick={() => navigate('/floor')}
            className="p-3 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-slate-800 hover:text-white text-slate-700 transition cursor-pointer border border-slate-200/50 flex items-center justify-center group"
            title="Back to Home"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to free up all tables?')) {
                resetTables();
              }
            }}
            className="flex items-center gap-2 p-3 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition cursor-pointer border border-slate-200/50"
            title="Reset All Tables"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline font-bold text-sm">Reset Tables</span>
          </button>
        </div>
      </motion.div>



      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Pending Queue */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pl-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Incoming Queue</h2>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
          </div>
          
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pendingOrders.map(order => (
                <motion.div 
                  key={order.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95, x: 50, transition: { duration: 0.2 } }}
                  className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:shadow-[0_25px_60px_rgba(15,23,42,0.4)] transition-shadow flex flex-col sm:flex-row justify-between gap-6 relative overflow-hidden group"
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
                  
                  <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>

                  <div className="pl-4 relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="font-black text-white font-mono text-xl">{order.id}</span>
                      <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] uppercase font-black px-2.5 py-1 rounded-lg tracking-wider">
                        {order.table}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" /> {order.time}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-300 font-bold bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {order.paymentMethod === 'cash' ? <Banknote className="w-3.5 h-3.5 text-emerald-400" /> : <QrCode className="w-3.5 h-3.5" />}
                        {order.paymentMethod}
                      </span>
                    </div>
                    <ul className="text-sm font-bold text-slate-400 space-y-1.5">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex sm:flex-col justify-end gap-3 shrink-0 relative z-10">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendToKds(order.id)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 px-6 py-4 rounded-[1.25rem] font-black uppercase tracking-wider text-xs transition shadow-[0_8px_20px_rgba(245,158,11,0.3)] cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4" /> Dispatch
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {pendingOrders.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white/40 border-2 border-slate-200 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-slate-400"
              >
                <CheckCircle2 className="w-12 h-12 mb-3 text-slate-300" />
                <p className="font-bold text-lg text-slate-500">All caught up!</p>
                <p className="text-sm font-medium">No pending orders to dispatch.</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Live Kitchen Tracking */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pl-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Live Kitchen Tracking</h2>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{liveKitchenOrders.length}</span>
          </div>
          
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            <AnimatePresence mode="popLayout">
              {liveKitchenOrders.map(order => (
                <motion.div 
                  key={order.id}
                  variants={itemVariants}
                  layout
                  className={`bg-white/60 backdrop-blur-3xl border rounded-[1.5rem] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between opacity-95 hover:opacity-100 transition-all gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${
                    order.status === 'Completed' ? 'border-emerald-200 bg-emerald-50/60 shadow-[0_15px_30px_rgba(16,185,129,0.15)]' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-[1rem] border ${
                      order.status === 'Completed' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)]' :
                      order.status === 'Preparing' ? 'bg-amber-100 border-amber-200 text-amber-600' :
                      'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      {order.status === 'Completed' ? <CheckCircle2 className="w-6 h-6" /> : <ChefHat className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-slate-800 text-base">{order.id} <span className="text-slate-400 font-bold text-xs ml-1">{order.table}</span></p>
                        {['qr', 'card', 'netbanking', 'wallet'].includes(order.paymentMethod) && (
                          <span className="bg-white/80 text-slate-600 text-[9px] uppercase font-black px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 shadow-sm">
                            {order.paymentMethod === 'qr' ? <QrCode className="w-2.5 h-2.5" /> : 
                             order.paymentMethod === 'card' ? <CreditCard className="w-2.5 h-2.5" /> : 
                             <Send className="w-2.5 h-2.5" />}
                            Auto-Sent ({order.paymentMethod})
                          </span>
                        )}
                      </div>
                      
                      {/* Dynamic Status Display */}
                      <p className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        order.status === 'Completed' ? 'text-emerald-600' : 
                        order.status === 'Preparing' ? 'text-amber-600' : 
                        'text-slate-500'
                      }`}>
                        {order.status === 'Completed' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Ready to Serve
                          </>
                        ) : order.status === 'Preparing' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Preparing in Kitchen
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span> Waiting in Queue
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {order.status === 'Completed' && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => markDelivered(order.id)}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition cursor-pointer"
                      >
                        Mark Delivered
                      </motion.button>
                    )}
                    <p className="text-xs font-bold text-slate-500 bg-white/80 px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm ml-auto sm:ml-0">
                      {order.items.length} items
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {liveKitchenOrders.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white/20 border-2 border-slate-200 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-slate-400 text-center"
              >
                <ChefHat className="w-10 h-10 mb-2 text-slate-300" />
                <p className="font-semibold text-sm">No orders currently tracking.</p>
              </motion.div>
            )}
          </motion.div>
        </div>

      </div>

      {/* Promo Code Management Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-12 bg-white/70 backdrop-blur-[40px] border border-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)]"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-500 p-2.5 rounded-xl text-white shadow-md">
            <Tag className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Promo Code Management</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Promo Form */}
          <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Create New Offer</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Code (e.g. SUMMER20)" 
                value={newPromoCode}
                onChange={e => setNewPromoCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 uppercase"
              />
              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                <button
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${newPromoType === 'percentage' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setNewPromoType('percentage')}
                >
                  Percentage (%)
                </button>
                <button
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${newPromoType === 'flat' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setNewPromoType('flat')}
                >
                  Flat Amount (₹)
                </button>
              </div>
              <input 
                type="number" 
                placeholder={newPromoType === 'percentage' ? "Discount % (e.g. 15)" : "Flat Amount ₹ (e.g. 100)"}
                value={newPromoDiscount}
                onChange={e => setNewPromoDiscount(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <input 
                type="text" 
                placeholder="Description" 
                value={newPromoDesc}
                onChange={e => setNewPromoDesc(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={() => {
                  if(newPromoCode && newPromoDiscount) {
                    addPromo({ code: newPromoCode, value: parseFloat(newPromoDiscount), discount_type: newPromoType, description: newPromoDesc });
                    setNewPromoCode(''); setNewPromoDiscount(''); setNewPromoDesc('');
                  }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-4 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Publish Promo
              </button>
            </div>
          </div>

          {/* Active Promos List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Active Promotions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {promos.map(promo => (
                  <motion.div 
                    key={promo.id || promo.code}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex flex-col justify-between shadow-sm relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-indigo-100 text-indigo-700 font-black px-3 py-1 rounded-lg text-sm tracking-wider">
                          {promo.code}
                        </span>
                        <span className="text-lg font-black text-slate-800">-{promo.value}{promo.discount_type === 'percentage' ? '%' : '₹'}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{promo.description}</p>
                    </div>
                    <button 
                      onClick={() => removePromo(promo.id)}
                      className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {promos.length === 0 && (
                <div className="col-span-full text-center text-slate-400 py-8 font-semibold border-2 border-dashed border-slate-200 rounded-2xl">
                  No active promos found. Create one to boost sales!
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Method Management Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-8 bg-white/70 backdrop-blur-[40px] border border-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)]"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-md">
            <CreditCard className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Payment Methods</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {methods.map(method => (
            <div key={method.id} className="bg-white border border-slate-200 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {method.name.toLowerCase().includes('upi') ? <QrCode className="w-5 h-5" /> : method.name.toLowerCase().includes('card') ? <CreditCard className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs">{method.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {method.is_active ? 'Active' : 'Disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleMethod(method.id)}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${method.is_active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
              >
                {method.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
          {methods.length === 0 && (
            <div className="col-span-full text-slate-500">Loading payment methods...</div>
          )}
        </div>
      </motion.div>

      {/* Register Control Modal */}
      <AnimatePresence>
        {isRegisterOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-sky-500"></div>
              
              <div className="flex justify-between items-center mb-6 mt-2">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Banknote className="w-6 h-6 text-indigo-500" /> Register Control
                </h3>
                <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <Trash2 className="w-5 h-5 opacity-0" /> {/* Just for spacing or close icon if imported */}
                </button>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 text-center">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Expected Cash In Hand</p>
                <p className="text-4xl font-black font-mono text-slate-800">₹{expectedCash.toFixed(2)}</p>
              </div>

              {!sessionId ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 text-center font-medium">Your register is currently closed. Start your shift to begin taking orders.</p>
                  <button 
                    onClick={async () => {
                      await openSession();
                      setIsRegisterOpen(false);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg transition"
                  >
                    Open Register & Start Shift
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 text-center font-medium">Please verify the cash in the till before closing your shift.</p>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Actual Closing Amount (₹)</label>
                    <input 
                      type="number" 
                      value={closingAmount}
                      onChange={e => setClosingAmount(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={async () => {
                        await closeSession(parseFloat(closingAmount) || 0);
                        setIsRegisterOpen(false);
                        setClosingAmount('');
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg transition"
                    >
                      End Shift & Close Register
                    </button>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="w-full mt-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
