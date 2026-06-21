import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  
  // true = Sign Up active (Overlay on left)
  // false = Sign In active (Overlay on right)
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const role = await login(email, password);
      if (role === 'kds') {
        navigate('/kds');
      } else if (role === 'employee' || role === 'admin') {
        navigate('/admin/dispatch');
      } else {
        navigate('/floor');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const role = await register({ name, email, password });
      if (role === 'kds') {
        navigate('/kds');
      } else if (role === 'employee' || role === 'admin') {
        navigate('/admin/dispatch');
      } else {
        navigate('/floor');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to switch modes and clear errors/forms
  const togglePanel = (isSignUp) => {
    setIsRightPanelActive(isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: isRightPanelActive ? -50 : 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, x: isRightPanelActive ? 50 : -50, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Cinematic Background Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-sky-200/60 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] transition-colors duration-1000 ${
            isRightPanelActive ? 'bg-rose-200/60' : 'bg-amber-200/60'
          }`} 
        />
      </div>

      {/* MAIN CONTAINER */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-[1000px] min-h-[600px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(131,128,196,0.15)] rounded-[2.5rem] overflow-hidden flex z-10"
      >
        
        {/* --- LEFT FORM CONTAINER (Sign In) --- */}
        <div className="w-1/2 p-12 flex flex-col justify-center relative z-20">
          <AnimatePresence mode="wait">
            {!isRightPanelActive && (
              <motion.div 
                key="signin"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-sm mx-auto"
              >
                <motion.div variants={itemVariants} className="mb-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                    <LogIn className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-4xl font-black text-indigo-600 tracking-tight mb-2">Welcome Back</h2>
                  <p className="text-slate-500 font-medium">Enter your credentials to access your account.</p>
                </motion.div>

                {error && <motion.p variants={itemVariants} className="text-sm text-rose-500 bg-rose-50 border border-rose-200 p-3 rounded-xl mb-6">{error}</motion.p>}
                
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <motion.div variants={itemVariants} className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full bg-white/70 border border-slate-200/60 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium shadow-sm" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="w-full bg-white/70 border border-slate-200/60 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium shadow-sm" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex justify-end">
                    <button type="button" className="text-sm text-indigo-600 hover:text-indigo-400 transition-colors font-medium">
                      Forgot password?
                    </button>
                  </motion.div>

                  <motion.button 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(20,33,61,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Sign In'}
                    {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- RIGHT FORM CONTAINER (Sign Up) --- */}
        <div className="absolute top-0 right-0 w-1/2 h-full p-12 flex flex-col justify-center z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            {isRightPanelActive && (
              <motion.div 
                key="signup"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-sm mx-auto pointer-events-auto"
              >
                <motion.div variants={itemVariants} className="mb-8">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    <UserPlus className="w-6 h-6 text-rose-500" />
                  </div>
                  <h2 className="text-4xl font-black text-rose-500 tracking-tight mb-2">Create Account</h2>
                  <p className="text-slate-500 font-medium">Join Odoo Cafe to start your journey.</p>
                </motion.div>

                {error && <motion.p variants={itemVariants} className="text-sm text-rose-500 bg-rose-50 border border-rose-200 p-3 rounded-xl mb-6">{error}</motion.p>}
                
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <motion.div variants={itemVariants} className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full bg-white/70 border border-slate-200/60 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all font-medium shadow-sm" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full bg-white/70 border border-slate-200/60 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all font-medium shadow-sm" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="w-full bg-white/70 border border-slate-200/60 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all font-medium shadow-sm" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </motion.div>
                  
                  <motion.button 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-slate-900 font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(252,163,17,0.3)] transition-all flex items-center justify-center gap-2 group mt-6 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Creating...' : 'Sign Up'}
                    {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- THE SLIDING OVERLAY PANEL --- */}
        <motion.div 
          initial={false}
          animate={{ x: isRightPanelActive ? "-100%" : "0%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 right-0 w-1/2 h-full z-30"
        >
          {/* Overlay Inner Container (Needs reverse translation to keep content centered) */}
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] shadow-[-20px_0_40px_rgba(0,0,0,0.1)]">
            <motion.div 
              animate={{ x: isRightPanelActive ? "-50%" : "0%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-br from-indigo-600 to-amber-400 flex"
            >
              
              {/* Overlay Left Content (Hello Friend -> Sign Up) */}
              <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <h2 className="text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg">Hello, Friend!</h2>
                  <p className="text-white/80 font-medium mb-10 text-lg max-w-sm mx-auto leading-relaxed">
                    Enter your personal details and start your journey with Odoo Cafe today.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePanel(true)}
                    className="border-2 border-white/80 text-white rounded-xl px-12 py-4 font-bold hover:bg-white hover:text-indigo-600 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] tracking-wider"
                  >
                    SIGN UP
                  </motion.button>
                </div>
              </div>

              {/* Overlay Right Content (Welcome Back -> Sign In) */}
              <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10">
                  <h2 className="text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg">Welcome Back!</h2>
                  <p className="text-white/80 font-medium mb-10 text-lg max-w-sm mx-auto leading-relaxed">
                    To keep connected with us please login with your personal info.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePanel(false)}
                    className="border-2 border-white/80 text-white rounded-xl px-12 py-4 font-bold hover:bg-white hover:text-indigo-600 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] tracking-wider"
                  >
                    SIGN IN
                  </motion.button>
                </div>
              </div>

            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default AuthPage;

