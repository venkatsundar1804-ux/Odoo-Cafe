import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

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
      await login({ email, password });
      navigate('/pos');
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
      await register({ name, email, password });
      navigate('/pos');
    } catch (err) {
      setError(err.message || 'Authentication failed.');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-7rem] top-12 h-72 w-72 rounded-full bg-sky-200/70 blur-3xl transition-all duration-700" />
        <div className={`absolute bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full blur-3xl transition-all duration-700 ${!isRightPanelActive ? 'bg-amber-100' : 'bg-rose-100/70'}`} />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative overflow-hidden w-full max-w-[900px] min-h-[550px] bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(131,128,196,0.15)] rounded-2xl z-10">

        {/* --- SIGN UP FORM --- */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out px-12 flex flex-col justify-center items-center bg-transparent ${
            isRightPanelActive 
              ? 'translate-x-full opacity-100 z-50' 
              : 'opacity-0 z-10 pointer-events-none'
          }`}
        >
          <h2 className="text-3xl font-bold text-[#8380C4] mb-6 text-center">Create Account</h2>
          {error && isRightPanelActive && <p className="text-sm text-rose-500 mb-4">{error}</p>}
          <form className="w-full space-y-4" onSubmit={handleRegisterSubmit}>
            <input 
              type="text" 
              placeholder="Name" 
              className="odoo-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="odoo-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="odoo-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button type="submit" disabled={isSubmitting} className="btn-gradient w-full py-3 mt-4 text-white font-bold rounded-xl shadow-lg disabled:opacity-60">
              {isSubmitting ? 'CREATING...' : 'SIGN UP'}
            </button>
          </form>
        </div>

        {/* --- SIGN IN FORM --- */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out px-12 flex flex-col justify-center items-center bg-transparent ${
            isRightPanelActive 
              ? 'translate-x-full opacity-0 z-10 pointer-events-none' 
              : 'translate-x-0 opacity-100 z-50'
          }`}
        >
          <h2 className="text-3xl font-bold text-[#8380C4] mb-6 text-center">Sign In</h2>
          {error && !isRightPanelActive && <p className="text-sm text-rose-500 mb-4">{error}</p>}
          <form className="w-full space-y-4" onSubmit={handleLoginSubmit}>
            <input 
              type="email" 
              placeholder="Email" 
              className="odoo-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="odoo-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <div className="text-right w-full">
              <button type="button" className="text-sm text-[#8380C4] hover:text-[#FFD4A6] transition-colors underline-offset-4 hover:underline">
                Forgot your password?
              </button>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-gradient w-full py-3 mt-4 text-white font-bold rounded-xl shadow-lg disabled:opacity-60">
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* --- THE SLIDING OVERLAY CONTAINER --- */}
        <div 
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${
            isRightPanelActive ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* The Inner Overlay */}
          <div 
            className={`absolute top-0 left-[-100%] w-[200%] h-full transition-transform duration-700 ease-in-out bg-gradient-to-br from-[#8380C4] to-[#FFD4A6] text-white ${
              isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'
            }`}
          >
            {/* OVERLAY LEFT PANEL (Shows when Sign Up is active) */}
            <div 
              className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ease-in-out ${
                isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'
              }`}
            >
              <h2 className="text-4xl font-bold mb-4 drop-shadow-md">Welcome Back!</h2>
              <p className="mb-8 text-white/90 leading-relaxed drop-shadow-sm">
                To keep connected with Odoo Cafe please login with your personal info
              </p>
              <button
                onClick={() => togglePanel(false)}
                className="border-2 border-white bg-transparent rounded-xl px-12 py-3 font-bold hover:bg-white hover:text-[#8380C4] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                SIGN IN
              </button>
            </div>

            {/* OVERLAY RIGHT PANEL (Shows when Sign In is active) */}
            <div 
              className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ease-in-out ${
                isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'
              }`}
            >
              <h2 className="text-4xl font-bold mb-4 drop-shadow-md">Hello, Friend!</h2>
              <p className="mb-8 text-white/90 leading-relaxed drop-shadow-sm">
                Enter your personal details and start customizing your orders
              </p>
              <button
                onClick={() => togglePanel(true)}
                className="border-2 border-white bg-transparent rounded-xl px-12 py-3 font-bold hover:bg-white hover:text-[#8380C4] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                SIGN UP
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
