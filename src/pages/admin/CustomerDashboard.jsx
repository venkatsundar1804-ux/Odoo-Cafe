import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Tag, Clock, Plus, Trash2, MapPin } from 'lucide-react';

export default function CustomerDashboard() {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4242', exp: '12/26' },
    { id: 2, type: 'Mastercard', last4: '8888', exp: '04/25' }
  ]);

  const pastOrders = [
    { id: 'ORD-1029', date: 'Oct 24, 2023', total: 45.50, items: 3, status: 'Completed' },
    { id: 'ORD-1015', date: 'Oct 21, 2023', total: 12.00, items: 1, status: 'Completed' },
    { id: 'ORD-0988', date: 'Oct 15, 2023', total: 89.90, items: 6, status: 'Completed' }
  ];

  const coupons = [
    { id: 1, code: 'WELCOME20', discount: '20% OFF', validUntil: 'Dec 31, 2023' },
    { id: 2, code: 'FREELATTE', discount: 'Free Coffee', validUntil: 'Nov 15, 2023' }
  ];

  return (
    <div className="p-8 space-y-8 text-slate-800 font-sans animate-fade-in pb-20">
      {/* Title */}
      <div className="border-b border-slate-200/60 pb-6">
        <h1 className="text-3xl font-light tracking-tight text-slate-900">
          Customer <span className="font-semibold text-amber-600">Portal</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Manage your profile & history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Orders */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-slate-800">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold">Past Orders</h2>
            </div>
            <div className="space-y-4">
              {pastOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-white/80 border border-slate-100 rounded-[1.5rem] hover:shadow-md transition cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold font-mono text-sm border border-amber-100">
                      {order.items}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{order.id}</p>
                      <p className="text-xs text-slate-400 font-medium">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 font-mono text-lg">${order.total.toFixed(2)}</p>
                    <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payments & Coupons */}
        <div className="space-y-8">
          {/* Payment Methods */}
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 text-slate-800">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold">Payment Methods</h2>
              </div>
              <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {paymentMethods.map(pm => (
                <div key={pm.id} className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[1.5rem] shadow-md relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                  <div>
                    <p className="font-bold text-sm">{pm.type}</p>
                    <p className="text-xs font-mono text-slate-400 mt-1">**** **** **** {pm.last4}</p>
                  </div>
                  <button 
                    onClick={() => setPaymentMethods(prev => prev.filter(p => p.id !== pm.id))}
                    className="p-2 bg-white/10 hover:bg-rose-500/80 text-white rounded-full transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Coupons */}
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-slate-800">
              <Tag className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold">Available Coupons</h2>
            </div>
            <div className="space-y-4">
              {coupons.map(coupon => (
                <div key={coupon.id} className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4 rounded-[1.5rem] flex items-center justify-between">
                  <div>
                    <p className="font-black text-emerald-700 text-lg">{coupon.discount}</p>
                    <p className="text-[10px] text-emerald-600/70 uppercase font-bold mt-1">Valid until {coupon.validUntil}</p>
                  </div>
                  <div className="bg-white text-emerald-800 font-mono font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                    {coupon.code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
