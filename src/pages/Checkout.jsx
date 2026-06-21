import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Plus, Minus, X, Tag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useTableStore } from '../store/tableStore';
import { resolveImage } from '../utils/imageResolver';
import { ordersService } from '../services/ordersService';
import PaymentModal from '../components/OrderView/PaymentModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderSyncStore } from '../store/orderSyncStore';
import { usePromoStore } from '../store/promoStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, getTotals, clearCart } = useCartStore();
  const { promos, fetchPromos, autoAppliedPromo, setAutoAppliedPromo } = usePromoStore();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    fetchPromos();
    // Auto-apply promo logic
    if (autoAppliedPromo) {
      setAppliedPromo(autoAppliedPromo);
      setPromoCode(autoAppliedPromo.code);
      setAutoAppliedPromo(null); // Clear it so it doesn't persist inappropriately
    }
  }, []);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  const { subtotal } = getTotals();
  const shippingCost = cart.length > 0 ? 4.99 : 0;
  
  let discountAmount = 0;
  if (appliedPromo) {
    let applicableSubtotal = subtotal;
    if (appliedPromo.product_id) {
      applicableSubtotal = cart
        .filter(item => item.id === appliedPromo.product_id)
        .reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }
    if (appliedPromo.discount_type === 'percentage') {
      discountAmount = applicableSubtotal * (appliedPromo.value / 100);
    } else {
      discountAmount = Math.min(appliedPromo.value, applicableSubtotal);
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = subtotal - discountAmount + shippingCost;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = () => {
    if (!promoCode) return;
    const validPromo = promos.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
    if (validPromo) {
      setAppliedPromo(validPromo);
    } else {
      alert("Invalid or expired Promo Code");
      setAppliedPromo(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    try {
      const orderPayload = {
        table_id: useTableStore.getState().currentTableId || 1,
        items: cart.map(item => ({ 
          product_id: item.id, 
          quantity: item.quantity,
          name: item.name,
          price: item.price
        })),
        coupon_code: appliedPromo ? appliedPromo.code : null
      };

      const createdOrder = await ordersService.createOrder(orderPayload);
      setCurrentOrderId(createdOrder.id);
      setIsPaymentOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to create order in database.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Cinematic Background Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-sky-200/50 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-amber-200/50 blur-[100px]" 
        />
      </div>

      {/* Main Checkout Device Frame */}
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[3rem] p-8 pb-10 flex flex-col shadow-[0_20px_60px_rgba(131,128,196,0.15)]"
      >
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/pos')}
            className="p-3 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-slate-800 hover:text-white text-slate-700 transition cursor-pointer border border-slate-200/50 flex items-center justify-center group"
            title="Back to POS"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-xl font-bold text-slate-800">Shopping Bag</h1>
          
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
            </div>
            {totalItems > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                {totalItems}
              </div>
            )}
          </div>
        </header>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-2 custom-scrollbar">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="text-center text-slate-400 font-semibold py-10"
              >
                Your bag is empty.
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  layout
                  className="flex items-center gap-4 relative"
                >
                  
                  {/* Remove button overlay */}
                  <button 
                    onClick={() => {
                      // Call removeFromCart completely. If quantity > 1, this just decrements.
                      // In a real app we'd have a removeEntireItem. For now, we loop or just decrement.
                      for (let i = 0; i < item.quantity; i++) removeFromCart(item.id);
                    }}
                    className="absolute top-0 right-0 p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Item Image */}
                  <div 
                    className="w-20 h-20 bg-white/80 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center shrink-0 p-2 border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
                  >
                    <img 
                      src={resolveImage(item.name)} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  
                  {/* Item Info */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-slate-800 text-[15px] truncate">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Standard size</p>
                    <p className="font-bold text-slate-800 mt-1.5 text-base">₹{item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-4 self-end">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center text-slate-800">
                      {String(item.quantity).padStart(2, '0')}
                    </span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Promo Code */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <input 
              type="text"
              placeholder="Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 bg-white/80 backdrop-blur-md border border-white rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 shadow-[0_8px_20px_rgba(0,0,0,0.03)] uppercase transition-colors"
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApplyPromo}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-4 rounded-2xl transition shadow-[0_8px_16px_rgba(79,70,229,0.2)] cursor-pointer"
            >
              Apply
            </motion.button>
          </div>
          
          {/* Show available promos for quick select */}
          {promos.length > 0 && !appliedPromo && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {promos.map(promo => {
                const label = promo.discount_type === 'percentage' ? `${promo.value}%` : `₹${promo.value}`;
                return (
                  <button
                    key={promo.code}
                    onClick={() => {
                      setPromoCode(promo.code);
                      setAppliedPromo(promo);
                    }}
                    className="shrink-0 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-emerald-100 transition"
                  >
                    {promo.code} (-{label})
                    {promo.product_id ? ' [Item Specific]' : ''}
                  </button>
                );
              })}
            </div>
          )}
          
          {appliedPromo && (
            <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 text-sm font-bold">
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4" /> {appliedPromo.code} Applied!
                {appliedPromo.product_id && <span className="text-xs bg-white/50 px-2 py-0.5 rounded-md ml-1">Item Specific</span>}
              </span>
              <button 
                onClick={() => { setAppliedPromo(null); setPromoCode(''); }}
                className="text-emerald-900 hover:text-emerald-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-4 mb-8 text-sm px-1">
          <div className="flex justify-between font-bold">
            <span className="text-slate-600">Subtotal</span>
            <span className="text-slate-800">₹{subtotal.toFixed(2)}</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between font-bold text-emerald-600">
              <span>Discount ({appliedPromo.discount_type === 'percentage' ? `${appliedPromo.value}%` : `₹${appliedPromo.value}`})</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <span className="text-slate-600">Shipping</span>
            <span className="text-slate-800">₹{shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-lg pt-2 border-t border-slate-200/50">
            <span className="text-slate-800">Bag Total</span>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-bold mr-3 tracking-wide">({totalItems} items)</span>
              <span className="text-slate-800">₹{total.toFixed(2)} <span className="text-xs text-slate-400 ml-1">INR</span></span>
            </div>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheckout}
          className="w-full bg-gradient-to-r from-[#8380C4] to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-base py-5 rounded-[1.5rem] transition shadow-[0_15px_30px_rgba(131,128,196,0.3)] cursor-pointer tracking-wide"
        >
          Proceed To Checkout
        </motion.button>

      </motion.div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          clearCart();
          navigate('/floor');
        }}
        totalAmount={total}
        orderId={currentOrderId}
        appliedPromo={appliedPromo}
        discountAmount={discountAmount}
        items={cart}
        onPaymentSuccess={async (paymentMethod) => {
          // Send payment confirmation to backend
          await ordersService.payOrder(currentOrderId, paymentMethod, {});

          // Push order to sync store
          useOrderSyncStore.getState().addOrder({
            id: currentOrderId,
            table: `T-${useTableStore.getState().currentTableId || 1}`,
            items: cart.map(i => ({ product_id: i.id, name: `${i.quantity}x ${i.name}`, quantity: i.quantity, price: i.price, completed: false })),
            total: total,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: new Date().toLocaleDateString(),
            status: 'pending',
            paymentMethod: paymentMethod === 'upi' ? 'qr' : paymentMethod
          });
        }}
      />
    </div>
  );
}
