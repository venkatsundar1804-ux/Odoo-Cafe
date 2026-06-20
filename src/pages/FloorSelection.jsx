import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, CheckCircle2, AlertTriangle, Coffee } from 'lucide-react';
import { useTableStore } from '../store/tableStore';
import { motion } from 'framer-motion';

export default function FloorSelection() {
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
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="h-screen w-full bg-white overflow-hidden flex items-center justify-center p-6 sm:p-10 font-sans">
      
      {/* Glassy Transparent Screen Container */}
      <div className="relative w-full h-full max-w-[1400px] bg-slate-50/50 backdrop-blur-[60px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-200/50 overflow-hidden flex flex-col items-center justify-center">
        
        {/* Abstract Artistic Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[55%] bg-orange-100/60 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[40%] bg-teal-50/60 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[-5%] w-[25%] h-[35%] bg-rose-50/50 rounded-full blur-[90px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl px-8 flex flex-col h-full py-12">
          
          {/* Brand Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-12 text-center"
          >
            <div className="bg-orange-100 p-4 rounded-[2rem] shadow-sm text-orange-500 mb-6 border border-white">
              <Coffee className="w-8 h-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-800 uppercase">
              Select a Table
            </h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">
              Manage active bills or start a new order
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8"
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-xl font-bold text-slate-700 tracking-wide uppercase">
                  Main Dining Floor
                </h2>
                <div className="flex items-center gap-6 text-sm font-bold">
                  <span className="flex items-center gap-2 text-emerald-500">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span> Available
                  </span>
                  <span className="flex items-center gap-2 text-rose-500">
                    <span className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]"></span> Occupied
                  </span>
                </div>
              </div>

              {/* Grid Layout of Tables */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-2">
                {tables.map((table) => {
                  const active = table.has_active_order;
                  return (
                    <motion.div
                      key={table.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTableSelect(table)}
                      className={`relative overflow-hidden rounded-[2rem] p-6 border cursor-pointer transition-colors duration-300 flex flex-col justify-between h-48 group bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] ${
                        active
                          ? 'border-rose-100 hover:border-rose-300'
                          : 'border-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      {/* Decorative glowing overlay */}
                      <div
                        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-opacity duration-300 opacity-60 ${
                          active ? 'bg-rose-200' : 'bg-emerald-200'
                        }`}
                      ></div>

                      <div className="flex justify-between items-start relative z-10">
                        <span className={`text-4xl font-black tracking-tighter ${active ? 'text-rose-600' : 'text-slate-800'}`}>
                          {table.number}
                        </span>
                        {active ? (
                          <span className="bg-rose-100 text-rose-500 p-2 rounded-xl">
                            <AlertTriangle size={18} strokeWidth={3} />
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-500 p-2 rounded-xl">
                            <CheckCircle2 size={18} strokeWidth={3} />
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
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
