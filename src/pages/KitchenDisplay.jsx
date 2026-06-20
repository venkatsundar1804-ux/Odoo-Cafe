import { useEffect } from 'react';
import { ChefHat, Wifi, WifiOff, Clock, Armchair } from 'lucide-react';
import { useKdsStore } from '../store/kdsStore';
import { useKdsSocket } from '../hooks/useKdsSocket';
import api from '../api';

export default function KitchenDisplay() {
  const { isConnected } = useKdsSocket();
  const { activeOrders, setOrders, transitionOrder, toggleItemStrike } = useKdsStore();

  // Load existing orders on mount
  useEffect(() => {
    const fetchExistingOrders = async () => {
      try {
        const response = await api.get('/orders/');
        // Filter orders that are not fully closed/completed if backend tracks it,
        // or map all pending/preparing orders.
        const mappedOrders = response.data.map((order) => {
          // Map backend status to KDS stages: pending -> To Cook, cooking -> Preparing, completed -> Completed
          let kdsStatus = 'To Cook';
          if (order.status === 'cooking' || order.status === 'preparing') kdsStatus = 'Preparing';
          else if (order.status === 'completed' || order.status === 'paid') kdsStatus = 'Completed';

          return {
            id: order.id,
            table_id: order.table_id,
            status: kdsStatus,
            items: order.items.map((item) => ({
              product_id: item.product_id,
              name: item.product_name || `Product #${item.product_id}`,
              quantity: item.quantity,
              completed: false
            })),
            timestamp: new Date(order.created_at || Date.now()).toLocaleTimeString()
          };
        });

        // Filter out old completed ones to keep KDS clean
        const activeKdsOrders = mappedOrders.filter(o => o.status !== 'Completed');
        setOrders(activeKdsOrders);
      } catch (error) {
        console.warn("Failed to load existing orders, initializing with mock cooking list", error);
        setOrders([
          {
            id: 101,
            table_id: 2,
            status: 'To Cook',
            items: [
              { product_id: 1, name: 'Espresso', quantity: 2, completed: false },
              { product_id: 2, name: 'Croissant', quantity: 1, completed: false }
            ],
            timestamp: '14:15:00'
          },
          {
            id: 102,
            table_id: 4,
            status: 'Preparing',
            items: [
              { product_id: 3, name: 'Iced Latte', quantity: 1, completed: true },
              { product_id: 4, name: 'Blueberry Muffins', quantity: 3, completed: false }
            ],
            timestamp: '14:20:00'
          }
        ]);
      }
    };

    fetchExistingOrders();
  }, [setOrders]);

  // Group active orders by their status/stage
  const toCookOrders = activeOrders.filter((o) => o.status === 'To Cook');
  const preparingOrders = activeOrders.filter((o) => o.status === 'Preparing');
  const completedOrders = activeOrders.filter((o) => o.status === 'Completed');

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      
      {/* KDS Kitchen Header */}
      <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-500">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Kitchen KDS Terminal</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Real-time Order Processing</p>
          </div>
        </div>

        {/* WebSocket Health Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                <Wifi size={14} className="animate-pulse" /> Live Connection
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                <WifiOff size={14} /> Disconnected
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 min-h-0 bg-gradient-to-b from-slate-900/30 to-slate-950">
        
        {/* Column 1: To Cook (Amber theme) */}
        <div className="flex flex-col h-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-amber-600/10 border-b border-amber-500/20 p-4 shrink-0 flex justify-between items-center">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> To Cook
            </h2>
            <span className="bg-amber-500/20 text-amber-400 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {toCookOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {toCookOrders.map((order) => (
              <OrderCard key={order.id} order={order} onTransition={transitionOrder} onToggleItem={toggleItemStrike} borderClass="border-l-4 border-amber-500" />
            ))}
          </div>
        </div>

        {/* Column 2: Preparing (Blue theme) */}
        <div className="flex flex-col h-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-sky-600/10 border-b border-sky-500/20 p-4 shrink-0 flex justify-between items-center">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span> Preparing
            </h2>
            <span className="bg-sky-500/20 text-sky-400 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {preparingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {preparingOrders.map((order) => (
              <OrderCard key={order.id} order={order} onTransition={transitionOrder} onToggleItem={toggleItemStrike} borderClass="border-l-4 border-sky-500" />
            ))}
          </div>
        </div>

        {/* Column 3: Completed (Green theme) */}
        <div className="flex flex-col h-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-emerald-600/10 border-b border-emerald-500/20 p-4 shrink-0 flex justify-between items-center">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
            </h2>
            <span className="bg-emerald-500/20 text-emerald-400 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {completedOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} onTransition={transitionOrder} onToggleItem={toggleItemStrike} borderClass="border-l-4 border-emerald-500" isCompletedStage={true} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Child Order Card Sub-component
function OrderCard({ order, onTransition, onToggleItem, borderClass, isCompletedStage = false }) {
  // Compute elapsed time or age of order
  const elapsed = order.timestamp || '';

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-lg shadow-black/30 hover:border-slate-700 transition-all ${borderClass}`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start border-b border-slate-800/80 pb-3 mb-3">
        <div>
          <span className="text-lg font-black font-mono tracking-tight text-slate-100">
            Order #{order.id}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-1">
            <Armchair size={10} className="text-slate-500" />
            <span>Table {order.table_id}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">
          <Clock size={10} /> {elapsed}
        </div>
      </div>

      {/* Items list (with click to strike out) */}
      <div className="space-y-2.5 py-2">
        {order.items.map((item) => (
          <div
            key={item.product_id}
            onClick={() => onToggleItem(order.id, item.product_id)}
            className="flex items-center justify-between cursor-pointer py-1.5 px-2.5 rounded bg-slate-950/40 border border-slate-950 hover:bg-slate-950/80 hover:border-slate-800 transition-all group"
          >
            <span
              className={`text-sm font-semibold select-none transition-all ${
                item.completed
                  ? 'line-through text-slate-500 font-normal italic'
                  : 'text-slate-200 group-hover:text-amber-500'
              }`}
            >
              {item.name}
            </span>
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                item.completed
                  ? 'bg-slate-950 text-slate-600'
                  : 'bg-amber-500/10 text-amber-500'
              }`}
            >
              x{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Footer action to advance order stage */}
      {!isCompletedStage && (
        <button
          onClick={() => onTransition(order.id)}
          className={`w-full mt-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            order.status === 'To Cook'
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-sky-600 hover:bg-sky-500 text-white'
          }`}
        >
          {order.status === 'To Cook' ? 'Start Preparing' : 'Mark Completed'}
        </button>
      )}
    </div>
  );
}
