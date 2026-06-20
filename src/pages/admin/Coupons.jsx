import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Percent, Calendar, DollarSign, Package } from 'lucide-react';
import Modal from '../../components/Modal';
import { usePromoStore } from '../../store/promoStore';

export default function Coupons() {
  const { promos, addPromo, removePromo, fetchPromos } = usePromoStore();
  const [products, setProducts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('percentage');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponProduct, setNewCouponProduct] = useState('');

  useEffect(() => {
    fetchPromos();
    fetch('http://127.0.0.1:8000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const deleteCoupon = (id) => {
    removePromo(id);
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponValue) return;

    await addPromo({
      code: newCouponCode.trim().toUpperCase(),
      discount_type: newCouponType,
      value: parseFloat(newCouponValue),
      product_id: newCouponProduct ? parseInt(newCouponProduct) : null
    });

    setNewCouponCode('');
    setNewCouponValue('');
    setNewCouponProduct('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons & Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">Configure active promotional coupon codes and discounts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-55/50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Coupon Code</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Discount</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Applies To</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {promos.map((coupon) => {
              const product = products.find(p => p.id === coupon.product_id);
              return (
                <tr key={coupon.id} className="hover:bg-slate-55/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                        {coupon.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                      {coupon.discount_type === 'percentage' ? (
                        <Percent className="w-4 h-4 text-slate-500" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-slate-500" />
                      )}
                      <span>
                        {coupon.discount_type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value.toFixed(2)}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-650 text-sm font-medium">
                      {coupon.product_id ? (
                        <>
                          <Package className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {product ? product.name : `Product #${coupon.product_id}`}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500">Entire Order</span>
                      )}
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
              );
            })}
            {promos.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-sm">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Coupon"
      >
        <form onSubmit={handleAddCoupon} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SUMMER25"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono uppercase"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Discount Type
              </label>
              <select
                value={newCouponType}
                onChange={(e) => setNewCouponType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Value
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="e.g. 15"
                value={newCouponValue}
                onChange={(e) => setNewCouponValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Applicable Product (Optional)
            </label>
            <select
              value={newCouponProduct}
              onChange={(e) => setNewCouponProduct(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            >
              <option value="">-- Apply to Entire Order --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Select a specific item if this coupon is an item-specific promo code.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-55 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors cursor-pointer"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
