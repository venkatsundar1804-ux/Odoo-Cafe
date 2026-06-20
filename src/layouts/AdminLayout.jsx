import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingBag, FolderTree, CreditCard, Tag, LayoutDashboard } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2">
        <div className="px-3 mb-6 mt-2 font-bold text-slate-900 text-lg">Odoo Cafe</div>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
