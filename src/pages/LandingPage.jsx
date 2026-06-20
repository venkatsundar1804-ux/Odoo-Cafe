import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, CheckCircle2, AlertTriangle, Coffee, Quote } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const { tables, isLoading, fetchTables, setTableId } = useTableStore();

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
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 overflow-x-hidden font-sans">
      
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Banner Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/mockup_images/cafe_banner.png" 
            alt="Cafe Interior" 
            className="w-full h-full object-cover scale-105"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-[2rem] text-white mb-6 border border-white/20 shadow-2xl">
            <Coffee className="w-10 h-10" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase drop-shadow-xl mb-6">
            Odoo Cafe
          </h1>
          
          <div className="flex items-start gap-4 text-white/90 bg-slate-900/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 max-w-2xl">
            <Quote className="w-8 h-8 text-amber-400 shrink-0 opacity-50" />
            <p className="text-xl md:text-2xl font-medium italic leading-relaxed text-slate-100">
              "Where every pour is a masterpiece, and every table is a new story waiting to unfold."
            </p>
          </div>
        </motion.div>
      </section>

      {/* Table Selection Section */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 pb-24">
        <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200/50 p-8 md:p-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Select Your Table</h2>
              <p className="text-slate-500 font-medium mt-2 text-lg">Manage active bills or start a fresh order</p>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-bold bg-slate-100/50 p-4 rounded-2xl border border-slate-200">
              <span className="flex items-center gap-2 text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> Available
              </span>
              <span className="flex items-center gap-2 text-rose-600">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span> Occupied
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex py-20 items-center justify-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {tables.map((table) => {
                const active = table.has_active_order;
                return (
                  <motion.div
                    key={table.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTableSelect(table)}
                    className={`relative overflow-hidden rounded-[2rem] p-6 border cursor-pointer transition-colors duration-300 flex flex-col justify-between h-52 group bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] ${
                      active
                        ? 'border-rose-100 hover:border-rose-300'
                        : 'border-emerald-100 hover:border-emerald-300'
                    }`}
                  >
                    {/* Decorative glowing overlay */}
                    <div
                      className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl transition-opacity duration-300 opacity-60 ${
                        active ? 'bg-rose-200' : 'bg-emerald-200'
                      }`}
                    ></div>

                    <div className="flex justify-between items-start relative z-10">
                      <span className={`text-5xl font-black tracking-tighter ${active ? 'text-rose-600' : 'text-slate-800'}`}>
                        {table.number}
                      </span>
                      {active ? (
                        <span className="bg-rose-100 text-rose-600 p-2.5 rounded-xl shadow-sm">
                          <AlertTriangle size={20} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl shadow-sm">
                          <CheckCircle2 size={20} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div className="mt-auto relative z-10">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-3">
                        <Armchair size={16} />
                        <span>{table.seats} Seats</span>
                      </div>
                      <div className={`text-xs uppercase font-black tracking-widest ${active ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {active ? 'View Bill' : 'Start Order'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
