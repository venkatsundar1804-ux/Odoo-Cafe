import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, Coffee, Settings, LogIn, LogOut, User, MapPin, Tag, Star, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { useAuthStore } from '../store/authStore';
import { usePromoStore } from '../store/promoStore';
import { resolveImage } from '../utils/imageResolver';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const { tables, fetchTables, setTableId, freeTable, currentTableId } = useTableStore();
  const { role, user, logout } = useAuthStore();
  const { promos, fetchPromos, setAutoAppliedPromo } = usePromoStore();

  const [showTables, setShowTables] = useState(false);
  const tablesRef = useRef(null);

  useEffect(() => {
    fetchTables();
    fetchPromos();
  }, [fetchTables, fetchPromos]);

  const exclusiveOffers = promos.filter(p => p.is_active !== false).slice(0, 3);

  const handleOfferClick = (promo) => {
    // Save to global state so POS picks it up instantly
    setAutoAppliedPromo(promo);
    
    // Auto-select a generic guest table (Table 1) and route to POS with query param
    setTableId(1, user?.name || 'Guest');
    if (promo.product_id) {
      navigate(`/pos?table_id=1&promo_product_id=${promo.product_id}`);
    } else {
      navigate(`/pos?table_id=1`);
    }
  };

  const handleTableSelect = (table) => {
    setTableId(table.id, user?.name || 'Guest');
    navigate(`/pos?table_id=${table.id}`);
  };

  const handleRevealTables = () => {
    setShowTables(true);
    setTimeout(() => {
      tablesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  const availableTables = tables.filter(t =>
    t.status === 'available' || t.id === currentTableId || (user && t.occupiedBy === user.name)
  );

  const marqueeItems = [
    { name: 'Cappuccino', tag: 'Classic' },
    { name: 'Avocado Toast', tag: 'Healthy' },
    { name: 'Chocolate Truffle Cake', tag: 'Bestseller' },
    { name: 'Farmhouse Pizza', tag: 'Trending' },
    { name: 'Cold Coffee', tag: 'Refreshing' },
    { name: 'Pink Sauce Pasta', tag: 'Must Try' },
    { name: 'Blueberry Pastry', tag: 'Dessert' },
    { name: 'Caesar Salad', tag: 'Fresh' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="min-h-screen w-full bg-slate-50 overflow-x-hidden font-sans text-slate-900"
    >
      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 w-full z-50 px-6 py-5 md:px-12 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <img src="/odoo_cafe_logo.jpg" alt="Odoo Cafe Logo" className="w-12 h-12 object-cover rounded-xl shadow-md" />
          <span className="font-black tracking-tight text-xl text-slate-800">Odoo<span className="text-amber-600">Cafe</span></span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full border border-slate-200 bg-white/50 text-slate-700 font-medium text-sm">
                <User className="w-4 h-4 text-amber-600" />
                <span>Hi, {user.name}</span>
              </div>
              <button
                onClick={() => navigate(role === 'customer' ? '/admin/customer' : '/admin')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition font-bold text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-full transition font-bold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full transition font-bold text-sm shadow-lg"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </motion.nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden bg-slate-900 text-white selection:bg-amber-500 selection:text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/mockup_images/cafe_banner.png"
            alt="Cafe Background"
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900"></div>
          {/* Subtle noise texture or radial gradient for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent opacity-50 blur-2xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-amber-100">The New Standard</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.95] mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400">
            Crafted for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Perfection.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience seamless dining. Choose your perfect spot, explore our curated menu, and order directly from your device without the wait.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRevealTables}
              className="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-full font-black text-lg shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all"
            >
              <Armchair className="w-5 h-5" />
              Dine In - Select Table
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all"
            >
              Order Takeaway
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Infinite Marquee Section ────────────────────────────────────────── */}
      <section className="py-12 bg-white border-b border-slate-100 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
        
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex whitespace-nowrap gap-8 px-4 w-max"
        >
          {/* Double the items to make the infinite scroll smooth */}
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-full pr-6 p-2 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => navigate(`/pos?search=${encodeURIComponent(item.name)}`)}
            >
              <img src={resolveImage(item.name)} alt={item.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
              <div>
                <p className="font-bold text-slate-800 text-sm leading-tight">{item.name}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-600">{item.tag}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Main Content Area (Features & Tables) ─────────────────────────── */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-24" ref={tablesRef}>

        {!showTables ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Feature Grid */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Elevate your experience.</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">Discover the perfect blend of artisanal quality and modern convenience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden group relative flex flex-col justify-end p-10 min-h-[400px]">
                <div className="absolute inset-0">
                  <img src="/mockup_images/Cake and Coffee Combo.jpg" alt="Coffee" className="w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                </div>
                <div className="relative z-10 text-white">
                  <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                    <Star className="w-6 h-6 text-slate-900" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight mb-3">Premium Quality</h3>
                  <p className="text-slate-300 font-medium max-w-md">Sourced from the finest local ingredients and crafted with absolute precision by our expert chefs and baristas.</p>
                </div>
              </div>

              <div className="bg-emerald-900 rounded-[2.5rem] overflow-hidden group relative flex flex-col justify-end p-10 min-h-[400px]">
                <div className="absolute inset-0">
                  <img src="/mockup_images/Farmhouse Pizza.jpg" alt="Pizza" className="w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/60 to-transparent"></div>
                </div>
                <div className="relative z-10 text-white">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-6">
                    <Tag className="w-6 h-6 text-emerald-900" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight mb-3">Exclusive Offers</h3>
                  <p className="text-emerald-100 font-medium max-w-md">Join our loyalty program to unlock special discounts, secret menu items, and priority seating.</p>
                </div>
              </div>
            </div>

            {/* Dynamic Exclusive Offers Row */}
            {exclusiveOffers.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Claim Your Offers</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {exclusiveOffers.map(promo => {
                    const label = promo.discount_type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`;
                    // If it has a specific product, use its name for the image. Otherwise use a generic coffee image.
                    const imageName = promo.product_id ? promo.code : 'Cappuccino';
                    return (
                      <motion.button
                        key={promo.code}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOfferClick(promo)}
                        className="group flex flex-col text-left bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all p-3 cursor-pointer overflow-hidden"
                      >
                        <div className="w-full h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                           <img src={resolveImage(imageName)} alt="Offer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                             {label}
                           </div>
                        </div>
                        <div className="px-3 pb-3">
                          <p className="text-slate-400 text-xs font-black tracking-widest uppercase mb-1">Code: {promo.code}</p>
                          <h4 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {promo.product_id ? 'Click to order & auto-apply' : 'Store-wide discount! Click to apply.'}
                          </h4>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Smart Promotions Banner */}
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-amber-200/50 shadow-sm">
              <div className="flex-1">
                <span className="text-amber-600 font-black tracking-widest text-sm uppercase mb-2 block">Today's Highlight</span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Afternoon Delight Combo</h2>
                <p className="text-slate-600 text-lg mb-6 max-w-xl">Pair any signature coffee with a fresh pastry and save 20%. The perfect mid-day pick-me-up.</p>
                <button
                  onClick={handleRevealTables}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-bold shadow-lg transition flex items-center gap-2"
                >
                  Dine In Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full md:w-1/3 flex justify-center relative">
                <div className="absolute inset-0 bg-amber-200 rounded-full blur-3xl opacity-50"></div>
                <img src="/mockup_images/Cappuccino.jpg" alt="Combo" className="relative z-10 w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-8 border-white shadow-2xl" />
              </div>
            </div>
          </motion.div>
        ) : (
          /* Table Selection Grid */
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Choose your space.</h2>
              <p className="text-lg text-slate-500 font-medium">Select an available table below to begin your order.</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {availableTables.map((table) => {
                  const isMyTable = table.id === currentTableId || (user && table.occupiedBy === user.name);
                  return (
                  <motion.div
                    key={table.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTableSelect(table)}
                    className={`relative overflow-hidden rounded-[2rem] p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between h-52 group shadow-sm hover:shadow-xl border-2 ${
                      isMyTable 
                      ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white shadow-2xl' 
                      : 'bg-white border-slate-100 hover:border-amber-400 text-slate-900'
                    }`}
                  >
                    {/* Dark Card Shader */}
                    {isMyTable && (
                      <>
                        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-amber-500/30 rounded-full blur-[50px] pointer-events-none"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[40px] pointer-events-none"></div>
                      </>
                    )}
                    
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="text-4xl font-black tracking-tighter">
                        {table.number}
                      </span>
                      {isMyTable ? (
                        <div className="bg-white/20 text-white p-2 rounded-full">
                          <User className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="bg-slate-50 group-hover:bg-amber-100 text-slate-400 group-hover:text-amber-600 p-2 rounded-full transition-colors">
                          <Armchair className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 mt-auto">
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-bold ${isMyTable ? 'text-slate-300' : 'text-slate-500'}`}>
                          {table.seats} Seats
                        </div>
                        {isMyTable ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              freeTable(table.id);
                            }}
                            className="bg-white group-hover:bg-rose-500 group-hover:text-white text-slate-900 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors duration-300 shadow-sm group-hover:shadow-rose-500/30 cursor-pointer border-none"
                          >
                            <span className="block group-hover:hidden">Your Table</span>
                            <span className="hidden group-hover:block">Unselect</span>
                          </button>
                        ) : (
                          <div className="bg-amber-100 text-amber-700 opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-opacity">
                            Select
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>

              {availableTables.length === 0 && (
                <div className="col-span-full py-24 text-center flex flex-col items-center bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <div className="bg-slate-200 text-slate-400 p-4 rounded-full mb-4">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Fully Booked</h3>
                  <p className="text-slate-500 mt-2 font-medium max-w-sm">All tables are currently occupied. Please check back shortly or consider ordering for takeaway.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-slate-800">OdooCafe © 2026</span>
          </div>
          <div className="flex gap-6 text-sm font-bold text-slate-400">
            <span className="hover:text-slate-800 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-slate-800 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-slate-800 cursor-pointer transition">Contact Us</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
