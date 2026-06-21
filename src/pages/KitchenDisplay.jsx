import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Wifi, WifiOff, Clock, Armchair, CheckCircle2, Flame, PackageCheck, UtensilsCrossed, Bell } from 'lucide-react';
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
      animate={newOrderAlert ? { backgroundColor: ['#0f172a', '#450a0a', '#0f172a'] } : { backgroundColor: '#0f172a' }}
      transition={{ duration: 0.8, repeat: 3 }}
      className="h-screen w-screen flex flex-col overflow-hidden font-sans text-slate-100 selection:bg-amber-500 selection:text-white"
    >
      
      {/* ── Premium High-Contrast Header ──────────────────────────────────────── */}
      <header className="h-24 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 shrink-0 shadow-2xl z-20">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-2xl text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Kitchen Display</h1>
            <p className="text-[11px] text-amber-500 uppercase tracking-[0.2em] font-bold mt-0.5">Live Order Execution</p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-6">
          <AnimatePresence>
            {newOrderAlert && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="flex items-center gap-2 bg-rose-500 text-white text-xs font-black uppercase px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(244,63,94,0.6)] tracking-wider"
              >
                <Bell className="w-4 h-4 animate-bounce" /> New Ticket Arrived
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-3 bg-slate-800/50 p-1.5 pr-4 rounded-full border border-white/5">
            {isConnected ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full text-xs font-black tracking-widest border border-emerald-400/20">
                <Wifi size={14} className="animate-pulse" /> LIVE
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-2 rounded-full text-xs font-black tracking-widest border border-rose-400/20">
                <WifiOff size={14} /> OFFLINE
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Columns Grid ─────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 min-h-0 relative z-10">
        
        {/* Column 1: To Cook */}
        <div className="flex flex-col h-full bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-rose-500/20 to-transparent p-5 shrink-0 flex justify-between items-center border-b border-rose-500/20">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-rose-400 flex items-center gap-3">
              <UtensilsCrossed className="w-5 h-5 text-rose-500" /> Incoming
            </h2>
            <span className="bg-rose-500 text-white font-mono text-xs font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              {toCookOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {toCookOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={order.id.toString()}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <OrderCard 
                    order={order} 
                    onTransition={transitionKdsStatus} 
                    onToggleItem={toggleItemStrike} 
                    cardTheme="rose"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {toCookOrders.length === 0 && <EmptyState icon={UtensilsCrossed} title="No Incoming Tickets" />}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="flex flex-col h-full bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-amber-500/20 to-transparent p-5 shrink-0 flex justify-between items-center border-b border-amber-500/20">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" /> Preparing
            </h2>
            <span className="bg-amber-500 text-slate-900 font-mono text-xs font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              {preparingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {preparingOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={order.id.toString()}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <OrderCard 
                    order={order} 
                    onTransition={transitionKdsStatus} 
                    onToggleItem={toggleItemStrike} 
                    cardTheme="amber"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {preparingOrders.length === 0 && <EmptyState icon={Flame} title="Kitchen is clear" />}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="flex flex-col h-full bg-slate-800/20 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-5 shrink-0 flex justify-between items-center border-b border-emerald-500/10">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-3">
              <PackageCheck className="w-5 h-5 text-emerald-500" /> Ready
            </h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-black px-3 py-1 rounded-full">
              {completedOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {completedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={order.id.toString()}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <OrderCard 
                    order={order} 
                    onTransition={transitionKdsStatus} 
                    onToggleItem={toggleItemStrike} 
                    cardTheme="emerald"
                    isCompletedStage={true}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {completedOrders.length === 0 && <EmptyState icon={PackageCheck} title="No Ready Orders" />}
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// Reusable Empty State Component
function EmptyState({ icon: Icon, title }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500/50 opacity-60">
      <Icon className="w-16 h-16 mb-4 stroke-1" />
      <p className="font-bold tracking-widest uppercase text-sm">{title}</p>
    </div>
  );
}

// ── Premium Order Card Sub-component ──────────────────────────────────────
function OrderCard({ order, onTransition, onToggleItem, cardTheme, isCompletedStage = false }) {
  
  // Theme dictionaries
  const themes = {
    rose: {
      border: 'border-rose-500/30',
      hoverBorder: 'hover:border-rose-500',
      shadow: 'shadow-[0_10px_30px_rgba(244,63,94,0.1)]',
      bg: 'bg-slate-900/80',
      headerBg: 'bg-gradient-to-br from-rose-950/50 to-slate-900/80',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]',
      accent: 'text-rose-400'
    },
    amber: {
      border: 'border-amber-500/40',
      hoverBorder: 'hover:border-amber-400',
      shadow: 'shadow-[0_10px_30px_rgba(245,158,11,0.1)]',
      bg: 'bg-slate-900',
      headerBg: 'bg-gradient-to-br from-amber-950/50 to-slate-900',
      btn: 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      accent: 'text-amber-400'
    },
    emerald: {
      border: 'border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/40',
      shadow: 'shadow-none',
      bg: 'bg-slate-900/40 opacity-80',
      headerBg: 'bg-emerald-950/20',
      btn: '',
      accent: 'text-emerald-500'
    }
  };

  const t = themes[cardTheme];

  return (
    <div className={`rounded-[1.5rem] transition-all duration-500 flex flex-col justify-between overflow-hidden border ${t.border} ${t.hoverBorder} ${t.shadow} ${t.bg}`}>
      
      {/* Card Header */}
      <div className={`flex justify-between items-start border-b border-white/5 p-5 ${t.headerBg}`}>
        <div>
          <span className="text-4xl font-black font-sans tracking-tighter text-white">
            #{order.id}
          </span>
          <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest mt-1 ${t.accent}`}>
            <Armchair size={13} />
            <span>{order.table || `Table ${order.table_id}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <Clock size={12} className={t.accent} /> {order.time || order.timestamp || ''}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2 p-5 flex-1 relative z-10">
        {order.items.map((item) => (
          <div
            key={item.product_id}
            onClick={() => onToggleItem(order.id, item.product_id)}
            className={`flex items-center justify-between cursor-pointer py-3.5 px-4 rounded-[1.25rem] border backdrop-blur-md transition-all select-none group ${
              item.completed 
                ? 'bg-slate-800/30 border-white/5' 
                : 'bg-slate-800/80 border-white/10 hover:border-white/30 hover:bg-slate-700/80'
            }`}
          >
            <div className="flex items-center gap-4 max-w-[80%]">
              {item.completed ? (
                <motion.div 
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30"
                >
                  <CheckCircle2 size={14} className="stroke-[3]" />
                </motion.div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center shrink-0 bg-slate-900/50 group-hover:border-slate-400 transition-colors">
                  <div className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-slate-300`}></div>
                </div>
              )}
              <div className="relative">
                <span className={`text-base font-bold tracking-tight transition-colors duration-300 ${
                    item.completed ? 'text-slate-500 italic' : 'text-slate-100 group-hover:text-white'
                  }`}
                >
                  {item.name}
                </span>
                {item.completed && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute left-0 top-1/2 h-[2px] bg-slate-500 -translate-y-1/2 origin-left"
                  />
                )}
              </div>
            </div>
            <span className={`font-mono text-sm px-3 py-1 rounded-xl font-black border ${
                item.completed
                  ? 'bg-slate-800/50 text-slate-500 border-white/5'
                  : 'bg-white/10 text-white border-white/20'
              }`}
            >
              x{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {!isCompletedStage && (
        <div className="p-5 pt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTransition(order.id)}
            className={`w-full py-4 rounded-[1.25rem] text-sm font-black uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-3 ${t.btn}`}
          >
            {(order.status === 'To Cook' || order.status === 'sent') ? (
              <>Start Preparing <Flame className="w-4 h-4" /></>
            ) : (
              <>Mark Ready <PackageCheck className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
