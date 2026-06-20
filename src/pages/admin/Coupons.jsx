import { useState } from 'react';
import { Plus, Trash2, Tag, Percent, Calendar } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'WELCOME10', discount: 10, expiry: '2026-12-31' },
    { id: 2, code: 'CAFEWEEKEND', discount: 15, expiry: '2026-08-15' },
    { id: 3, code: 'FESTIVE20', discount: 20, expiry: '2026-10-01' },
  ]);

  const deleteCoupon = (id) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons & Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">Configure active promotional coupon codes and percentage discounts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Coupon Code</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Discount (%)</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Expiry Date</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-mono font-bold text-slate-955 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {coupon.code}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <Percent className="w-4 h-4 text-slate-500" />
                    <span>{coupon.discount}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{coupon.expiry}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteCoupon(coupon.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
