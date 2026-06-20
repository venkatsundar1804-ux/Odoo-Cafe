import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { mockCategories, mockProducts } from '../data/dataProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveImage } from '../utils/imageResolver';
import { 
  Search, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Coffee,
  MessageSquare,
  User,
  Mic,
  Star,
  Play
} from 'lucide-react';

export default function POS() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);

  const { addToCart } = useCartStore();

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
        console.error("Failed to fetch POS data, using mock categories & products");
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
    <div 
      className="h-screen w-full bg-white overflow-hidden flex items-center justify-center p-6 sm:p-10" 
      onWheel={handleWheel}
    >
      {/* Glassy Transparent Screen Container */}
      <div className="relative w-full h-full max-w-[1400px] bg-slate-50/50 backdrop-blur-[60px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-200/50 overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <header className="flex justify-end p-8 absolute top-0 right-0 z-30 gap-4">
          <button className="p-3 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-white transition cursor-pointer">
            <Search className="w-5 h-5 text-slate-700" />
          </button>
          <button className="p-3 bg-white/70 backdrop-blur shadow-sm rounded-2xl hover:bg-white transition cursor-pointer">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        </header>

        {/* Abstract Artistic Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[55%] bg-orange-100/60 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[40%] bg-teal-50/60 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[-5%] w-[25%] h-[35%] bg-rose-50/50 rounded-full blur-[90px]" />
        </div>

        {/* Main Hero Content Area */}
        <div className="flex-1 flex flex-col relative z-10 pt-16 px-12 md:px-20 pb-4">
          
          <AnimatePresence custom={direction} mode="wait">
            {activeProduct ? (
              <motion.div 
                key={activeProduct.id}
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
                    className="w-[300px] h-[300px] lg:w-[480px] lg:h-[480px] object-cover rounded-full z-20 bg-slate-100/50"
                    style={{
                      boxShadow: '0 40px 80px rgba(0,0,0,0.12), 0 -10px 40px rgba(255,255,255,0.8) inset'
                    }}
                  />
                  {/* Small decorative accent near the image */}
                  <div className="absolute left-[10%] top-[20%] w-2 h-16 bg-slate-200 rounded-full hidden lg:block" />
                  <div className="absolute left-[12%] top-[25%] w-1 h-8 bg-slate-200 rounded-full hidden lg:block" />
                </div>

                {/* Right Side: Hero Text / Card */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <motion.div variants={textVariants} initial="initial" animate="animate" exit="exit">
                    <p className="text-slate-500 font-bold tracking-[0.2em] text-xs uppercase mb-4">
                      #{activeIndex + 1} Most loved dish
                    </p>
                    
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-800 leading-[1.1] tracking-tighter uppercase font-sans">
                      {activeProduct.name.split(' ').map((word, i, arr) => (
                        <span key={i} className={i === arr.length - 1 ? "text-slate-900 block text-[1.1em] mt-1 opacity-90" : ""}>
                          {word}{' '}
                        </span>
                      ))}
                    </h1>

                    <div className="flex items-center gap-6 mt-10">

                      <button 
                        onClick={() => {
                          addToCart(activeProduct);
                          alert(`${activeProduct.name} added to cart!`);
                        }}
                        className="flex items-center gap-2 bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-900 transition shadow-[0_10px_20px_rgba(15,23,42,0.15)] cursor-pointer text-sm tracking-wide uppercase hover:-translate-y-0.5"
                      >
                        Order food
                      </button>
                    </div>


                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold text-xl">
                No products found
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Bar: Carousel */}
        <div className="relative z-20 pb-8 px-12 md:px-20 flex flex-col md:flex-row justify-center items-center mt-8">

          {/* Right Side: Mini Product Carousel */}
          <div className="flex items-center gap-6 pb-2">
            <button 
              onClick={handlePrev} 
              className="w-10 h-10 flex items-center justify-center bg-white shadow-sm rounded-full text-slate-400 hover:text-slate-800 hover:shadow-md transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-5 items-end justify-center w-[400px]">
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
                      ? 'scale-125 -translate-y-3 opacity-100 z-10 mx-4' 
                      : 'scale-90 opacity-50 hover:opacity-100 hover:-translate-y-1'
                  }`}
                >
                  <img 
                    src={resolveImage(item.product.name)} 
                    alt={item.product.name} 
                    className="w-16 h-16 object-cover rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.1)] bg-white/50 p-0.5 border border-white"
                  />
                  <div className={`mt-4 text-center w-24 transition-opacity duration-300 ${item.indexOffset === 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-[10px] font-bold text-slate-600 leading-tight">
                      {item.product.name}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">₹{item.product.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleNext} 
              className="w-10 h-10 flex items-center justify-center bg-white shadow-sm rounded-full text-slate-400 hover:text-slate-800 hover:shadow-md transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
