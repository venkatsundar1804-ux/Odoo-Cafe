import { useState, useEffect } from 'react';
import { Banknote, QrCode, CreditCard, Printer, Mail, CheckCircle2, X } from 'lucide-react';
import { ordersService } from '../../services/ordersService';

export default function PaymentModal({ isOpen, onClose, orderId, totalAmount, customer, cartItems, subtotal, tax, discountAmount, onPaymentSuccess }) {
  const [activeTab, setActiveTab] = useState('cash');
  const [paymentStep, setPaymentStep] = useState('payment'); // 'payment' or 'receipt'

  // Cash Tab States
  const [cashReceived, setCashReceived] = useState('');
  const [changeDue, setChangeDue] = useState(0);

  // Card Tab States
  const [transactionRef, setTransactionRef] = useState('');

  // Email States
  const [emailAddress, setEmailAddress] = useState(customer?.email || '');
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate change due when cash received changes
  useEffect(() => {
    const received = parseFloat(cashReceived) || 0;
    setChangeDue(Math.max(0, received - totalAmount));
  }, [cashReceived, totalAmount]);

  // Polling for UPI payment status
  useEffect(() => {
    let pollingInterval;

    // Only poll if the modal is on the UPI/QR tab and we have a valid order initialized
    if (activeTab === 'upi' && orderId && paymentStep === 'payment') {
      pollingInterval = setInterval(async () => {
        const status = await ordersService.checkOrderStatus(orderId);
        
        if (status === 'Paid') {
          clearInterval(pollingInterval); // Stop checking
          
          // Trigger your existing success transition logic!
          setPaymentStep('receipt'); 
          if (onPaymentSuccess) onPaymentSuccess(activeTab);
        }
      }, 3000); // Ping every 3 seconds
    }

    // Cleanup interval if the user closes the modal or switches tabs
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [activeTab, orderId, paymentStep, onPaymentSuccess]);

  if (!isOpen) return null;

  const handleFinalizePayment = async () => {
    setIsSubmitting(true);
    let details = {};
    if (activeTab === 'cash') {
      details = { cash_received: parseFloat(cashReceived) || totalAmount, change_due: changeDue };
    } else if (activeTab === 'card') {
      details = { transaction_ref: transactionRef };
    } else if (activeTab === 'upi') {
      details = { upi_confirmed: true };
    }

    try {
      await ordersService.payOrder(orderId, activeTab, details);
      setPaymentStep('receipt');
      if (onPaymentSuccess) onPaymentSuccess(activeTab);
    } catch (err) {
      console.error(err);
      alert("Payment recording failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress) return;
    try {
      await ordersService.sendEmailReceipt(orderId, emailAddress);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to send email.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80/30 backdrop-blur-sm print:relative print:inset-auto print:bg-white print:text-black">
      <div className="bg-white/80 border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] print:border-none print:bg-white print:max-h-full print:shadow-none">
        
        {/* Close Button (Hidden on receipt & print) */}
        {paymentStep === 'payment' && (
          <button 
            onClick={onClose} 
            className="absolute right-6 top-6 text-slate-500 hover:text-slate-800 cursor-pointer print:hidden"
          >
            <X size={20} />
          </button>
        )}

        {paymentStep === 'payment' ? (
          /* PAYMENT STEP */
          <>
            <div className="p-6 border-b border-slate-200/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Finalize Payment</h2>
              <p className="text-slate-500 text-xs mt-1">Select method and enter transaction details.</p>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex gap-6">
              {/* Left Pane: Payment Methods Tabs */}
              <div className="w-1/3 flex flex-col gap-2 border-r border-slate-200/50 pr-4">
                <button
                  onClick={() => setActiveTab('cash')}
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    activeTab === 'cash'
                      ? 'bg-amber-100/50 border-amber-500 text-amber-500 font-bold'
                      : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <Banknote size={18} />
                  <span className="text-xs uppercase tracking-wider font-semibold">Cash</span>
                </button>
                <button
                  onClick={() => setActiveTab('upi')}
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    activeTab === 'upi'
                      ? 'bg-amber-100/50 border-amber-500 text-amber-500 font-bold'
                      : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <QrCode size={18} />
                  <span className="text-xs uppercase tracking-wider font-semibold">UPI (QR)</span>
                </button>
                <button
                  onClick={() => setActiveTab('card')}
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    activeTab === 'card'
                      ? 'bg-amber-100/50 border-amber-500 text-amber-500 font-bold'
                      : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="text-xs uppercase tracking-wider font-semibold">Card</span>
                </button>
              </div>

              {/* Right Pane: Selected Method Forms */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Total Header */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Due</span>
                    <span className="text-2xl font-black font-mono text-amber-500">₹{totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Cash Form */}
                  {activeTab === 'cash' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">Amount Tendered</label>
                        <input
                          type="number"
                          placeholder="e.g. 50.00"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-lg placeholder-slate-700"
                        />
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-200/50 pt-4">
                        <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Change Due</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">₹{changeDue.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* UPI Form */}
                  {activeTab === 'upi' && (
                    <div className="flex flex-col items-center justify-center p-4 border border-slate-200 bg-white/60 rounded-2xl space-y-4">
                      <div className="bg-white p-3 rounded-xl">
                        {/* Dynamic QR API pointing mock UPI URL */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=odoocafe@upi&pn=Odoo%20Cafe&am=${totalAmount}`)}`}
                          alt="UPI Payment QR Code"
                          className="w-36 h-36"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Scan to Pay via UPI</span>
                    </div>
                  )}

                  {/* Card Form */}
                  {activeTab === 'card' && (
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">Transaction Reference</label>
                      <input
                        type="text"
                        placeholder="Auth Code / Last 4 Digits"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl focus:outline-none focus:border-amber-500 font-mono placeholder-slate-700"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleFinalizePayment}
                  disabled={isSubmitting || (activeTab === 'cash' && (!cashReceived || parseFloat(cashReceived) < totalAmount))}
                  className="w-full mt-6 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Finalizing..." : "Complete Payment"}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* RECEIPT STEP */
          <>
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center print:p-0">
              <div className="text-center flex flex-col items-center border-b border-slate-200/50 pb-6 w-full print:border-b-2 print:border-black print:pb-4 print:text-black">
                <CheckCircle2 className="text-emerald-500 w-16 h-16 mb-4 animate-bounce print:hidden" />
                <h2 className="text-2xl font-black tracking-tight text-slate-800 print:text-black">Thank You!</h2>
                <p className="text-slate-500 text-xs mt-1 print:text-black">Order has been processed and paid successfully.</p>
              </div>

              {/* Printable Receipt Area */}
              <div className="w-full max-w-sm border border-slate-200 bg-white/60 p-6 rounded-2xl mt-6 space-y-4 font-mono text-xs print:border-none print:bg-white print:text-black print:p-0 print:mt-4 print:max-w-full">
                <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-200 print:border-black">
                  <h3 className="font-bold text-sm uppercase text-slate-800 print:text-black">Odoo Cafe POS</h3>
                  <p className="text-slate-500 print:text-black">Receipt #{orderId}</p>
                  <p className="text-slate-500 print:text-black">{new Date().toLocaleString()}</p>
                </div>

                {/* Cart Items List */}
                <div className="space-y-2 py-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-700 print:text-black">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Math breakdown */}
                <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 print:border-black">
                  <div className="flex justify-between text-slate-500 print:text-black">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 print:text-black">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-400 print:text-black">
                      <span>Discount</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-800 pt-2 border-t border-slate-200/50 print:border-black print:text-black">
                    <span>Total Paid ({activeTab.toUpperCase()})</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cash Specific Footer */}
                {activeTab === 'cash' && (
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-900 print:text-black print:border-black">
                    <div className="flex justify-between"><span>Cash Tendered:</span><span>₹{(parseFloat(cashReceived) || totalAmount).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Change Given:</span><span>₹{changeDue.toFixed(2)}</span></div>
                  </div>
                )}
              </div>

              {/* Receipt Action Panel */}
              <div className="w-full flex flex-col gap-4 mt-8 print:hidden">
                <div className="flex gap-4">
                  <button
                    onClick={handlePrint}
                    className="flex-1 bg-slate-50/80 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Printer size={16} /> Print Receipt
                  </button>
                  
                  {/* Email Section */}
                  <div className="flex-1 flex gap-2">
                    <input
                      type="email"
                      placeholder="receipt@customer.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-xs placeholder-slate-700"
                    />
                    <button
                      onClick={handleSendEmail}
                      className="bg-slate-50/80 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-4 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Mail size={16} />
                    </button>
                  </div>
                </div>

                {emailSent && (
                  <span className="text-xs text-emerald-400 text-center font-semibold">Receipt email sent successfully!</span>
                )}

                <button
                  onClick={onClose}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl cursor-pointer transition-colors"
                >
                  Start New Order
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
