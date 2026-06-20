import { useState, useEffect } from 'react';
import { Plus, Trash2, FolderTree, RefreshCw } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAdminStore } from '../../store/adminStore';

export default function Products() {
  // Zustand Admin Store for Categories
  const { categories, isLoading: isCategoriesLoading, fetchCategories } = useAdminStore();

  // Modals Local State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#F59E0B');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
          <h1 className="text-2xl font-bold text-slate-900">Food Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Configure active product categories and color themes for POS terminals.</p>
        </div>
        
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
      </div>

      {/* Categories Table Card */}
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
