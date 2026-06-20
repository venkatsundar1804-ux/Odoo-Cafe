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
const getProductImage = (name) => {
  if (!name) return '/mockup_images/Americano.jpg';
  
  const cleanName = name.trim();
  const localImages = [
    // Beverages
    'Americano', 'Cappuccino', 'Cold Coffee', 'Espresso', 'Fresh Lime Soda', 
    'Fruit Punch', 'Green Tea', 'Latte', 'Masala Tea', 'Virgin Mojito',
    // Breakfast
    'Pancakes', 'Waffles', 'French Toast', 'Omelette', 'Scrambled Eggs', 
    'Breakfast Platter', 'Avocado Toast', 'Granola Bowl',
    // Sandwiches
    'Veg Grilled Sandwich', 'Club Sandwich', 'Cheese Corn Sandwich', 
    'Paneer Sandwich', 'Chicken Sandwich', 'Tuna Sandwich',
    // Burgers
    'Classic Veg Burger', 'Cheese Burger', 'Crispy Chicken Burger', 
    'Paneer Burger', 'Mushroom Burger',
    // Pizzas
    'Margherita Pizza', 'Farmhouse Pizza', 'Veggie Delight Pizza', 
    'Pepperoni Pizza', 'BBQ Chicken Pizza',
    // Pasta
    'Alfredo Pasta', 'Arrabbiata Pasta', 'Pink Sauce Pasta', 
    'Pesto Pasta', 'Mac and Cheese',
    // Wraps
    'Paneer Tikka Wrap', 'Chicken Wrap', 'Falafel Wrap', 
    'Veggie Wrap', 'Mexican Wrap',
    // Salads
    'Caesar Salad', 'Greek Salad', 'Garden Salad', 'Chicken Salad', 'Quinoa Salad',
    // Soups
    'Tomato Soup', 'Sweet Corn Soup', 'Hot and Sour Soup', 
    'Mushroom Soup', 'Chicken Clear Soup',
    // Fries & Sides
    'French Fries', 'Peri Peri Fries', 'Potato Wedges', 
    'Garlic Bread', 'Cheese Garlic Bread', 'Onion Rings',
    // Snacks
    'Nachos', 'Spring Rolls', 'Mozzarella Sticks', 
    'Veg Nuggets', 'Chicken Nuggets', 'Loaded Nachos',
    // Pastries
    'Chocolate Pastry', 'Black Forest Pastry', 'Red Velvet Pastry', 
    'Butterscotch Pastry', 'Blueberry Pastry',
    // Cakes
    'Chocolate Truffle Cake', 'Cheesecake', 'Red Velvet Cake', 
    'Carrot Cake', 'Fruit Cake',
    // Desserts
    'Brownie with Ice Cream', 'Tiramisu', 'Mousse', 'Waffle Sundae', 'Caramel Pudding',
    // Combos
    'Coffee and Sandwich Combo', 'Burger Fries and Coke Combo', 
    'Pizza and Mocktail Combo', 'Pasta and Garlic Bread Combo', 
    'Cake and Coffee Combo'
  ];
  
  const matched = localImages.find(imgName => imgName.toLowerCase() === cleanName.toLowerCase());
  if (matched) {
    return `/mockup_images/${matched}.jpg`;
  }
  
  const query = cleanName.toLowerCase();
  // Fallbacks using local mockup images for related drinks
  if (query.includes('tea') || query.includes('chai')) {
    return '/mockup_images/Masala Tea.jpg';
  }
  if (query.includes('coffee') || query.includes('espresso') || query.includes('latte') || query.includes('cappuccino') || query.includes('americano')) {
    return '/mockup_images/Cappuccino.jpg';
  }
  if (query.includes('lime') || query.includes('soda') || query.includes('mojito') || query.includes('punch')) {
    return '/mockup_images/Virgin Mojito.jpg';
  }
  
  // Curated fallback Unsplash URLs for food items
  if (query.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('sandwich')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('waffle') || query.includes('pancake')) {
    return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('salad')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('pasta')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('cake') || query.includes('pastry') || query.includes('brownie') || query.includes('tiramisu') || query.includes('mousse')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('soup')) {
    return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('fries') || query.includes('sides') || query.includes('garlic bread') || query.includes('onion rings')) {
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('wrap')) {
    return 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400';
  }
  if (query.includes('combo')) {
    return 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=400';
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
};

// Subcomponent: ProductCard
function ProductCard({ product, onSelect, onAddToCart }) {
  const imageUrl = getProductImage(product.name);
  
  return (
    <motion.div 
      layoutId={`product-${product.id}`}
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer group"
      whileHover={{ y: -4 }}
    >
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
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

// Subcomponent: ProductDetailOverlay
function ProductDetailOverlay({ product, onClose, onAddToCart }) {
  if (!product) return null;
  const imageUrl = getProductImage(product.name);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        layoutId={`product-${product.id}`}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 w-full bg-slate-100">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-750 hover:text-slate-900 flex items-center justify-center shadow-md transition-all cursor-pointer font-bold text-sm"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
              Featured Item
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{product.name}</h2>
            <p className="text-2xl font-extrabold text-amber-605 mt-1">₹{product.price}</p>
          </div>
          
          <p className="text-sm text-slate-500 leading-relaxed font-sans">
            Freshly prepared using premium, hand-picked ingredients. Hot, delicious, and cooked to perfection just for you.
          </p>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-slate-105 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Back to POS
            </button>
            <button 
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-amber-900/10"
            >
              Add to Order
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(mockCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
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
    const matchesCategory = selectedCategoryId === null || 
      Number(product.categoryId) === Number(selectedCategoryId) || 
      Number(product.category_id) === Number(selectedCategoryId) ||
      (product.category && Number(product.category.id) === Number(selectedCategoryId));
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
            onClick={() => setSelectedCategoryId(null)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
              selectedCategoryId === null 
                ? 'bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-900/10' 
                : 'bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border-slate-200/60 text-slate-700'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                selectedCategoryId === cat.id 
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-900/10' 
                  : 'bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border-slate-200/60 text-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </aside>

        {/* Col 2: Products */}
        <main className="p-6 overflow-y-auto grid grid-cols-3 gap-4 auto-rows-min bg-slate-50">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onSelect={setSelectedProduct}
              onAddToCart={addToCart}
            />
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

      {/* Cinematic Detail Morphing Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailOverlay 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
