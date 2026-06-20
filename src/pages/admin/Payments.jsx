import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle, CreditCard, Landmark, DollarSign } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api';

export default function Payments() {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodStatus, setNewMethodStatus] = useState(true); // true = Active

  // Fetch payment methods from DB on mount
  useEffect(() => {
    const loadMethods = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/payment-methods');
        setMethods(response.data.map(m => ({
          ...m,
          status: m.is_active ? 'Active' : 'Inactive',
          type: m.name.toLowerCase().includes('cash') ? 'Cash' :
                m.name.toLowerCase().includes('upi') || m.name.toLowerCase().includes('qr') ? 'UPI' : 'Card'
        })));
      } catch (err) {
        console.warn("Failed to fetch payment methods, using defaults", err);
        setMethods([
          { id: 1, name: 'Cash', status: 'Active', type: 'Cash', is_active: true },
          { id: 2, name: 'Digital/Card Terminal', status: 'Active', type: 'Card', is_active: true },
          { id: 3, name: 'UPI Dynamic QR', status: 'Active', type: 'UPI', is_active: true },
        ]);
      }
      setIsLoading(false);
    };
    loadMethods();
  }, []);

  const toggleStatus = async (id) => {
    try {
      const response = await api.put(`/payment-methods/${id}/toggle`);
      const updated = response.data;
      setMethods(methods.map(m => 
        m.id === id ? { ...m, status: updated.is_active ? 'Active' : 'Inactive', is_active: updated.is_active } : m
      ));
    } catch (err) {
      console.error("Failed to toggle payment method", err);
    }
  };

  const deleteMethod = async (id) => {
    try {
      await api.delete(`/payment-methods/${id}`);
      setMethods(methods.filter(m => m.id !== id));
    } catch (err) {
      console.error("Failed to delete payment method", err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Cash': return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'Card': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'UPI': return <Landmark className="w-5 h-5 text-indigo-600" />;
      default: return <CreditCard className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (!newMethodName.trim()) return;

    try {
      const response = await api.post('/payment-methods', {
        name: newMethodName,
        is_active: newMethodStatus
      });
      const created = response.data;
      const newMethod = {
        ...created,
        status: created.is_active ? 'Active' : 'Inactive',
        type: created.name.toLowerCase().includes('cash') ? 'Cash' : 
              created.name.toLowerCase().includes('upi') || created.name.toLowerCase().includes('qr') ? 'UPI' : 'Card'
      };
      setMethods([...methods, newMethod]);
    } catch (err) {
      console.error("Failed to create payment method", err);
    }

    setNewMethodName('');
    setNewMethodStatus(true);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Methods</h1>
          <p className="text-sm text-slate-500 mt-1">Configure active terminal options for cashiers and customer self-checkout.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment Method</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400 font-medium">Loading payment methods...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-55/50">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Method</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {methods.map((method) => (
                <tr key={method.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        {getIcon(method.type)}
                      </div>
                      <span className="font-semibold text-slate-900">{method.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(method.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        method.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {method.status === 'Active' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteMethod(method.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal system for adding payment methods */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Payment Method"
      >
        <form onSubmit={handleAddPaymentMethod} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Payment Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Card Terminal, UPI QR"
              value={newMethodName}
              onChange={(e) => setNewMethodName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100 mt-4">
            <div>
              <span className="block text-sm font-semibold text-slate-700">Active Status</span>
              <span className="block text-xs text-slate-400">Enable immediately upon creation</span>
            </div>
            <button
              type="button"
              onClick={() => setNewMethodStatus(!newMethodStatus)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                newMethodStatus ? 'bg-amber-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-55 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors cursor-pointer"
            >
              Save Method
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
