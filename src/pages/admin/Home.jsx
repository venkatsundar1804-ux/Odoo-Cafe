import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function Home() {
  const stats = [
    { name: 'Total Revenue', value: '₹45,231', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Orders Today', value: '124', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Customers', value: '42', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.name}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h2>
        <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
          Live feed will appear here once backend wiring is complete.
        </div>
      </div>
    </div>
  );
}
