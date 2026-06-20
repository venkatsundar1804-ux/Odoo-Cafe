import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  FolderTree, 
  CreditCard, 
  Tag, 
  LayoutDashboard,
  Search, 
  Calculator, 
  Pencil, 
  PlusSquare, 
  Armchair, 
  User, 
  Menu,
  Coffee,
  ChevronLeft,
  Users,
  ChefHat,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const allMenuItems = [
    { name: 'Analytics', path: '/admin', icon: LayoutDashboard, roles: ['employee'] },
    { name: 'Customer Portal', path: '/admin/customer', icon: Users, roles: ['customer'] },
    { name: 'Order Dispatch', path: '/admin/dispatch', icon: ChefHat, roles: ['employee'] },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag, roles: ['employee'] },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard, roles: ['employee'] },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag, roles: ['employee'] },
  ];

  // If no role is set, we might default to employee for demo purposes, or force login
  const currentRole = role || 'employee';
  const menuItems = allMenuItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="h-screen w-full bg-slate-50 overflow-hidden flex items-center justify-center p-4 sm:p-8 font-sans relative">
      
      {/* Abstract Artistic Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[55%] bg-orange-100/60 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[40%] bg-teal-50/60 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[-5%] w-[25%] h-[35%] bg-rose-50/50 rounded-full blur-[90px]" />
      </div>

      {/* Glassy Transparent Screen Container */}
      <div className="relative w-full h-full max-w-[1600px] bg-white/70 backdrop-blur-[80px] rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden flex flex-col z-10">
        
        {/* Top Header Bar */}
        <header className="h-20 border-b border-slate-200/50 flex items-center justify-between px-8 bg-white/40 shrink-0">
          {/* Left Side: Logo & Search */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-slate-800 font-black text-xl tracking-tighter">
              <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md">
                <Coffee className="w-5 h-5" />
              </div>
              <span>Odoo Cafe</span>
            </div>
            
            <div className="relative w-80 hidden md:block">
              <input 
                type="text" 
                placeholder="Search analytics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white/60 border border-slate-200/80 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition-all shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Center: Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white/60 hover:bg-white text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors shadow-sm cursor-pointer" title="Cash Register">
              <Calculator className="w-4 h-4" />
            </button>
            
            <button className="p-2.5 bg-white/60 hover:bg-white text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors shadow-sm cursor-pointer" title="Edit Session">
              <Pencil className="w-4 h-4" />
            </button>
            
            <button className="p-2.5 bg-white/60 hover:bg-white text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors shadow-sm cursor-pointer" title="Add Item">
              <PlusSquare className="w-4 h-4" />
            </button>

            <button 
              onClick={() => navigate('/floor')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/60 hover:bg-white text-slate-700 hover:text-slate-900 font-bold rounded-xl border border-slate-200/50 text-xs transition-colors shadow-sm cursor-pointer ml-2" 
              title="Return to POS"
            >
              <ChevronLeft className="w-4 h-4 text-amber-600" />
              <span>Back to POS</span>
            </button>
          </div>

          {/* Right Side: Profile & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-2 hidden sm:flex">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{currentRole}</span>
              <span className="text-[10px] text-slate-400 font-medium">Logged in</span>
            </div>
            
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors shadow-sm cursor-pointer" 
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors shadow-md cursor-pointer" 
              title="Toggle Sidebar Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Body Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-white/40 border-r border-slate-200/50 p-6 flex flex-col gap-2 shrink-0 overflow-y-auto custom-scrollbar"
              >
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4 pl-2">Admin Panel</div>
                <nav className="flex flex-col gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-[1rem] text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-amber-500 text-white shadow-[0_4px_14px_rgba(245,158,11,0.3)]'
                            : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="whitespace-nowrap">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-transparent custom-scrollbar relative">
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
}
