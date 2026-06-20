import { useState, useEffect } from 'react';
import { Plus, FolderTree, RefreshCw, ShoppingBag } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAdminStore } from '../../store/adminStore';
import { mockCategoryItems } from '../../data/mockCategoryItems';

export default function Products() {
  // Zustand Admin Store for Categories and Products
  const { categories, products, isLoading: isCategoriesLoading, fetchCategories, fetchProducts } = useAdminStore();

  // Modals Local State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Category Actions
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    // TODO: Connect to API
    // Make a POST request to create category here.

    const newCategory = {
      id: Date.now(),
      name: newCategoryName.trim()
    };

    const newCategories = [...categories, newCategory];
    useAdminStore.getState().syncCategories(newCategories);

    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };



  return (
    <div className="p-8">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Directory</h1>
          <p className="text-sm text-slate-500 mt-1">View all active food and beverages for the POS terminals.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => { fetchCategories(); fetchProducts(); }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200/50 transition-colors cursor-pointer"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${(isCategoriesLoading || isCategoriesLoading) ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {isCategoriesLoading && categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-gray-400 text-sm">Loading catalog...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryProducts = products.filter(
              p => p.category_id === category.id || (p.category && p.category.toLowerCase() === category.name.toLowerCase())
            );

            return (
              <div key={category.id || category.name} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">{category.name}</h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-lg">
                    {categoryProducts.length} Items
                  </span>
                </div>
                
                <div className="p-6">
                  {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {categoryProducts.map((product, index) => (
                        <div 
                          key={product.id || index}
                          className="px-4 py-3 bg-white border border-slate-100 hover:border-amber-200 hover:shadow-md rounded-xl transition-all text-center flex flex-col items-center gap-2 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-amber-50 flex items-center justify-center transition-colors">
                            <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{product.name}</p>
                            {product.price && <p className="text-xs text-amber-600 font-bold mt-1">₹{product.price.toFixed(2)}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                      No products found in this category.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
