import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, CheckCircle2, Clock, Send, AlertTriangle, Banknote, QrCode, Home } from 'lucide-react';
import { useOrderSyncStore } from '../../store/orderSyncStore';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { orders, dispatchOrderToKds } = useOrderSyncStore();

  const sendToKds = (id) => {
    dispatchOrderToKds(id);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  // Combine all orders that have left the 'pending' state
  const liveKitchenOrders = orders.filter(o => ['sent', 'Preparing', 'Completed'].includes(o.status));

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
            onClick={() => navigate('/floor')}
            className="p-3 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-slate-800 hover:text-white text-slate-700 transition cursor-pointer border border-slate-200/50 flex items-center justify-center group"
            title="Back to Home"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
                  layout
                  className="bg-white/80 backdrop-blur-[40px] border border-white rounded-[2rem] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)] transition-shadow flex flex-col sm:flex-row justify-between gap-6 relative overflow-hidden"
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-400"></div>

                  <div className="pl-4">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="font-black text-slate-900 font-mono text-xl">{order.id}</span>
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[11px] uppercase font-black px-2.5 py-1 rounded-lg tracking-wider">
                        {order.table}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" /> {order.time}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {order.paymentMethod === 'cash' ? <Banknote className="w-3.5 h-3.5" /> : <QrCode className="w-3.5 h-3.5" />}
                        {order.paymentMethod}
                      </span>
                    </div>
                    <ul className="text-sm font-bold text-slate-600 space-y-1.5">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex sm:flex-col justify-end gap-3 shrink-0">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendToKds(order.id)}
                      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-[1.25rem] font-bold text-sm transition shadow-[0_8px_20px_rgba(15,23,42,0.2)] cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4" /> Confirm & Dispatch
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
                <p className="text-sm font-medium">No pending cash orders to dispatch.</p>
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
                  className={`bg-white/50 backdrop-blur-sm border rounded-[1.5rem] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between opacity-90 hover:opacity-100 transition-all gap-4 ${
                    order.status === 'Completed' ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-[1rem] border ${
                      order.status === 'Completed' ? 'bg-emerald-100 border-emerald-200 text-emerald-600' :
                      order.status === 'Preparing' ? 'bg-amber-100 border-amber-200 text-amber-600' :
                      'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      {order.status === 'Completed' ? <CheckCircle2 className="w-6 h-6" /> : <ChefHat className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-slate-800 text-base">{order.id} <span className="text-slate-400 font-bold text-xs ml-1">{order.table}</span></p>
                        {order.paymentMethod === 'qr' && (
                          <span className="bg-indigo-100 text-indigo-700 text-[9px] uppercase font-black px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                            <QrCode className="w-2.5 h-2.5" /> Auto-Sent
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
                      <button className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition">
                        Mark Delivered
                      </button>
                    )}
                    <p className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 ml-auto sm:ml-0">
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
    </motion.div>
  );
}
