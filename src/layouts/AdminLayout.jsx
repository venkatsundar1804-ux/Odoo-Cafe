import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Coffee, ShoppingBag, FolderTree, CreditCard, Tag } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Category', path: '/admin', icon: FolderTree },
    { name: 'Payment Method', path: '/admin/payments', icon: CreditCard },
    { name: 'Coupon & Promotion', path: '/admin/coupons', icon: Tag },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Top Nav */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Coffee className="w-6 h-6 text-amber-500 animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Odoo Cafe
          </span>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-medium">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-right">
            <span className="text-sm font-medium text-gray-200">Administrator</span>
            <span className="text-xs text-gray-400">admin@odoocafe.com</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
            <User className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </header>

      {/* Main Frame */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Configuration
          </div>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-600/15 text-amber-400 border-l-4 border-amber-500'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-950 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
