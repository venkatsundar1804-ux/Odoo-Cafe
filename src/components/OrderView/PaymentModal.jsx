import { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, Smartphone, Building2, Wallet, X, Loader2, CheckCircle2 } from 'lucide-react';
import { ordersService } from '../../services/ordersService';

export default function PaymentModal({ isOpen, onClose, orderId, totalAmount, customer, onPaymentSuccess }) {
  const [step, setStep] = useState('methods'); // 'methods', 'processing', 'success'
  const [selectedMethod, setSelectedMethod] = useState('');

  if (!isOpen) return null;

  const handlePay = (method) => {
    setSelectedMethod(method);
    setStep('processing');
    
    // Simulate Razorpay network request delay
    setTimeout(async () => {
      try {
        if (onPaymentSuccess) await onPaymentSuccess(method);
        setStep('success');
      } catch (err) {
        setStep('methods');
        alert("Payment failed");
      }
    }, 2000);
  };

  const handleClose = () => {
    setStep('methods');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-[4px] w-full max-w-[380px] overflow-hidden shadow-2xl relative font-sans flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Razorpay Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white relative">
          {step === 'methods' && (
            <button onClick={handleClose} className="absolute right-4 top-4 text-blue-200 hover:text-white cursor-pointer transition-colors">
              <X size={20} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner">
              O
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Odoo Cafe</h2>
              <p className="text-blue-200 text-xs font-medium tracking-wide">Order #{orderId}</p>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-blue-200 font-medium">₹</span>
            <span className="text-3xl font-bold tracking-tight">{totalAmount?.toFixed(2)}</span>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white min-h-[350px] flex flex-col relative">
          
          {step === 'methods' && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cards, UPI & More</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  100% Secure
                </div>
              </div>
              
              <div className="p-2 space-y-1 overflow-y-auto">
                <button onClick={() => handlePay('upi')} className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded border border-slate-200 flex items-center justify-center bg-white group-hover:border-blue-200 group-hover:shadow-sm transition-all shrink-0">
                    <Smartphone className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800 text-sm">UPI / QR</h3>
                    <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                  </div>
                </button>
                
                <button onClick={() => handlePay('card')} className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded border border-slate-200 flex items-center justify-center bg-white group-hover:border-blue-200 group-hover:shadow-sm transition-all shrink-0">
                    <CreditCard className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800 text-sm">Card</h3>
                    <p className="text-xs text-slate-500">Visa, MasterCard, RuPay & More</p>
                  </div>
                </button>

                <button onClick={() => handlePay('netbanking')} className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded border border-slate-200 flex items-center justify-center bg-white group-hover:border-blue-200 group-hover:shadow-sm transition-all shrink-0">
                    <Building2 className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800 text-sm">Netbanking</h3>
                    <p className="text-xs text-slate-500">All Indian Banks</p>
                  </div>
                </button>

                <button onClick={() => handlePay('wallet')} className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded border border-slate-200 flex items-center justify-center bg-white group-hover:border-blue-200 group-hover:shadow-sm transition-all shrink-0">
                    <Wallet className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800 text-sm">Wallets</h3>
                    <p className="text-xs text-slate-500">Amazon Pay, Freecharge, etc.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Processing Payment</h3>
              <p className="text-slate-500 text-sm mt-1 text-center">Please do not close this window or press back.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-emerald-50/10">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Payment Successful</h3>
              <p className="text-slate-500 text-sm mt-2 mb-6">Your transaction has been processed securely.</p>
              <button 
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-[4px] transition-colors cursor-pointer w-full"
              >
                Close & Return
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>English</span>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="text-blue-600 text-xs tracking-tight capitalize font-black">Razorpay</span>
          </div>
        </div>

      </div>
    </div>
  );
}
