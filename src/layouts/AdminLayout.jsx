import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
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
  Menu 
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white z-20">
        {/* Left Side: Logo & Search */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-amber-700 text-white font-bold rounded-xl text-sm flex items-center justify-center tracking-wider shadow-sm">
            Logo
          </div>
          
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
        </div>

        {/* Center: Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Cash Register">
            <Calculator className="w-5 h-5" />
          </button>
          
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Edit Session">
            <Pencil className="w-5 h-5" />
          </button>
          
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Add Item">
            <PlusSquare className="w-5 h-5" />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 font-bold rounded-xl border border-slate-200/55 text-xs transition-colors cursor-pointer" title="Table Selection">
            <Armchair className="w-4 h-4 text-amber-600" />
            <span>12 V</span>
          </button>
        </div>

        {/* Right Side: Profile & Sidebar Toggle */}
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer" title="Profile">
            <User className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-colors cursor-pointer animate-pulse" 
            title="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2 shrink-0 transition-all duration-300">
            <div className="px-3 mb-6 mt-2 font-bold text-slate-900 text-lg">Odoo Cafe</div>
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
