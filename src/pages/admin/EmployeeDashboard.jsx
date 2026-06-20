import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, CheckCircle2, Clock, Send, AlertTriangle } from 'lucide-react';

export default function EmployeeDashboard() {
  const [orders, setOrders] = useState([
    { id: 'ORD-2099', table: 'T-12', items: ['2x Espresso', '1x Croissant'], time: '2 mins ago', status: 'pending' },
    { id: 'ORD-2100', table: 'T-04', items: ['1x Iced Latte', '1x Avocado Toast'], time: '5 mins ago', status: 'pending' },
    { id: 'ORD-2101', table: 'Takeaway', items: ['3x Cappuccino'], time: '8 mins ago', status: 'pending' }
  ]);

  const sendToKds = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'sent' } : o));
    alert(`Order ${id} dispatched to Kitchen Display System!`);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const sentOrders = orders.filter(o => o.status === 'sent');

  return (
    <div className="p-8 space-y-8 text-slate-800 font-sans animate-fade-in pb-20">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">
            Order <span className="font-semibold text-rose-600">Dispatch</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Track & Send orders to Kitchen</p>
        </div>
        <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-100">
          <AlertTriangle className="w-4 h-4" />
          {pendingOrders.length} Pending
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Pending Queue */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 pl-2">Incoming Queue</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {pendingOrders.map(order => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/80 backdrop-blur-md border-l-4 border-l-amber-500 border-y border-r border-slate-200/80 rounded-[1.5rem] p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-black text-slate-800 font-mono text-lg">{order.id}</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider">
                        {order.table}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" /> {order.time}
                      </span>
                    </div>
                    <ul className="text-sm font-medium text-slate-600 space-y-1">
                      {order.items.map((item, idx) => <li key={idx}>• {item}</li>)}
                    </ul>
                  </div>
                  
                  <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                    <button 
                      onClick={() => sendToKds(order.id)}
                      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-[0_4px_14px_rgba(15,23,42,0.3)] cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4" /> Send to KDS
                    </button>
                  </div>
                </motion.div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="bg-white/40 border border-slate-200 border-dashed rounded-[2rem] p-12 text-center text-slate-400 font-semibold">
                  No pending orders.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sent / Processing */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 pl-2">Sent to Kitchen</h2>
          <div className="space-y-4 opacity-70">
            {sentOrders.map(order => (
              <div key={order.id} className="bg-white/40 backdrop-blur-sm border border-slate-200 rounded-[1.5rem] p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{order.id} <span className="text-slate-400 ml-2 font-normal text-xs">{order.table}</span></p>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Cooking...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">{order.items.length} items</p>
                </div>
              </div>
            ))}
            {sentOrders.length === 0 && (
              <div className="bg-white/20 border border-slate-200 border-dashed rounded-[2rem] p-8 text-center text-slate-400 font-semibold text-sm">
                No orders sent yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
