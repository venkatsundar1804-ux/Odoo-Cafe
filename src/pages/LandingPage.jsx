import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, Coffee, Quote, Settings, LogIn, User, MapPin } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const { tables, fetchTables, setTableId } = useTableStore();
  const { role, user } = useAuthStore();

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleTableSelect = (table) => {
    setTableId(table.id);
    navigate(`/pos?table_id=${table.id}`);
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

  // Only show available tables to customers
  const availableTables = tables.filter(t => t.status === 'available');

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
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden rounded-b-[4rem] shadow-2xl">
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
            Skip the line. Select your table below, browse our curated menu, and order directly from your seat.
          </p>
          
          <div className="flex items-center gap-4 text-white/90 bg-white/10 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-xs">1</div><span className="font-semibold text-sm">Find Table</span></div>
            <div className="w-8 border-t border-white/30 border-dashed"></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-xs">2</div><span className="font-semibold text-sm">Order</span></div>
            <div className="w-8 border-t border-white/30 border-dashed"></div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-xs">3</div><span className="font-semibold text-sm">Enjoy</span></div>
          </div>
        </motion.div>
      </section>

      {/* Table Selection Section */}
      <section className="relative z-20 -mt-20 max-w-6xl mx-auto px-4 pb-24">
        <div className="bg-white/80 backdrop-blur-[40px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-white p-8 md:p-12">
          
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
                  {/* Decorative glowing overlay */}
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

        </div>
      </section>
    </motion.div>
  );
}
