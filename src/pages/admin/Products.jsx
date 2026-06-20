import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle, ShoppingBag, FolderTree, RefreshCw } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAdminStore } from '../../store/adminStore';

export default function Products() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'
  
  // Products Local Mock State
  const [productsList, setProductsList] = useState([
    { id: 1, name: 'Masala Tea', category: 'Beverages', price: 40, status: 'Available' },
    { id: 2, name: 'Filter Coffee', category: 'Coffee', price: 50, status: 'Available' },
    { id: 3, name: 'Samosa (2pcs)', category: 'Snacks', price: 60, status: 'Available' },
    { id: 4, name: 'Cheese Burger', category: 'Burgers', price: 120, status: 'Unavailable' },
  ]);

  // Zustand Admin Store for Categories
  const { categories, isLoading: isCategoriesLoading, fetchCategories } = useAdminStore();

  // Modals Local State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // New Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStatus, setNewProductStatus] = useState(true);

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#F59E0B');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Product Actions
  const toggleProductStatus = (id) => {
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
    setIsProductModalOpen(false);
  };

  // Category Actions
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    // TODO: Connect to API
    // Make a POST request to create category here.

    const newCategory = {
      id: Date.now(),
      name: newCategoryName.trim(),
      color: newCategoryColor
    };

    // Update the Zustand state (simulate local addition for now)
    useAdminStore.setState({
      categories: [...categories, newCategory]
    });

    setNewCategoryName('');
    setNewCategoryColor('#F59E0B');
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id) => {
    // TODO: Connect to API
    // Make a DELETE request here.
    useAdminStore.setState({
      categories: categories.filter(c => c.id !== id)
    });
  };

  return (
    <div className="p-8">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products & Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Configure food catalog items, pricing structures, and display categories.</p>
        </div>
        
        {/* Dynamic Action Trigger based on Active Tab */}
        {activeTab === 'products' ? (
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => fetchCategories()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200/50 transition-colors cursor-pointer"
              title="Refresh Categories"
            >
              <RefreshCw className={`w-4 h-4 ${isCategoriesLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          <span>Products Catalog ({productsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FolderTree className="w-4.5 h-4.5" />
          <span>Food Categories ({categories.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'products' ? (
        /* Products Catalog Tab */
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
                <tr key={product.id} className="hover:bg-slate-55/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-semibold text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-650 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">₹{product.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleProductStatus(product.id)}
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
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-55 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Categories Tab */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isCategoriesLoading && categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
              <span className="text-gray-400 text-sm">Loading categories...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-55/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Product Category</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Color</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr key={category.id || category.name} className="hover:bg-slate-55/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{category.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: category.color || '#cccccc' }}
                        />
                        <span className="text-xs text-slate-500 font-mono">{category.color || '#cccccc'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-55 rounded-lg transition-colors cursor-pointer"
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
      )}

      {/* Modal system for adding products */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-slate-55 rounded-xl transition-colors cursor-pointer"
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

      {/* Modal system for adding categories */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Food Category"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Desserts, Burgers"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Category Theme Color
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-12 h-10 border border-slate-200 rounded-xl cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-650 hover:bg-slate-55 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors cursor-pointer"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
