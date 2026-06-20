import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, Coffee, Quote, Settings, LogIn, User, MapPin, Tag, Star, ArrowRight } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const { tables, fetchTables, setTableId } = useTableStore();
  const { role, user } = useAuthStore();
  
  const [showTables, setShowTables] = useState(false);
  const tablesRef = useRef(null);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleTableSelect = (table) => {
    setTableId(table.id);
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const availableTables = tables.filter(t => t.status === 'available');

  const recommendedFoods = [
    { id: 1, name: 'Truffle Croissant', price: 6.50, img: '/mockup_images/cafe_banner.png', tag: 'Chef\'s Pick' },
    { id: 2, name: 'Iced Matcha Latte', price: 5.00, img: '/mockup_images/cafe_banner.png', tag: 'Bestseller' },
    { id: 3, name: 'Avocado Toast', price: 12.00, img: '/mockup_images/cafe_banner.png', tag: 'Healthy' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen w-full bg-[#f8fafc] overflow-x-hidden font-sans relative"
    >
      
      {/* Top Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute top-0 left-0 w-full z-50 p-6 sm:px-10 flex justify-between items-center"
      >
        <div className="text-white font-black text-2xl tracking-tighter drop-shadow-md flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl shadow-lg">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <span className="hidden sm:inline">Odoo Cafe</span>
        </div>
        
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-white">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-inner">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Welcome Back</span>
                  <span className="text-sm font-bold">{user.name}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate(role === 'customer' ? '/admin/customer' : '/admin')}
                className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-2xl transition font-black text-sm shadow-[0_10px_30px_rgba(0,0,0,0.15)] cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3 rounded-2xl transition font-black text-sm shadow-[0_10px_30px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden rounded-b-[4rem] shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="/mockup_images/cafe_banner.png" 
            alt="Cafe Interior" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-12"
        >
          <span className="bg-amber-500 text-slate-900 text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6 shadow-lg">
            Experience the finest
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl mb-6">
            Where Every Pour <br/> Tells a <span className="text-amber-400 italic font-serif">Story.</span>
          </h1>
          
          <p className="text-lg text-slate-200 font-medium max-w-xl mx-auto mb-10">
            Skip the line. Select a table, browse our curated menu, and order directly from your device.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRevealTables}
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-full font-black text-lg shadow-[0_15px_40px_rgba(245,158,11,0.4)] cursor-pointer transition-colors"
          >
            <Armchair className="w-5 h-5" />
            Dine In - Choose Table
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* Main Content Area (Conditional) */}
      <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-4 pb-24" ref={tablesRef}>
        
        {!showTables ? (
          /* Recommended Foods & Offers */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="bg-white/80 backdrop-blur-[40px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-white p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <Star className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Recommended for You</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedFoods.map(food => (
                  <div key={food.id} className="relative group overflow-hidden rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow border border-slate-100 bg-white">
                    <div className="h-48 overflow-hidden relative">
                      <img src={food.img} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                        {food.tag}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-slate-800 text-lg mb-1">{food.name}</h3>
                      <p className="text-emerald-600 font-mono font-bold">${food.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-widest text-sm mb-3">
                  <Tag className="w-5 h-5" /> Today's Special Offer
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-2">Buy 1 Coffee, Get 1 Pastry Half Price</h2>
                <p className="text-slate-400 font-medium">Valid until 4:00 PM today. Applies automatically at checkout.</p>
              </div>
              <button 
                onClick={handleRevealTables}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-full font-black shadow-lg cursor-pointer transition-colors whitespace-nowrap"
              >
                Claim Offer & Order
              </button>
            </div>
          </motion.div>

        ) : (
          /* Table Selection Grid */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-[40px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-white p-8 md:p-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Select an Open Table</h2>
              <p className="text-slate-500 font-medium mt-2 text-base">Click a table below to start your digital order</p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {availableTables.map((table) => (
                  <motion.div
                    key={table.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTableSelect(table)}
                    className="relative overflow-hidden rounded-[2rem] p-6 border-2 border-emerald-100 hover:border-emerald-300 cursor-pointer transition-all duration-300 flex flex-col justify-between h-48 group bg-white shadow-[0_10px_30px_rgba(16,185,129,0.05)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]"
                  >
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl transition-opacity duration-300 opacity-60 bg-emerald-100 group-hover:bg-emerald-200"></div>

                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-5xl font-black tracking-tighter text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {table.number}
                      </span>
                    </div>

                    <div className="mt-auto relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-bold">
                          <Armchair size={16} className="text-emerald-500" />
                          <span>{table.seats} Seats</span>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm">
                          Sit Here
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {availableTables.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center">
                  <div className="bg-rose-50 text-rose-500 p-4 rounded-full mb-4">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">We're fully booked!</h3>
                  <p className="text-slate-500 mt-2">All tables are currently occupied. Please check back shortly.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}
