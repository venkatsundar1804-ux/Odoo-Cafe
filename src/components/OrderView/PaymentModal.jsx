import { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, Smartphone, Building2, Wallet, X, Loader2, CheckCircle2 } from 'lucide-react';
import { ordersService } from '../../services/ordersService';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentModal({ isOpen, onClose, orderId, totalAmount, customer, onPaymentSuccess, appliedPromo, discountAmount }) {
  const [step, setStep] = useState('methods'); // 'methods', 'processing', 'success'
  const [selectedMethod, setSelectedMethod] = useState('');

  useEffect(() => {
    if (isOpen) setStep('methods');
  }, [isOpen]);

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
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-xl w-full max-w-[380px] overflow-hidden shadow-2xl relative font-sans flex flex-col"
          >
            
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
          <div className="mt-4 flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-blue-200 font-medium">₹</span>
              <span className="text-3xl font-bold tracking-tight">{totalAmount?.toFixed(2)}</span>
            </div>
            {appliedPromo && (
              <div className="mt-1 flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">
                  Promo Applied
                </span>
                <span className="text-blue-200 text-xs font-medium">
                  {appliedPromo.code} (-₹{discountAmount?.toFixed(2)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="bg-white min-h-[350px] flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {step === 'methods' && (
              <motion.div 
                key="methods"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col bg-white z-10"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cards, UPI & More</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    100% Secure
                  </div>
                </div>
                
                <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
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
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50/90 backdrop-blur-sm z-20"
              >
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-slate-800">Processing Payment</h3>
                <p className="text-slate-500 text-sm mt-2 text-center font-medium">Please do not close this window or press back.</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-emerald-50/90 backdrop-blur-sm z-30"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-800">Payment Successful</h3>
                <p className="text-slate-500 text-sm mt-2 mb-8 font-medium">Your transaction has been processed securely.</p>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-colors cursor-pointer w-full shadow-lg"
                >
                  Close & Return
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>English</span>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="text-blue-600 text-xs tracking-tight capitalize font-black">Razorpay</span>
          </div>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
