import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { mockCategories } from '../data/mockCategories';
import { 
  Plus, 
  Minus, 
  Search, 
  Calculator, 
  Pencil, 
  PlusSquare, 
  Armchair, 
  User, 
  Menu 
} from 'lucide-react';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(mockCategories);
  const [selectedTableId] = useState(1); 
  const [searchQuery, setSearchQuery] = useState('');
  
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
        console.error("Failed to fetch POS data, using mock categories", err);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
        {/* Left Side: Logo & Search */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-amber-700 text-white font-bold rounded-xl text-sm flex items-center justify-center tracking-wider shadow-sm">
            Logo
          </div>
          
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
        </div>

        {/* Center: Interactive Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Cash Register">
            <Calculator className="w-5 h-5" />
          </button>
          
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Edit Session">
            <Pencil className="w-5 h-5" />
          </button>
          
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Add Item">
            <PlusSquare className="w-5 h-5" />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 font-bold rounded-xl border border-slate-200/55 text-xs transition-colors cursor-pointer" title="Table Selection">
            <Armchair className="w-4 h-4 text-amber-600" />
            <span>12 V</span>
          </button>
        </div>

        {/* Right Side: Profile & Menu Drawer Trigger */}
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Profile">
            <User className="w-5 h-5" />
          </button>
          
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Admin Menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-[200px_1fr_350px] overflow-hidden">
        {/* Col 1: Categories */}
        <aside className="border-r border-slate-200 p-4 space-y-2 overflow-y-auto bg-white">
          {categories.map(cat => (
            <button key={cat.id} className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 text-sm font-semibold text-slate-700 transition-colors cursor-pointer">
              {cat.name}
            </button>
          ))}
        </aside>

        {/* Col 2: Products */}
        <main className="p-6 overflow-y-auto grid grid-cols-3 gap-4 auto-rows-min bg-slate-50">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-200/60 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-sm transition-all duration-200">
              <div>
                <h3 className="font-semibold text-slate-800">{product.name}</h3>
                <p className="text-amber-600 font-bold mt-1">₹{product.price}</p>
              </div>
              <button 
                onClick={() => addToCart(product)}
                className="w-full mt-4 bg-slate-50 hover:bg-amber-600 hover:text-white text-slate-750 font-semibold py-2 rounded-xl text-sm transition-colors border border-slate-200/80 hover:border-amber-600 cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </main>

        {/* Col 3: Cart */}
        <aside className="border-l border-slate-200 bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-rose-600 transition-colors cursor-pointer"><Minus size={14}/></button>
                  <span className="text-xs font-bold font-mono text-slate-700">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="p-1 hover:text-emerald-600 transition-colors cursor-pointer"><Plus size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 bg-white space-y-2">
            <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span className="font-semibold text-slate-700">₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-slate-500"><span>Tax (5%)</span><span className="font-semibold text-slate-700">₹{tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-2 text-slate-900"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            <button
              onClick={processCheckout}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl mt-2 cursor-pointer shadow-md shadow-amber-900/10 transition-colors"
            >
              Send to Kitchen
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
