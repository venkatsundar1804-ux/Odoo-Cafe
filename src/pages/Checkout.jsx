import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Plus, Minus, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { resolveImage } from '../utils/imageResolver';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, getTotals, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  
  const { subtotal } = getTotals();
  const shippingCost = cart.length > 0 ? 4.99 : 0;
  const total = subtotal + shippingCost;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = () => {
    alert("Promo logic not implemented yet.");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    alert("Checkout successful! Generating receipt...");
    clearCart();
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full bg-[#ebf0f5] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-white/40 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/40 rounded-full blur-[100px]" />

      {/* Main Checkout Device Frame */}
      <div 
        className="relative z-10 w-full max-w-[420px] bg-[#f0f3f8] rounded-[3rem] p-8 pb-10 flex flex-col"
        style={{
          boxShadow: '-20px -20px 60px rgba(255,255,255,0.8), 20px 20px 60px rgba(170,182,209,0.5)'
        }}
      >
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800" strokeWidth={2.5} />
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
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 font-semibold py-10">
              Your bag is empty.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 relative">
                
                {/* Remove button overlay */}
                <button 
                  onClick={() => {
                    // Quick hack to completely remove item: we decrease qty until 0
                    // Ideally we'd have a removeEntireItem method in the store
                    alert("Remove item logic"); 
                  }}
                  className="absolute top-0 right-0 p-1 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Item Image */}
                <div 
                  className="w-20 h-20 bg-white rounded-[1.25rem] flex items-center justify-center shrink-0 p-2"
                  style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}
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

              </div>
            ))
          )}
        </div>

        {/* Promo Code */}
        <div className="flex items-center gap-2 mb-8">
          <input 
            type="text"
            placeholder="Promo Code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 bg-white border-none rounded-2xl px-5 py-4 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none shadow-[0_8px_20px_rgba(0,0,0,0.03)]"
          />
          <button 
            onClick={handleApplyPromo}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-4 rounded-2xl transition shadow-[0_8px_16px_rgba(15,23,42,0.2)] cursor-pointer"
          >
            Apply
          </button>
        </div>

        {/* Totals */}
        <div className="space-y-4 mb-8 text-sm px-1">
          <div className="flex justify-between font-bold">
            <span className="text-slate-600">Subtotal</span>
            <span className="text-slate-800">₹{subtotal.toFixed(2)} <span className="text-[10px] text-slate-400 ml-1">INR</span></span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-slate-600">Shipping</span>
            <span className="text-slate-800">₹{shippingCost.toFixed(2)} <span className="text-[10px] text-slate-400 ml-1">INR</span></span>
          </div>
          <div className="flex justify-between font-black text-lg pt-2 border-t border-slate-200/50">
            <span className="text-slate-800">Bag Total</span>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-bold mr-3 tracking-wide">({totalItems} items)</span>
              <span className="text-slate-800">₹{total.toFixed(2)} <span className="text-xs text-slate-400 ml-1">INR</span></span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button 
          onClick={handleCheckout}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-base py-5 rounded-[1.5rem] transition shadow-[0_15px_30px_rgba(15,23,42,0.2)] cursor-pointer tracking-wide"
        >
          Proceed To Checkout
        </button>

      </div>
    </div>
  );
}
