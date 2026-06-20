import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { resolveImage } from '../../utils/imageResolver';

export default function CartList() {
  const { cart, addToCart, removeFromCart, clearCart } = useCartStore();

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          Shopping Cart <span className="bg-amber-500/10 text-amber-500 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </h2>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm font-medium">Cart is empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 transition-all hover:border-slate-700/80"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={resolveImage(item.name)} 
                  alt={item.name} 
                  className="w-12 h-12 object-cover rounded-lg border border-slate-700/50" 
                />
                <div className="flex flex-col">
                  <span className="text-slate-100 font-semibold text-sm leading-tight">
                    {item.name}
                  </span>
                  <span className="text-slate-500 text-xs mt-1 font-mono">
                    ${item.price.toFixed(2)} each
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-slate-200">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="w-16 text-right font-mono font-bold text-slate-100 text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
