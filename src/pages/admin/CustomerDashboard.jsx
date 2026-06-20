import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Tag, Clock, Plus, Trash2, MapPin, CheckCircle2, ChevronRight, Award, ShoppingBag, ChefHat, Send, Home, Bell, X } from 'lucide-react';
import { useOrderSyncStore } from '../../store/orderSyncStore';
import { usePromoStore } from '../../store/promoStore';
import api from '../../api';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { orders } = useOrderSyncStore();
  const { promos } = usePromoStore();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [notification, setNotification] = useState(null);
  
  useEffect(() => {
    const channel = new BroadcastChannel('odoo-cafe-order-sync');
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'ORDER_DELIVERED') {
        setNotification(`Order #${event.data.orderId} has been delivered! Enjoy!`);
        setTimeout(() => setNotification(null), 5000);
      }
    };
    channel.addEventListener('message', handleMessage);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  // Poll backend for real-time status updates across devices
  useEffect(() => {
    const pollBackend = async () => {
      try {
        const res = await api.get('/orders');
        const dbOrders = res.data;
        useOrderSyncStore.setState(state => {
          let changed = false;
          let newlyDelivered = null;
          const newOrders = state.orders.map(o => {
            const dbOrder = dbOrders.find(dbO => dbO.id === o.id);
            if (dbOrder && dbOrder.status !== o.status && dbOrder.status !== 'Unknown') {
              changed = true;
              if (dbOrder.status === 'Delivered') newlyDelivered = o.id;
              return { ...o, status: dbOrder.status };
            }
            return o;
          });
          if (changed) {
            const channel = new BroadcastChannel('odoo-cafe-order-sync');
            channel.postMessage({ type: 'SYNC_STATE', orders: newOrders });
            if (newlyDelivered) {
              setNotification(`Order #${newlyDelivered} has been delivered! Enjoy!`);
              setTimeout(() => setNotification(null), 5000);
            }
            channel.close();
            return { orders: newOrders };
          }
          return state;
        });
      } catch (e) {
        console.error('Polling failed:', e);
      }
    };
    const interval = setInterval(pollBackend, 3000);
    return () => clearInterval(interval);
  }, []);

  const pastOrders = orders.map(o => ({
    id: o.id,
    date: o.date || new Date().toLocaleDateString(),
    total: o.total || 0,
    items: o.items.reduce((sum, item) => sum + item.quantity, 0),
    status: o.status
  }));

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



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Orders */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-[40px] border border-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-md">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-800">Order History</h2>
              </div>
              <button className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {pastOrders.map(order => (
                <motion.div 
                  variants={itemVariants}
                  key={order.id} 
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:border-amber-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-amber-50 flex items-center justify-center text-amber-600 font-black font-mono text-lg border border-amber-100/50 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      {order.items}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-base">{order.id}</p>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-black text-slate-900 font-mono text-xl">₹{order.total.toFixed(2)}</p>
                    
                    {order.status === 'pending' && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        <Clock className="w-3 h-3" /> Awaiting Confirmation
                      </div>
                    )}
                    {(order.status === 'sent' || order.status === 'To Cook') && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <Send className="w-3 h-3" /> Sent to Kitchen
                      </div>
                    )}
                    {order.status === 'Preparing' && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 animate-pulse">
                        <ChefHat className="w-3.5 h-3.5" /> Preparing Order...
                      </div>
                    )}
                    {order.status === 'Completed' && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </div>
                    )}
                    {order.status === 'Delivered' && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </div>
                    )}

                  </div>
                </motion.div>
              ))}
              {pastOrders.length === 0 && (
                <div className="text-center text-slate-400 py-10 font-semibold border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <ShoppingBag className="w-8 h-8 opacity-50 mb-2" />
                  No past orders found.
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Payments & Coupons */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          
          {/* Payment Methods */}
          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-[40px] border border-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-2.5 rounded-xl text-white shadow-md">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-800">Wallet</h2>
              </div>
              <button className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {paymentMethods.map(pm => (
                  <motion.div 
                    key={pm.id} 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[1.5rem] shadow-lg relative overflow-hidden group"
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <div className="relative z-10">
                      <p className="font-black text-base">{pm.type}</p>
                      <p className="text-xs font-mono text-slate-300 mt-1 tracking-widest">**** **** **** {pm.last4}</p>
                    </div>
                    <button 
                      onClick={() => setPaymentMethods(prev => prev.filter(p => p.id !== pm.id))}
                      className="relative z-10 p-2.5 bg-white/10 hover:bg-rose-500 text-white rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {paymentMethods.length === 0 && (
                <div className="text-center text-slate-400 py-6 font-semibold border-2 border-dashed border-slate-200 rounded-2xl">
                  No payment methods saved.
                </div>
              )}
            </div>
          </motion.div>

          {/* Coupons */}
          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-[40px] border border-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-md">
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-800">Offers</h2>
            </div>
            
            <div className="space-y-4">
              {promos.map(promo => (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  key={promo.code} 
                  className="relative overflow-hidden border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm cursor-pointer"
                >
                  {/* Decorative dashed line */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 border-r-2 border-dashed border-emerald-200"></div>
                  
                  <div className="pl-4">
                    <p className="font-black text-emerald-600 text-lg">{promo.discountPercent}% OFF</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-wider">{promo.description}</p>
                  </div>
                  <div className="bg-emerald-600 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-lg shadow-md tracking-wider">
                    {promo.code}
                  </div>
                </motion.div>
              ))}
              {promos.length === 0 && (
                <div className="text-center text-slate-400 py-6 font-semibold border-2 border-dashed border-slate-200 rounded-2xl">
                  No active promotions.
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </motion.div>
  );
}
