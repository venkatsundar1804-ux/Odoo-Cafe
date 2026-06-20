import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { Coffee, Plus, Minus, Clock, Trash } from 'lucide-react';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTableId] = useState(1); 
  
  const { cart, addToCart, removeFromCart, getTotals, clearCart } = useCartStore();
  const { subtotal, tax, total } = getTotals();

  // THE TEAM LEADER'S LOGIC
  const processCheckout = async () => {
    const orderPayload = {
      table_id: selectedTableId,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await axios.post('http://localhost:8000/api/orders/', orderPayload);
      console.log("Order Successful:", response.data);
      alert("Order sent to kitchen!");
      clearCart();
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Check the console.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get('http://localhost:8000/api/products'),
          axios.get('http://localhost:8000/api/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to fetch POS data", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900">
        <div className="flex items-center gap-2 text-amber-500 font-bold text-xl">
          <Coffee /> Odoo Cafe POS
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleTimeString()}
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-[200px_1fr_350px] overflow-hidden">
        {/* Col 1: Categories */}
        <aside className="border-r border-gray-800 p-4 space-y-2 overflow-y-auto">
          {categories.map(cat => (
            <button key={cat.id} className="w-full text-left px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800 text-sm font-medium">
              {cat.name}
            </button>
          ))}
        </aside>

        {/* Col 2: Products */}
        <main className="p-6 overflow-y-auto grid grid-cols-3 gap-4 auto-rows-min">
          {products.map(product => (
            <div key={product.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
              <div>
                <h3 className="font-semibold text-white">{product.name}</h3>
                <p className="text-amber-500 font-bold mt-1">₹{product.price}</p>
              </div>
              <button 
                onClick={() => addToCart(product)}
                className="w-full mt-4 bg-gray-800 hover:bg-amber-600 py-2 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </main>

        {/* Col 3: Cart */}
        <aside className="border-l border-gray-800 bg-gray-900 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-950 p-3 rounded-lg border border-gray-800">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-red-400 cursor-pointer"><Minus size={14}/></button>
                  <span className="text-xs font-mono">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="p-1 hover:text-green-400 cursor-pointer"><Plus size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800 bg-gray-900 space-y-2">
            <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-gray-400"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-800 pt-2"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            <button
              onClick={processCheckout}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg mt-2 cursor-pointer"
            >
              Send to Kitchen
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
