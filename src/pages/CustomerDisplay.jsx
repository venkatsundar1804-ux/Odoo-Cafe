import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Coffee, ShieldCheck, QrCode, Monitor, Sparkles } from 'lucide-react';
import { getCfdWsUrl } from '../config';
import { useCfdStore } from '../store/cfdStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerDisplay() {
  const [searchParams] = useSearchParams();
  const tableIdFromUrl = searchParams.get('table_id');
  const tableId = tableIdFromUrl ? parseInt(tableIdFromUrl, 10) : 1;

  const { displayMode, orderData, setCFDState, resetCFD } = useCfdStore();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const wsRef = useRef(null);

  // Setup WebSocket connection to the CFD table-specific monitor
  useEffect(() => {
    let reconnectTimeout;
    const wsUrl = getCfdWsUrl(tableId);

    function connect() {
      console.log(`CFD connecting to: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsSocketConnected(true);
        console.log("CFD Socket connected successfully.");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log("CFD Socket payload received:", payload);
          // Payload expectation: { mode: 'order'|'payment'|'success', items, subtotal, tax, discount, total, coupon_code, customer_name }
          setCFDState(payload.mode || 'order', payload);
        } catch (error) {
          console.error("Error parsing CFD websocket packet", error);
        }
      };

      ws.onclose = () => {
        setIsSocketConnected(false);
        console.log("CFD Socket closed. Reconnecting...");
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("CFD Socket error", err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeout);
    };
  }, [tableId, setCFDState]);

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      
      {/* Upper Status Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img src="/odoo_cafe_logo.jpg" alt="Logo" className="w-8 h-8 object-cover rounded-md shadow-sm" />
          <span className="font-black text-lg tracking-tighter text-slate-100">Odoo Cafe Monitor</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-400">
            <Monitor size={12} className="text-amber-500" />
            <span>Screen {tableId}</span>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${isSocketConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
        </div>
      </header>

      {/* Main Display body based on mode */}
      <div className="flex-1 min-h-0">
        {displayMode === 'order' && <OrderView orderData={orderData} />}
        {displayMode === 'payment' && <PaymentView orderData={orderData} />}
        {displayMode === 'success' && <SuccessView resetCFD={resetCFD} />}
      </div>
    </div>
  );
}

/* 1. ORDER VIEW */
function OrderView({ orderData }) {
  // Slideshow images for marketing loop
  const promos = [
    { title: "Brewed to Perfection", desc: "Try our signature single-origin French Roast today.", code: "COFFEE10" },
    { title: "Sweet Delights", desc: "Pair your espresso with a fresh warm butter croissant.", code: "SWEET" }
  ];
  const [promoIdx, setPromoIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIdx((prev) => (prev + 1) % promos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const promo = promos[promoIdx];

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12">
      {/* Marketing Side (Left) */}
      <div className="lg:col-span-7 bg-slate-900/40 p-12 flex flex-col justify-between border-r border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/5 via-transparent to-transparent"></div>
        <div className="space-y-4 relative z-10">
          <span className="bg-amber-500/10 text-amber-400 text-xs px-3.5 py-1 rounded-full font-extrabold uppercase tracking-widest border border-amber-500/20">
            Fresh Promotion
          </span>
          <h2 className="text-4xl font-black text-slate-100 tracking-tight leading-tight mt-4">
            {promo.title}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            {promo.desc}
          </p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl max-w-xs relative z-10">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Use Promo Code</span>
          <span className="text-amber-500 font-extrabold font-mono text-base tracking-widest mt-1 block">{promo.code}</span>
        </div>
      </div>

      {/* Cart Side (Right) */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950 p-8 h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-900 pb-3">
            Your Order
          </h3>
          {orderData.items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-[60%] flex flex-col items-center justify-center text-slate-600 space-y-2"
            >
              <Coffee size={40} className="stroke-[1.5]" />
              <span className="text-xs">Welcome! Add items to begin.</span>
            </motion.div>
          ) : (
            <AnimatePresence>
              {orderData.items.map((item) => (
                <motion.div 
                  key={item.product_id || item.name} 
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex justify-between items-center py-2 border-b border-slate-900/50"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-100">{item.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">₹{item.price?.toFixed(2) || '0.00'} each</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                    <span className="w-16 text-right font-mono font-black text-slate-100 text-sm">
                      ₹{((item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pricing Math */}
        {orderData.items.length > 0 && (
          <div className="border-t border-slate-900 pt-6 mt-6 space-y-3.5 shrink-0">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">₹{orderData.subtotal.toFixed(2)}</span>
            </div>
            {orderData.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-rose-400">
                <span>Discount</span>
                <span className="font-mono">-₹{orderData.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-400">
              <span>Tax</span>
              <span className="font-mono text-slate-200">₹{orderData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-2xl border-t border-slate-900 pt-4 mt-2">
              <span className="text-slate-200">Total</span>
              <span className="font-mono text-amber-500">₹{orderData.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* 2. PAYMENT VIEW */
function PaymentView({ orderData }) {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative">
        <span className="bg-amber-500/10 text-amber-400 text-xs px-3.5 py-1 rounded-full font-extrabold uppercase tracking-widest border border-amber-500/20 mb-6">
          Payment Process
        </span>
        <h2 className="text-lg font-bold text-slate-300">Scan to Pay</h2>
        <p className="text-2xl font-black font-mono text-amber-500 mt-2">
          Total: ₹{orderData.total.toFixed(2)}
        </p>
        {orderData.discountAmount > 0 && orderData.coupon_code && (
          <p className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full mt-2 mb-4 border border-emerald-500/20">
            {orderData.coupon_code} Applied (-₹{orderData.discountAmount.toFixed(2)})
          </p>
        )}
        <div className={`bg-white p-4 rounded-2xl shadow-lg ${orderData.discountAmount > 0 && orderData.coupon_code ? 'mb-6' : 'mb-6 mt-4'}`}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=venkatvallai2004@okhdfcbank&pn=Odoo%20Cafe&am=${orderData.total}`)}`}
            alt="Payment QR"
            className="w-44 h-44"
          />
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
          <QrCode size={14} className="text-slate-500 animate-pulse" />
          <span>Supports all UPI Apps (GPay, PhonePe, Paytm)</span>
        </div>
      </div>
    </div>
  );
}

/* 3. SUCCESS / THANK YOU VIEW */
function SuccessView({ resetCFD }) {
  useEffect(() => {
    // Revert back to welcome order screen after 8 seconds
    const timeout = setTimeout(() => {
      resetCFD();
    }, 8000);
    return () => clearTimeout(timeout);
  }, [resetCFD]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-black p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 text-emerald-400 mb-6 animate-bounce">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-100 tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
          Payment Confirmed!
        </h2>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          Thank you for dining with Odoo Cafe. Your order has been sent to the kitchen and will be served shortly.
        </p>
        <div className="mt-8 flex items-center gap-2 text-[10px] text-slate-650 uppercase tracking-widest font-extrabold">
          <Sparkles size={12} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Enjoy your meal!</span>
        </div>
      </div>
    </div>
  );
}
