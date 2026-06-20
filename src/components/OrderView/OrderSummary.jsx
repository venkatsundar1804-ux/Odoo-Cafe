import { useState, useEffect } from 'react';
import { User, Tag, Send, X, CreditCard } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { ordersService } from '../../services/ordersService';
import PaymentModal from './PaymentModal';
import { useCustomerStore } from '../../store/customerStore';

export default function OrderSummary({ selectedTableId }) {
  const { 
    cart, 
    customer, 
    coupon, 
    setCustomer, 
    setCoupon, 
    getTotals, 
    clearCart 
  } = useCartStore();

  const { subtotal, tax, discountAmount, total } = getTotals();

  // Modals Local State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { fetchCustomers, customers: customerList } = useCustomerStore();
  const [couponList, setCouponList] = useState([]);
  const [typedCoupon, setTypedCoupon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  // Fetch lists when modals are opened
  useEffect(() => {
    if (showCustomerModal) {
      fetchCustomers();
    }
  }, [showCustomerModal, fetchCustomers]);

  useEffect(() => {
    if (showCouponModal) {
      ordersService.getCoupons().then(setCouponList).catch(() => {});
    }
  }, [showCouponModal]);

  const handleCheckout = async (payImmediately = false) => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    setIsSubmitting(true);
    const orderPayload = {
      table_id: selectedTableId,
      customer_id: customer ? customer.id : null,
      coupon_code: coupon ? coupon.code : null,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const order = await ordersService.createOrder(orderPayload);
      if (payImmediately) {
        setCreatedOrderId(order.id);
        setShowPaymentModal(true);
      } else {
        alert(`Order #${order.id} sent successfully to kitchen!`);
        clearCart();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCouponCode = () => {
    const matched = couponList.find(c => c.code.toUpperCase() === typedCoupon.toUpperCase() && c.is_active);
    if (matched) {
      setCoupon(matched);
      setShowCouponModal(false);
      setTypedCoupon('');
    } else {
      alert("Invalid or inactive coupon code!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/85 rounded-2xl p-6 shadow-lg">
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-4 mb-4 shrink-0">
        Summary
      </h2>

      {/* Selected Loyalty / Promo Labels */}
      <div className="space-y-2 mb-6 shrink-0">
        {customer && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 text-emerald-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
            <span className="flex items-center gap-1.5"><User size={13}/> {customer.name}</span>
            <button onClick={() => setCustomer(null)} className="hover:text-rose-500 cursor-pointer"><X size={13}/></button>
          </div>
        )}
        {coupon && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-100 text-amber-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
            <span className="flex items-center gap-1.5"><Tag size={13}/> Promo: {coupon.code}</span>
            <button onClick={() => setCoupon(null)} className="hover:text-rose-500 cursor-pointer"><X size={13}/></button>
          </div>
        )}
      </div>

      {/* Pricing Math */}
      <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Subtotal</span>
          <span className="font-mono text-slate-800">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Tax</span>
          <span className="font-mono text-slate-800">${tax.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-xs text-rose-600 font-medium">
            <span>Discount</span>
            <span className="font-mono">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-extrabold text-xl text-slate-800 border-t border-slate-100 pt-4 mt-2">
          <span>Total</span>
          <span className="font-mono text-indigo-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3 shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCustomerModal(true)}
            className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
          >
            <User size={13} /> Customer
          </button>
          <button
            onClick={() => setShowCouponModal(true)}
            className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
          >
            <Tag size={13} /> Discount
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleCheckout(false)}
            disabled={isSubmitting}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-4 px-4 rounded-xl transition-all duration-200 hover:scale-[1.03] flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <Send size={13} /> Kitchen
          </button>
          <button
            onClick={() => handleCheckout(true)}
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 text-white font-extrabold py-4 px-4 rounded-xl transition-all duration-200 hover:scale-[1.03] flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-100 cursor-pointer"
          >
            <CreditCard size={13} /> Pay Now
          </button>
        </div>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowCustomerModal(false)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-4">Select Customer</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {customerList.map(cust => (
                <button
                  key={cust.id}
                  onClick={() => { setCustomer(cust); setShowCustomerModal(false); }}
                  className="w-full text-left bg-slate-50 border border-slate-200 hover:border-slate-350 p-3 rounded-xl flex flex-col cursor-pointer transition-colors"
                >
                  <span className="text-slate-800 font-bold text-xs">{cust.name}</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">{cust.phone_number || cust.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowCouponModal(false)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-4">Apply Coupon</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. WELCOME10)"
                  value={typedCoupon}
                  onChange={(e) => setTypedCoupon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors uppercase font-mono tracking-wider placeholder-slate-400 text-xs"
                />
                <button
                  onClick={handleApplyCouponCode}
                  className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-xs uppercase tracking-wider"
                >
                  Apply Code
                </button>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Available Coupons</span>
                <div className="grid grid-cols-2 gap-2">
                  {couponList.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setCoupon(c); setShowCouponModal(false); }}
                      className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-3 rounded-xl flex flex-col text-left cursor-pointer transition-colors"
                    >
                      <span className="text-indigo-600 font-extrabold font-mono text-xs">{c.code}</span>
                      <span className="text-slate-400 text-[10px] mt-1">
                        {c.discount_type === 'percentage' ? `${c.value}% Off` : `$${c.value} Off`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment & Receipt Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => { setShowPaymentModal(false); clearCart(); }}
          orderId={createdOrderId}
          totalAmount={total}
          customer={customer}
          cartItems={cart}
          subtotal={subtotal}
          tax={tax}
          discountAmount={discountAmount}
          onPaymentSuccess={() => {}}
        />
      )}
    </div>
  );
}
