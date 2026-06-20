import { useState, useEffect } from 'react';
import { User, Tag, Send, X, CreditCard } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { ordersService } from '../../services/ordersService';
import PaymentModal from './PaymentModal';

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
  
  const [customerList, setCustomerList] = useState([]);
  const [couponList, setCouponList] = useState([]);
  const [typedCoupon, setTypedCoupon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  // Fetch lists when modals are opened
  useEffect(() => {
    if (showCustomerModal) {
      ordersService.getCustomers().then(setCustomerList).catch(() => {});
    }
  }, [showCustomerModal]);

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
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-4 mb-4">
        Order Summary
      </h2>

      {/* Selected Loyalty / Promo Labels */}
      <div className="space-y-2 mb-6">
        {customer && (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <span className="flex items-center gap-1.5"><User size={14}/> Customer: {customer.name}</span>
            <button onClick={() => setCustomer(null)} className="hover:text-rose-400 cursor-pointer"><X size={14}/></button>
          </div>
        )}
        {coupon && (
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <span className="flex items-center gap-1.5"><Tag size={14}/> Discount Applied: {coupon.code}</span>
            <button onClick={() => setCoupon(null)} className="hover:text-rose-400 cursor-pointer"><X size={14}/></button>
          </div>
        )}
      </div>

      {/* Pricing Math */}
      <div className="flex-1 space-y-3.5">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono text-slate-200 font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>Tax</span>
          <span className="font-mono text-slate-200 font-medium">${tax.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-rose-400">
            <span>Discount</span>
            <span className="font-mono font-medium">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xl text-slate-100 border-t border-slate-800 pt-4 mt-2">
          <span>Total</span>
          <span className="font-mono text-amber-500">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCustomerModal(true)}
            className="flex items-center justify-center gap-2 bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <User size={14} /> Customer
          </button>
          <button
            onClick={() => setShowCouponModal(true)}
            className="flex items-center justify-center gap-2 bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Tag size={14} /> Discount
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleCheckout(false)}
            disabled={isSubmitting}
            className="flex-1 bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <Send size={14} /> Kitchen
          </button>
          <button
            onClick={() => handleCheckout(true)}
            disabled={isSubmitting}
            className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-amber-900/10 cursor-pointer"
          >
            <CreditCard size={14} /> Pay Now
          </button>
        </div>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowCustomerModal(false)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-100 mb-4">Select Customer</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {customerList.map(cust => (
                <button
                  key={cust.id}
                  onClick={() => { setCustomer(cust); setShowCustomerModal(false); }}
                  className="w-full text-left bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl flex flex-col cursor-pointer transition-colors"
                >
                  <span className="text-slate-200 font-semibold text-sm">{cust.name}</span>
                  <span className="text-slate-500 text-xs mt-0.5">{cust.phone_number || cust.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowCouponModal(false)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-100 mb-4">Apply Coupon</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. WELCOME10)"
                  value={typedCoupon}
                  onChange={(e) => setTypedCoupon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors uppercase font-mono tracking-wider placeholder-slate-600"
                />
                <button
                  onClick={handleApplyCouponCode}
                  className="w-full mt-3 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Apply Code
                </button>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Available Coupons</span>
                <div className="grid grid-cols-2 gap-2">
                  {couponList.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setCoupon(c); setShowCouponModal(false); }}
                      className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl flex flex-col text-left cursor-pointer transition-colors"
                    >
                      <span className="text-amber-500 font-bold font-mono text-sm">{c.code}</span>
                      <span className="text-slate-400 text-xs mt-1">
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
          onPaymentSuccess={() => {
            // Callback on successful payment (can do things like sound effects or notifications)
          }}
        />
      )}
    </div>
  );
}
