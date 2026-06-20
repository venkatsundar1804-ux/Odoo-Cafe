import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Wifi, WifiOff, Clock, Armchair, CheckCircle2, Circle } from 'lucide-react';
import { useOrderSyncStore } from '../store/orderSyncStore';
import { useKdsSocket } from '../hooks/useKdsSocket';
import api from '../api';

export default function KitchenDisplay() {
  const { isConnected } = useKdsSocket();
  const { orders, transitionKdsStatus, toggleItemStrike, fetchOrders } = useOrderSyncStore();
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Monitor new orders to trigger pulse alert sound or animation
  useEffect(() => {
    const kdsVisibleOrders = orders.filter(o => o.status !== 'pending');
    if (kdsVisibleOrders.length > prevOrderCount) {
      setNewOrderAlert(true);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
      audio.volume = 0.2;
      audio.play().catch(() => {});

      const timer = setTimeout(() => setNewOrderAlert(false), 5000);
      setPrevOrderCount(kdsVisibleOrders.length);
      return () => clearTimeout(timer);
    } else {
      setPrevOrderCount(kdsVisibleOrders.length);
    }
  }, [orders, prevOrderCount]);

  // Group active orders by their status/stage
  const toCookOrders = orders.filter((o) => o.status === 'sent' || o.status === 'To Cook');
  const preparingOrders = orders.filter((o) => o.status === 'Preparing');
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  return (
    <motion.div 
      animate={newOrderAlert ? { backgroundColor: ['#f8fafc', '#fee2e2', '#f8fafc'] } : { backgroundColor: '#f8fafc' }}
      transition={{ duration: 0.8, repeat: 3 }}
      className="h-screen w-screen text-slate-800 flex flex-col overflow-hidden font-sans"
    >
      
      {/* High-Contrast Kitchen Header */}
      <header className="h-20 bg-white border-b-2 border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 p-2.5 rounded-xl text-white">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">KITCHEN MONITOR</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-0.5">Real-time Order Processing</p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-6">
          {newOrderAlert && (
            <div className="animate-bounce bg-red-600 text-white text-xs font-black uppercase px-4 py-2 rounded-xl shadow-lg shadow-red-200 tracking-wider">
              🔔 NEW TICKET ARRIVED!
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-black">
                <Wifi size={14} className="animate-pulse" /> LIVE CONNECTED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full text-xs font-black">
                <WifiOff size={14} /> SYSTEM DISCONNECTED
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 min-h-0 bg-slate-50">
        
        {/* Column 1: To Cook (Light Red theme) */}
        <div className="flex flex-col h-full bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-md">
          <div className="bg-red-50 border-b-2 border-red-100 p-4 shrink-0 flex justify-between items-center">
            <h2 className="text-base font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-650 animate-ping"></span> To Cook
            </h2>
            <span className="bg-red-200/60 text-red-800 font-mono text-sm font-black px-3 py-0.5 rounded-full border border-red-300/40">
              {toCookOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {toCookOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={order.id.toString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <OrderCard 
                    order={order} 
                    onTransition={transitionKdsStatus} 
                    onToggleItem={toggleItemStrike} 
                    cardClass="bg-white border-2 border-red-200/60 shadow-[0_10px_20px_rgba(239,68,68,0.05)] hover:border-red-400 hover:shadow-[0_15px_30px_rgba(239,68,68,0.1)]"
                    btnClass="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30"
                    bulletClass="text-red-400"
                    headerBg="bg-red-50/50"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 2: Preparing (Light Amber theme) */}
        <div className="flex flex-col h-full bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-md">
          <div className="bg-amber-50 border-b-2 border-amber-100 p-4 shrink-0 flex justify-between items-center">
            <h2 className="text-base font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-550 animate-pulse"></span> Preparing
            </h2>
            <span className="bg-amber-200/60 text-amber-800 font-mono text-sm font-black px-3 py-0.5 rounded-full border border-amber-300/40">
              {preparingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {preparingOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={order.id.toString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <OrderCard 
                    order={order} 
                    onTransition={transitionKdsStatus} 
                    onToggleItem={toggleItemStrike} 
                    cardClass="bg-white border-2 border-amber-200/60 shadow-[0_10px_20px_rgba(245,158,11,0.05)] hover:border-amber-400 hover:shadow-[0_15px_30px_rgba(245,158,11,0.1)]"
                    btnClass="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/30"
                    bulletClass="text-amber-400"
                    headerBg="bg-amber-50/50"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 3: Completed (Light Green theme) */}
        <div className="flex flex-col h-full bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-md">
          <div className="bg-emerald-55/60 border-b-2 border-emerald-100 p-4 shrink-0 flex justify-between items-center">
            <h2 className="text-base font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Completed
            </h2>
            <span className="bg-emerald-200/60 text-emerald-800 font-mono text-sm font-black px-3 py-0.5 rounded-full border border-emerald-300/40">
              {completedOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {completedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={order.id.toString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <OrderCard 
                    order={order} 
                    onTransition={transitionKdsStatus} 
                    onToggleItem={toggleItemStrike} 
                    cardClass="bg-white border-2 border-emerald-200/60 shadow-[0_10px_20px_rgba(16,185,129,0.05)] hover:border-emerald-400 hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)] opacity-70"
                    bulletClass="text-emerald-400"
                    isCompletedStage={true}
                    headerBg="bg-emerald-50/50"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// Child Order Card Sub-component
function OrderCard({ order, onTransition, onToggleItem, cardClass, btnClass, bulletClass, headerBg, isCompletedStage = false }) {
  return (
    <div
      className={`rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden ${cardClass}`}
    >
      {/* Card Header (Receipt Style) */}
      <div className={`flex justify-between items-start border-b-2 border-dashed border-slate-200/80 p-5 ${headerBg}`}>
        <div>
          <span className="text-3xl font-black font-sans tracking-tighter text-slate-900">
            #{order.id}
          </span>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-black uppercase tracking-widest mt-1">
            <Armchair size={13} className="text-slate-400" />
            <span>{order.table || `Table ${order.table_id}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 bg-white shadow-sm border border-slate-100 px-3 py-1.5 rounded-xl">
          <Clock size={12} className="text-slate-400" /> {order.time || order.timestamp || ''}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2 p-5 flex-1 bg-white/50">
        {order.items.map((item) => (
          <div
            key={item.product_id}
            onClick={() => onToggleItem(order.id, item.product_id)}
            className="flex items-center justify-between cursor-pointer py-3 px-4 rounded-xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow transition-all select-none group"
          >
            <div className="flex items-center gap-3 max-w-[80%]">
              {item.completed ? (
                <motion.div 
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                >
                  <CheckCircle2 size={14} className="stroke-[3]" />
                </motion.div>
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${bulletClass.replace('text-', 'border-').replace('400', '300')} bg-slate-50`}>
                  <div className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${bulletClass.replace('text-', 'bg-')}`}></div>
                </div>
              )}
              <div className="relative">
                <span
                  className={`text-base font-bold tracking-tight transition-colors duration-300 ${
                    item.completed ? 'text-slate-400 italic' : 'text-slate-800 group-hover:text-slate-900'
                  }`}
                >
                  {item.name}
                </span>
                {item.completed && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute left-0 top-1/2 h-[2px] bg-slate-400 -translate-y-1/2 origin-left"
                  />
                )}
              </div>
            </div>
            <span
              className={`font-sans text-sm px-3 py-1 rounded-xl font-black ${
                item.completed
                  ? 'bg-slate-50 text-slate-400 border border-slate-200/50'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              x{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Action to advance ticket */}
      {!isCompletedStage && (
        <div className="p-5 pt-0 bg-white/50">
          <button
            onClick={() => onTransition(order.id)}
            className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-lg cursor-pointer flex items-center justify-center gap-2 ${btnClass}`}
          >
            {(order.status === 'To Cook' || order.status === 'sent') ? (
              <>Start Preparing</>
            ) : (
              <>Mark Completed</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
