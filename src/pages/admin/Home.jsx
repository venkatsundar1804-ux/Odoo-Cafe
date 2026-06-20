import { useState, useEffect } from 'react';
import { Users, ShoppingBag, IndianRupee, TrendingUp, Package, Tag } from 'lucide-react';
import { fetchTransactionsFromDB, fetchLiveStats } from '../../data/dataProvider';

export default function Home() {
  const [stats, setStats] = useState([
    { name: 'Total Revenue', value: '₹0', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Orders Today', value: '0', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Registered Customers', value: '0', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Avg Order Value', value: '₹0', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
  ]);

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const [liveStats, txns] = await Promise.all([
        fetchLiveStats(),
        fetchTransactionsFromDB()
      ]);

      if (liveStats) {
        setStats([
          { name: 'Total Revenue', value: `₹${liveStats.total_revenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { name: 'Total Orders', value: String(liveStats.total_orders), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
          { name: 'Registered Customers', value: String(liveStats.total_customers), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { name: 'Avg Order Value', value: `₹${liveStats.average_order_value}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
        ]);
      }

      setTransactions(txns);
      setIsLoading(false);
    };

    loadData();
  }, []);

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
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400 font-medium">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-medium">No transactions recorded yet. Place an order to see data here.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-700">
                    <td className="py-4 px-4 font-mono font-semibold text-slate-900">{tx.id}</td>
                    <td className="py-4 px-4 font-medium capitalize">{tx.payment_method}</td>
                    <td className="py-4 px-4 font-semibold text-slate-900">₹{tx.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        tx.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-slate-550 font-medium">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
