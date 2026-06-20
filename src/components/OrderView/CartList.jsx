import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export default function CartList() {
  const { cart, addToCart, removeFromCart, clearCart } = useCartStore();

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4 shrink-0">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          Cart <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </h2>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-[10px] uppercase tracking-wider text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 size={12} /> Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <svg className="w-10 h-10 stroke-current text-slate-300" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-xs font-semibold">Cart is empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 transition-all hover:border-slate-350 hover:bg-white/40"
            >
              <div className="flex flex-col max-w-[55%]">
                <span className="text-slate-800 font-bold text-xs leading-tight line-clamp-1">
                  {item.name}
                </span>
                <span className="text-slate-400 text-[10px] mt-1 font-mono">
                  ${item.price.toFixed(2)} each
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-xs font-mono font-bold text-slate-700">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-1 text-slate-400 hover:text-emerald-500 rounded transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="w-14 text-right font-mono font-bold text-slate-800 text-xs">
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
