import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { mockCategories } from '../data/mockCategories';
import { mockProducts } from '../data/mockProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveImage } from '../utils/imageResolver';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  LayoutGrid,
  Presentation,
  Plus,
  Home
} from 'lucide-react';

export default function POS() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const [viewMode, setViewMode] = useState('cinematic'); // 'cinematic' | 'grid'

  const navigate = useNavigate();
  const { addToCart, cart } = useCartStore();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    // Rely completely on the dynamic data provider (mockProducts / mockCategories)
    // so that all 86 products and 15 categories load without needing the DB.
    setProducts(mockProducts);
    setCategories(mockCategories);
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

  // Ensure activeIndex is valid when filters change
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory, searchQuery]);

  const activeProduct = filteredProducts[activeIndex] || null;

  const handleNext = useCallback(() => {
    if (filteredProducts.length === 0) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % filteredProducts.length);
  }, [filteredProducts.length]);

  const handlePrev = useCallback(() => {
    if (filteredProducts.length === 0) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
  }, [filteredProducts.length]);

  // Handle Mouse Wheel properly with debounce/throttle to prevent rapid scrolling
  const handleWheel = (e) => {
    if (viewMode !== 'cinematic') return; // Don't hijack scroll in grid view!
    if (isScrolling) return;
    
    // Only trigger if scroll delta is significant enough
    if (Math.abs(e.deltaY) > 20) {
      setIsScrolling(true);
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      
      // Debounce scroll
      setTimeout(() => {
        setIsScrolling(false);
      }, 600); // Wait for animation duration before allowing next scroll
    }
  };

  // Animation variants
  const imageVariants = {
    initial: (dir) => ({
      opacity: 0,
      rotate: dir === 1 ? 180 : -180, // Clockwise rotation transition
      scale: 0.5,
    }),
    animate: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir) => ({
      opacity: 0,
      rotate: dir === 1 ? -180 : 180,
      scale: 0.5,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    })
  };

  const textVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.1, ease: "easeOut" } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.4 } }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0 }
  };

  const gridItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Determine carousel items to show (5 items total: 2 left, 1 center, 2 right)
  const getCarouselItems = () => {
    if (filteredProducts.length === 0) return [];
    const items = [];
    for (let i = -2; i <= 2; i++) {
      let idx = (activeIndex + i) % filteredProducts.length;
      if (idx < 0) idx += filteredProducts.length;
      items.push({ product: filteredProducts[idx], indexOffset: i, absoluteIndex: idx });
    }
    return items;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen w-full bg-slate-50 overflow-hidden flex items-center justify-center p-4 sm:p-8 font-sans" 
      onWheel={handleWheel}
    >
      {/* Glassy Transparent Screen Container */}
      <div className="relative w-full h-full max-w-[1500px] bg-white/70 backdrop-blur-[80px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden flex flex-col">
        
        {/* Abstract Artistic Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[55%] bg-orange-100/60 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[40%] bg-teal-50/60 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[-5%] w-[25%] h-[35%] bg-rose-50/50 rounded-full blur-[90px]" />
        </div>

        {/* Top Header & Categories Navigation */}
        <header className="relative z-30 px-8 pt-8 pb-4 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            
            {/* Category Pills */}
            <div className="flex-1 flex overflow-x-auto gap-3 custom-scrollbar pb-2 pr-4">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-white/60 text-slate-500 hover:bg-white hover:text-slate-800 border border-slate-200/50'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white/60 text-slate-500 hover:bg-white hover:text-slate-800 border border-slate-200/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Actions (View Toggle, Search, Cart) */}
            <div className="flex items-center gap-3 ml-4 shrink-0">
              
              <button 
                onClick={() => navigate('/floor')}
                className="p-4 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-slate-800 hover:text-white text-slate-700 transition cursor-pointer border border-slate-200/50 flex items-center justify-center group"
                title="Back to Home"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>

              {/* View Mode Toggle */}
              <div className="flex bg-white/70 backdrop-blur border border-slate-200/50 p-1.5 rounded-[1.25rem] shadow-sm">
                <button 
                  onClick={() => setViewMode('cinematic')}
                  className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 ${viewMode === 'cinematic' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Presentation className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <button className="p-4 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-white transition cursor-pointer border border-slate-200/50">
                <Search className="w-5 h-5 text-slate-700" />
              </button>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="p-4 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-white transition cursor-pointer border border-slate-200/50 relative"
              >
                <ShoppingBag className="w-5 h-5 text-slate-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area (Cinematic vs Grid) */}
        <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
          <AnimatePresence mode="wait">
            {viewMode === 'cinematic' ? (
              
              /* CINEMATIC VIEW */
              <motion.div 
                key="cinematic"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col px-12 md:px-20 pb-4 h-full"
              >
                <AnimatePresence custom={direction} mode="wait">
                  {activeProduct ? (
                    <motion.div 
                      key={activeProduct.id}
                      custom={direction}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex-1 flex flex-col md:flex-row items-center gap-12 lg:gap-24"
                    >
                      {/* Left Side: Massive Hero Image */}
                      <div className="w-full md:w-1/2 flex justify-center items-center relative">
                        <motion.img
                          src={resolveImage(activeProduct.name)}
                          alt={activeProduct.name}
                          custom={direction}
                          variants={imageVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] object-cover rounded-full z-20 bg-slate-100/50"
                          style={{
                            boxShadow: '0 40px 80px rgba(0,0,0,0.12), 0 -10px 40px rgba(255,255,255,0.8) inset'
                          }}
                        />
                      </div>

                      {/* Right Side: Hero Text / Card */}
                      <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <motion.div variants={textVariants} initial="initial" animate="animate" exit="exit">
                          <p className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase mb-4 bg-amber-100/50 inline-block px-3 py-1.5 rounded-lg">
                            {activeProduct.category?.name || selectedCategory}
                          </p>
                          
                          <h1 className="text-5xl lg:text-7xl font-black text-slate-800 leading-[1.1] tracking-tighter uppercase font-sans">
                            {activeProduct.name.split(' ').map((word, i, arr) => (
                              <span key={i} className={i === arr.length - 1 ? "text-slate-900 block text-[1.1em] mt-1 opacity-90" : ""}>
                                {word}{' '}
                              </span>
                            ))}
                          </h1>

                          <div className="mt-8 mb-10 text-3xl font-bold text-slate-600 font-mono">
                            ₹{activeProduct.price}
                          </div>

                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => {
                                addToCart(activeProduct);
                              }}
                              className="flex items-center gap-2 bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-900 transition shadow-[0_15px_30px_rgba(15,23,42,0.15)] cursor-pointer text-sm tracking-widest uppercase hover:-translate-y-1"
                            >
                              Add To Cart
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold text-xl">
                      No products found in this category
                    </div>
                  )}
                </AnimatePresence>

                {/* Bottom Bar: Carousel */}
                <div className="relative z-20 pb-8 flex flex-col md:flex-row justify-center items-center mt-auto">
                  <div className="flex items-center gap-6 pb-2">
                    <button 
                      onClick={handlePrev} 
                      className="w-12 h-12 flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 hover:text-slate-800 hover:shadow-md transition cursor-pointer hover:scale-105"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="flex gap-5 items-end justify-center w-[450px]">
                      {getCarouselItems().map((item, idx) => (
                        <div 
                          key={`${item.product.id}-${idx}`} 
                          onClick={() => {
                            if (item.indexOffset > 0) {
                              setDirection(1);
                              setActiveIndex(item.absoluteIndex);
                            } else if (item.indexOffset < 0) {
                              setDirection(-1);
                              setActiveIndex(item.absoluteIndex);
                            }
                          }}
                          className={`flex flex-col items-center transition-all duration-500 cursor-pointer ${
                            item.indexOffset === 0 
                              ? 'scale-125 -translate-y-4 opacity-100 z-10 mx-6' 
                              : 'scale-90 opacity-50 hover:opacity-100 hover:-translate-y-1'
                          }`}
                        >
                          <img 
                            src={resolveImage(item.product.name)} 
                            alt={item.product.name} 
                            className="w-16 h-16 object-cover rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.1)] bg-white/50 p-0.5 border border-white"
                          />
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleNext} 
                      className="w-12 h-12 flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 hover:text-slate-800 hover:shadow-md transition cursor-pointer hover:scale-105"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>

            ) : (

              /* GRID VIEW */
              <motion.div 
                key="grid"
                variants={gridVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar"
              >
                {filteredProducts.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-xl">
                    No products found
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map(product => (
                      <motion.div
                        key={product.id}
                        variants={gridItemVariants}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(product)}
                        className="bg-white/80 backdrop-blur border border-slate-200/60 rounded-[2rem] p-5 flex flex-col justify-between cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group"
                      >
                        <div className="w-full flex justify-center mb-4">
                          <img 
                            src={resolveImage(product.name)} 
                            alt={product.name}
                            className="w-28 h-28 object-cover rounded-full shadow-md group-hover:shadow-xl transition-shadow duration-300"
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-amber-500 transition-colors line-clamp-1">{product.name}</h3>
                          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                            {product.category?.name || 'Item'}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-black text-slate-800 font-mono text-lg">₹{product.price}</span>
                            <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
