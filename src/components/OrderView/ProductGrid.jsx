import { useState } from 'react';
import { Search } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { resolveImage } from '../../utils/imageResolver';

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
    <div className="flex flex-col h-full overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
      {/* Search & Categories */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-500"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === null
                ? 'bg-amber-600/20 text-amber-400 border-amber-500/50 shadow-lg shadow-amber-500/5'
                : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer`}
              style={{
                borderColor: selectedCategory === cat.id ? cat.color : 'rgba(51, 65, 85, 0.4)',
                backgroundColor: selectedCategory === cat.id ? `${cat.color}20` : 'rgba(2, 6, 23, 0.4)',
                color: selectedCategory === cat.id ? cat.color : '#94a3b8'
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
          const themeColor = category?.color || '#64748b';

          return (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              style={{ borderTopColor: themeColor }}
              className="bg-slate-950/50 border-t-4 border-x border-b border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/40 group"
            >
              <div>
                <span 
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                >
                  {category?.name || 'Item'}
                </span>
                <h3 className="font-semibold text-slate-100 mt-2 text-base group-hover:text-amber-400 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-amber-500 font-bold text-lg font-mono">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
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
