import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { mockCategories } from '../data/mockCategories';
import { mockProducts } from '../data/mockProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Search, 
  Calculator, 
  Pencil, 
  PlusSquare, 
  Armchair, 
  User, 
  Menu,
  Clock
} from 'lucide-react';

// Dynamic image resolver based on product name
const resolveImage = (productName) => {
  if (!productName) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394A3B8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M13 15 2 4"/><path d="m22 22-5-5"/><path d="M16 16v1a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2Z"/><path d="M12 11V7"/><path d="M8 11V7"/><path d="M10 11V2"/></svg>';
  }
  
  const cleanName = productName.trim();
  
  // Available mockup image files on disk
  const localImages = [
    'Americano', 'Cappuccino', 'Cold Coffee', 'Espresso', 'Fresh Lime Soda', 
    'Fruit Punch', 'Green Tea', 'Latte', 'Masala Tea', 'Pancakes', 'Virgin Mojito'
  ];
  
  const matched = localImages.find(imgName => imgName.toLowerCase() === cleanName.toLowerCase());
  
  if (matched) {
    return `/mockup_images/${matched}.jpg`;
  }
  
  // Fallback placeholder icon (utensils SVG) if mockup image is not found
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394A3B8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M13 15 2 4"/><path d="m22 22-5-5"/><path d="M16 16v1a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2Z"/><path d="M12 11V7"/><path d="M8 11V7"/><path d="M10 11V2"/></svg>';
};

// Subcomponent: ProductCard
function ProductCard({ product, onSelect, onAddToCart }) {
  const imageUrl = resolveImage(product.name);
  
  return (
    <motion.div 
      layoutId={`product-${product.id}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer group"
      whileHover={{ y: -4 }}
    >
      <div className="relative h-32 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-505"
        />
        <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm" />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{product.name}</h3>
          <p className="text-amber-650 font-bold mt-1 text-sm">₹{product.price}</p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Stop details overlay trigger
            onAddToCart(product);
          }}
          className="w-full mt-3 bg-slate-50 hover:bg-amber-600 hover:text-white text-slate-750 font-semibold py-2 rounded-xl text-xs transition-colors border border-slate-200/80 hover:border-amber-600 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          <span>Add to Cart</span>
        </button>
      </div>
    </motion.div>
  );
}



export default function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTableId] = useState(1); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
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
        console.error("Failed to fetch POS data, using mock categories & products", err);
        setProducts(mockProducts);
        setCategories(mockCategories);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = selectedCategory === 'All';
    if (!matchesCategory) {
      if (typeof product.category === 'string') {
        matchesCategory = product.category === selectedCategory;
      } else if (product.category && typeof product.category.name === 'string') {
        matchesCategory = product.category.name === selectedCategory;
      } else {
        const catId = product.categoryId || product.category_id;
        const matchedCat = categories.find(c => Number(c.id) === Number(catId));
        matchesCategory = matchedCat && matchedCat.name === selectedCategory;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white z-20">
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
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
              selectedCategory === 'All' 
                ? 'bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-900/10' 
                : 'bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border-slate-200/60 text-slate-700'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.name 
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-900/10' 
                  : 'bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border-slate-200/60 text-slate-700 hover:border-amber-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </aside>

        {/* Col 2: Products */}
        <main className="p-6 overflow-y-auto bg-slate-50">
          <AnimatePresence mode="wait">
            {!selectedProduct ? (
              // --- GRID VIEW ---
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-4 auto-rows-min"
              >
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                    onAddToCart={addToCart}
                  />
                ))}
              </motion.div>
            ) : (
              // --- DETAIL VIEW ---
              <motion.div 
                key="detail"
                layoutId={`product-${selectedProduct.id}`}
                className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-lg h-full flex flex-col"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="text-slate-500 hover:text-slate-800 mb-6 font-semibold text-sm flex items-center gap-1.5 cursor-pointer w-max"
                >
                  ← Back to Menu
                </button>
                <img 
                  src={resolveImage(selectedProduct.name)} 
                  className="w-full h-64 object-cover rounded-xl mb-6 bg-slate-100"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394A3B8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M13 15 2 4"/><path d="m22 22-5-5"/><path d="M16 16v1a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2Z"/><path d="M12 11V7"/><path d="M8 11V7"/><path d="M10 11V2"/></svg>';
                  }}
                />
                <h2 className="text-3xl font-bold text-slate-850">{selectedProduct.name}</h2>
                <p className="text-2xl text-amber-655 font-bold mt-2">₹{selectedProduct.price}</p>
                <p className="text-slate-500 mt-4 leading-relaxed font-sans">Deliciously crafted item from our cafe menu.</p>
                
                <button 
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="w-full mt-auto bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-900/10"
                >
                  Add to Order
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
