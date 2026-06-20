import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAdminStore } from '../../store/adminStore';

export default function Products() {
  const [productsList, setProductsList] = useState([
    { id: 1, name: 'Masala Tea', category: 'Beverages', price: 40, status: 'Available' },
    { id: 2, name: 'Filter Coffee', category: 'Beverages', price: 50, status: 'Available' },
    { id: 3, name: 'Samosa (2pcs)', category: 'Snacks', price: 60, status: 'Available' },
    { id: 4, name: 'Cheese Burger', category: 'Fast Food', price: 120, status: 'Unavailable' },
  ]);

  const { categories, fetchCategories } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStatus, setNewProductStatus] = useState(true); // true = Available

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleStatus = (id) => {
    setProductsList(productsList.map(p => 
      p.id === id ? { ...p, status: p.status === 'Available' ? 'Unavailable' : 'Available' } : p
    ));
  };

  const deleteProduct = (id) => {
    setProductsList(productsList.filter(p => p.id !== id));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductCategory || !newProductPrice) return;

    // TODO: Connect to API
    // Make a POST request to create product here.

    const newProduct = {
      id: Date.now(),
      name: newProductName,
      category: newProductCategory,
      price: parseFloat(newProductPrice),
      status: newProductStatus ? 'Available' : 'Unavailable'
    };

    setProductsList([...productsList, newProduct]);
    setNewProductName('');
    setNewProductCategory('');
    setNewProductPrice('');
    setNewProductStatus(true);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Manage food items, pricing, categories, and availability status.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-55/50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Product Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productsList.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-semibold text-slate-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-900">₹{product.price}</span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(product.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                      product.status === 'Available' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}
                  >
                    {product.status === 'Available' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Unavailable</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal system for adding products */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Filter Coffee, Paneer Roll"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              required
              value={newProductCategory}
              onChange={(e) => setNewProductCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            >
              <option value="">Select Category</option>
              {categories.length > 0 ? (
                categories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)
              ) : (
                <>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Dessert">Dessert</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 80"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100 mt-4">
            <div>
              <span className="block text-sm font-semibold text-slate-700">Available Status</span>
              <span className="block text-xs text-slate-400">Mark item as in-stock immediately</span>
            </div>
            <button
              type="button"
              onClick={() => setNewProductStatus(!newProductStatus)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                newProductStatus ? 'bg-amber-600 justify-end' : 'bg-slate-300 justify-start'
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
