import { useEffect, useState } from 'react';
import { ChefHat, Wifi, WifiOff, Clock, Armchair, CheckCircle2, Circle } from 'lucide-react';
import { useOrderSyncStore } from '../store/orderSyncStore';
import { useKdsSocket } from '../hooks/useKdsSocket';
import api from '../api';

export default function KitchenDisplay() {
  const { isConnected } = useKdsSocket();
  const { orders, transitionKdsStatus, toggleItemStrike } = useOrderSyncStore();
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

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
    <div className="h-screen w-screen bg-slate-100 text-slate-800 flex flex-col overflow-hidden font-sans">
      
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {toCookOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onTransition={transitionKdsStatus} 
                onToggleItem={toggleItemStrike} 
                cardClass="bg-red-50/50 border-2 border-red-200 hover:border-red-400"
                btnClass="bg-red-600 hover:bg-red-700 text-white"
                bulletClass="text-red-500"
              />
            ))}
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {preparingOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onTransition={transitionKdsStatus} 
                onToggleItem={toggleItemStrike} 
                cardClass="bg-amber-50/50 border-2 border-amber-200 hover:border-amber-400 animate-pulse"
                btnClass="bg-amber-600 hover:bg-amber-700 text-white"
                bulletClass="text-amber-500"
              />
            ))}
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {completedOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onTransition={transitionKdsStatus} 
                onToggleItem={toggleItemStrike} 
                cardClass="bg-emerald-50/40 border-2 border-emerald-200"
                bulletClass="text-emerald-500"
                isCompletedStage={true} 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Child Order Card Sub-component
function OrderCard({ order, onTransition, onToggleItem, cardClass, btnClass, bulletClass, isCompletedStage = false }) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between ${cardClass}`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start border-b border-slate-200/60 pb-3.5 mb-3.5">
        <div>
          <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
            #{order.id}
          </span>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase tracking-wider mt-1.5">
            <Armchair size={13} className="text-slate-400 animate-pulse" />
            <span>{order.table || `Table ${order.table_id}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-550 bg-white/80 border border-slate-100 px-2.5 py-1 rounded-lg">
          <Clock size={12} className="text-slate-400" /> {order.time || order.timestamp || ''}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3 py-2 flex-1">
        {order.items.map((item) => (
          <div
            key={item.product_id}
            onClick={() => onToggleItem(order.id, item.product_id)}
            className="flex items-center justify-between cursor-pointer py-2 px-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all select-none group"
          >
            <div className="flex items-center gap-2 max-w-[80%]">
              {item.completed ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle size={16} className={`stroke-[2] shrink-0 ${bulletClass}`} />
              )}
              <span
                className={`text-base font-bold tracking-wide transition-all ${
                  item.completed
                    ? 'line-through text-slate-400 font-normal italic opacity-60'
                    : 'text-slate-800 group-hover:text-indigo-600'
                }`}
              >
                {item.name}
              </span>
            </div>
            <span
              className={`font-mono text-xs px-2.5 py-1 rounded-lg font-black border ${
                item.completed
                  ? 'bg-slate-50 text-slate-400 border-slate-200/50'
                  : 'bg-indigo-50 text-indigo-600 border-indigo-100'
              }`}
            >
              x{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Action to advance ticket */}
      {!isCompletedStage && (
        <button
          onClick={() => onTransition(order.id)}
          className={`w-full mt-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-md cursor-pointer ${btnClass}`}
        >
          {(order.status === 'To Cook' || order.status === 'sent') ? '👉 Start Preparing' : '🏁 Mark Completed'}
        </button>
      )}
    </div>
  );
}
