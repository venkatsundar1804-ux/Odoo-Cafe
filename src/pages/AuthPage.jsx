import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, ChevronLeft, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(email, password);
      if (role === 'employee' || role === 'admin') {
        navigate('/admin/dispatch');
      } else {
        navigate('/floor');
      }
    } catch (err) {
      // Error is handled by the store and displayed via the `error` state below
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-['Poppins',sans-serif]"
    >
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-indigo-100/60 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-indigo-50/60 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-[80px] rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-200/60 p-8 flex flex-col items-center">
        
        <button 
          onClick={() => navigate('/floor')}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-semibold text-sm transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg mb-6 mt-4">
          <Coffee className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2 text-center">
          Odoo Cafe
        </h1>
        <p className="text-slate-500 text-sm font-medium mb-8 text-center px-4">
          Enter your credentials to access the POS terminal.
        </p>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cafe.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Sign In
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
          <p className="text-xs text-slate-400 font-medium">
            Demo Credentials:<br/>
            Admin: admin@cafe.com / admin123<br/>
            Cashier: john@cafe.com / pos123
          </p>
        </div>
      </div>
    </motion.div>
  );
}
