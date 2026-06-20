import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, Coffee, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = (role) => {
    login(role);
    if (role === 'employee') {
      navigate('/admin/dispatch');
    } else {
      navigate('/floor');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans"
    >
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-orange-100/60 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-teal-50/60 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white/70 backdrop-blur-[80px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-200/60 p-8 md:p-16 flex flex-col items-center">
        
        <button 
          onClick={() => navigate('/floor')}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-lg mb-8">
          <Coffee className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter mb-2 text-center">
          Welcome to Odoo Cafe
        </h1>
        <p className="text-slate-500 font-medium mb-16 text-center max-w-md">
          Please select your account type to access the portal and tailored features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          
          {/* Customer Login */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLogin('customer')}
            className="flex flex-col items-center p-10 bg-white/80 border border-slate-200/80 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-amber-200 transition-all group cursor-pointer"
          >
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-inner">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Customer</h2>
            <p className="text-slate-500 text-sm font-medium text-center">
              Access your past orders, manage payment methods, and view your exclusive coupons.
            </p>
          </motion.button>

          {/* Employee Login */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLogin('employee')}
            className="flex flex-col items-center p-10 bg-white/80 border border-slate-200/80 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group cursor-pointer"
          >
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-inner">
              <Briefcase className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Employee</h2>
            <p className="text-slate-500 text-sm font-medium text-center">
              Access the analytics dashboard, dispatch orders to the KDS, and manage products.
            </p>
          </motion.button>

        </div>
      </div>
    </motion.div>
  );
}
