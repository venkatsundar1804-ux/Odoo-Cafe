import { useState } from 'react';
import { Search } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export default function ProductGrid({ products, categories }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const addToCart = useCartStore((state) => state.addToCart);

  // Filter products by category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      {/* Search & Categories */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-400 text-sm"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === null
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200/60 shadow-sm'
                : 'bg-slate-550/5 text-slate-500 border-slate-200/80 hover:bg-slate-100'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer`}
              style={{
                borderColor: selectedCategory === cat.id ? cat.color : 'rgba(226, 232, 240, 0.8)',
                backgroundColor: selectedCategory === cat.id ? `${cat.color}15` : 'rgba(248, 250, 252, 0.8)',
                color: selectedCategory === cat.id ? cat.color : '#64748b'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 pr-1">
        {filteredProducts.map((product) => {
          const category = categories.find((c) => c.id === product.category_id);
          const themeColor = category?.color || '#6366f1';

          return (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              style={{ borderTopColor: themeColor }}
              className="bg-slate-50 border-t-4 border-x border-b border-slate-200/80 hover:border-slate-350 hover:bg-white rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-100 group"
            >
              <div>
                <span 
                  className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
                >
                  {category?.name || 'Item'}
                </span>
                <h3 className="font-bold text-slate-800 mt-2.5 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-slate-500 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-indigo-600 font-extrabold text-base font-mono">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {product.unit_of_measure || 'piece'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
