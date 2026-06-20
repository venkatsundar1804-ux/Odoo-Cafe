import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Payment() {
  const navigate = useNavigate();
  const { cart, getTotals, clearCart } = useCartStore();
  const [selectedMethod, setSelectedMethod] = useState('mastercard');
  
  const { subtotal } = getTotals();
  const shippingCost = cart.length > 0 ? 4.99 : 0;
  const total = subtotal + shippingCost;

  const handleConfirmOrder = () => {
    alert("Order confirmed successfully! Payment processed via " + selectedMethod.toUpperCase());
    clearCart();
    navigate('/admin/products');
  };

  return (
    <div className="min-h-screen w-full bg-[#ebf0f5] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-white/40 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/40 rounded-full blur-[100px]" />

      {/* Main Payment Device Frame */}
      <div 
        className="relative z-10 w-full max-w-[420px] bg-[#f0f3f8] rounded-[3rem] p-8 pb-10 flex flex-col"
        style={{
          boxShadow: '-20px -20px 60px rgba(255,255,255,0.8), 20px 20px 60px rgba(170,182,209,0.5)'
        }}
      >
        
        {/* Header */}
        <header className="flex items-center mb-10 relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 p-2 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800" strokeWidth={2.5} />
          </button>
          
          <h1 className="w-full text-center text-lg font-bold text-slate-800">Payment Method</h1>
        </header>

        {/* Shipping To Section */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Shipping to</h2>
          <div className="flex items-center gap-5">
            {/* Map Placeholder */}
            <div className="w-[88px] h-[88px] rounded-[1.5rem] bg-white shadow-[0_10px_20px_rgba(0,0,0,0.04)] p-1 relative overflow-hidden flex items-center justify-center shrink-0">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 to-transparent background-grid" />
              <div className="w-10 h-10 bg-white rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.1)] flex items-center justify-center relative z-10">
                <MapPin className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Home</h3>
              <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                1470 Cader Lane, Petaluma<br/>
                CA 9495, Australia
              </p>
            </div>
          </div>
        </div>

        {/* Add Payment Method Section */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Add Payment Method</h2>
          <div className="flex gap-4">
            
            {/* Mastercard */}
            <button 
              onClick={() => setSelectedMethod('mastercard')}
              className={`w-16 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer relative ${selectedMethod === 'mastercard' ? 'bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] border-2 border-slate-800' : 'bg-transparent border-2 border-transparent hover:bg-white/50'}`}
            >
              <div className="flex relative">
                <div className="w-6 h-6 rounded-full bg-[#eb001b] opacity-90 z-10"></div>
                <div className="w-6 h-6 rounded-full bg-[#f79e1b] opacity-90 -ml-3 z-0"></div>
              </div>
            </button>



            {/* UPI (Replacing Google) */}
            <button 
              onClick={() => setSelectedMethod('upi')}
              className={`w-16 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer relative ${selectedMethod === 'upi' ? 'bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] border-2 border-slate-800' : 'bg-transparent border-2 border-transparent hover:bg-white/50'}`}
            >
              <span className="font-black text-slate-800 tracking-tighter text-sm">UPI</span>
            </button>

          </div>
        </div>

        {selectedMethod === 'mastercard' && (
          <div className="w-full h-52 bg-gradient-to-br from-[#1e1e24] to-[#0a0a0c] rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] mb-10 flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-transform duration-500">
            {/* Subtle gloss overlay */}
            <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 pointer-events-none group-hover:translate-x-4 transition-transform duration-1000" />
            
            <div className="flex justify-between items-center relative z-10">
              <span className="text-xs font-medium text-slate-300/80 tracking-widest">Credit Card</span>
              <span className="text-lg font-black italic tracking-wider opacity-90">VISA</span>
            </div>

            <div className="relative z-10 mt-2">
              {/* Chip */}
              <div className="w-11 h-8 rounded bg-gradient-to-br from-[#d4af37] to-[#aa8c2c] overflow-hidden flex flex-wrap opacity-80">
                <div className="w-full h-[1px] bg-black/20 mt-2"></div>
                <div className="w-full h-[1px] bg-black/20 mt-2"></div>
                <div className="w-[1px] h-full bg-black/20 absolute left-3"></div>
                <div className="w-[1px] h-full bg-black/20 absolute right-3"></div>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="font-mono text-xl tracking-[0.2em] font-medium text-slate-100 drop-shadow-md">
                4315  0245  4480  0345
              </div>
              
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">
                  Mahmudur Rahman
                </span>
                <div className="flex relative scale-90 origin-bottom-right opacity-90">
                  <div className="w-6 h-6 rounded-full bg-[#eb001b] z-10"></div>
                  <div className="w-6 h-6 rounded-full bg-[#f79e1b] -ml-3 z-0"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'upi' && (
          <div className="w-full h-52 bg-white rounded-[1.5rem] p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] mb-10 flex flex-col items-center justify-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Scan to Pay</h3>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=odoo@upi&pn=OdooCafe&am=${total.toFixed(2)}&cu=INR`)}`} 
              alt="UPI QR Code" 
              className="w-28 h-28 mix-blend-multiply"
            />
            <p className="text-[10px] text-slate-400 mt-3 font-medium">Use any UPI app (GPay, PhonePe, Paytm)</p>
          </div>
        )}

        <div className="flex-1" />

        {/* Total Payment */}
        <div className="flex justify-between items-end font-bold px-1 mb-8">
          <span className="text-slate-600 text-sm">Total Payment</span>
          <div className="text-right">
            <span className="text-slate-800 text-xl">₹{total.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 ml-1 font-bold">INR</span>
          </div>
        </div>

        {/* Confirm Order Button */}
        <button 
          onClick={handleConfirmOrder}
          className="w-full bg-[#111] hover:bg-black text-white font-bold text-[15px] py-[22px] rounded-[1.75rem] transition shadow-[0_15px_30px_rgba(15,23,42,0.2)] cursor-pointer tracking-wide"
        >
          Confirm Order
        </button>

      </div>
    </div>
  );
}
