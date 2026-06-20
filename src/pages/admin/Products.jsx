import { useState, useEffect } from 'react';
import { Plus, FolderTree, RefreshCw, ShoppingBag } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAdminStore } from '../../store/adminStore';
import { mockCategoryItems } from '../../data/mockCategoryItems';

export default function Products() {
  // Zustand Admin Store for Categories
  const { categories, isLoading: isCategoriesLoading, fetchCategories } = useAdminStore();

  // Modals Local State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // New Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

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
      name: newCategoryName.trim()
    };

    const newCategories = [...categories, newCategory];
    useAdminStore.getState().syncCategories(newCategories);

    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };

  // Open Items Modal when Category is clicked
  const handleCategoryClick = (category) => {
    // Find the category items reference matching by category name or ID
    const match = mockCategoryItems.find(
      item => item.categoryId === category.id || item.categoryName.toLowerCase() === category.name.toLowerCase()
    );
    
    setSelectedCategory({
      ...category,
      items: match ? match.itemTypes : []
    });
    setIsItemsModalOpen(true);
  };

  return (
    <div className="p-8">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Food Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Configure active food and beverages categories for the POS terminals. Click a category to view its item types.</p>
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

      {/* Categories Grid of Buttons */}
      {isCategoriesLoading && categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-gray-400 text-sm">Loading categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button 
              key={category.id || category.name}
              onClick={() => handleCategoryClick(category)}
              className="px-5 py-4 bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/10 rounded-2xl font-semibold text-slate-800 hover:text-amber-700 transition-all text-center shadow-sm cursor-pointer active:scale-95"
            >
              {category.name}
            </button>
          ))}
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

      {/* Modal system for showing Category items */}
      <Modal
        isOpen={isItemsModalOpen}
        onClose={() => setIsItemsModalOpen(false)}
        title={`${selectedCategory?.name || 'Category'} Items`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400 mb-2">Registered food items belonging to this category.</p>
          
          {selectedCategory?.items && selectedCategory.items.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto py-1">
              {selectedCategory.items.map((item, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-650" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm">
              No items configured for this category yet.
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsItemsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
