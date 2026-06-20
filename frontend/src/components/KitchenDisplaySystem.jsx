import React, { useState } from 'react';

export default function KitchenDisplaySystem() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('To Cook');

    // Accordion visibility states
    const [showProducts, setShowProducts] = useState(true);
    const [showCategories, setShowCategories] = useState(true);

    // Filter Tracking States
    const [selectedCategory, setSelectedCategory] = useState(null); // Tracks if a category is selected
    const [selectedProduct, setSelectedProduct] = useState(null);  // Tracks if a specific item is selected

    // Master list of available items and their categories
    const menuCatalog = [
        { name: 'Burger', category: 'Quick Bites' },
        { name: 'Pizza', category: 'Quick Bites' },
        { name: 'coffee', category: 'Drink' },
        { name: 'water', category: 'Drink' },
        { name: 'Desert', category: 'Desert' }
    ];

    const categoriesList = ['Desert', 'Quick Bites', 'Drink'];

    // Hardcoded order data
    const [orders, setOrders] = useState([
        { id: '#2205', items: [{ name: 'Masala Tea', qty: 3, done: false }, { name: 'Lassi', qty: 3, done: false }, { name: 'Coffee', qty: 3, done: false }, { name: 'Water', qty: 3, done: true }], status: 'To Cook' }
    ]);

    const toggleItemStrike = (orderId, itemIndex) => {
        setOrders(orders.map(order => {
            if (order.id !== orderId) return order;
            const newItems = [...order.items];
            newItems[itemIndex].done = !newItems[itemIndex].done;
            return { ...order, items: newItems };
        }));
    };

    // Reset filters handler
    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedProduct(null);
    };

    // Filter products dynamically based on category selection
    const displayedProducts = selectedCategory
        ? menuCatalog.filter(item => item.category === selectedCategory)
        : menuCatalog;

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-neutral-700 p-6 bg-neutral-900 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-white hover:text-orange-400 focus:outline-none p-1 rounded transition active:scale-95 cursor-pointer"
                    >
                        <div className="space-y-1.5 w-6">
                            <span className="block h-0.5 bg-current rounded"></span>
                            <span className="block h-0.5 bg-current rounded"></span>
                            <span className="block h-0.5 bg-current rounded"></span>
                        </div>
                    </button>

                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="bg-orange-600 px-3 py-1 rounded text-sm">Logo</span> KDS
                    </h1>
                </div>

                <div className="flex gap-4">
                    {['All', 'To Cook', 'Preparing', 'Completed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded font-semibold transition cursor-pointer ${activeTab === tab ? 'bg-orange-700' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Screen Content Split */}
            <div className="flex flex-1 overflow-hidden">

                {/* Interactive Sidebar Panel Component */}
                {isSidebarOpen && (
                    <div className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0 overflow-y-auto">
                        {/* Top row: Clear Filter Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-900">
                            <span
                                onClick={clearFilters}
                                className="text-orange-700/90 font-semibold text-lg tracking-wide cursor-pointer hover:text-orange-600 select-none"
                            >
                                Clear Filter
                            </span>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="text-orange-700/90 font-bold hover:text-orange-600 text-lg px-2 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Section 1: Product list (Clicking title collapses/expands list) */}
                        <div>
                            <div
                                onClick={() => setShowProducts(!showProducts)}
                                className="bg-amber-800/40 px-4 py-2 text-amber-200 font-bold text-sm tracking-wide flex justify-between items-center cursor-pointer select-none hover:bg-amber-800/50"
                            >
                                <span>Product</span>
                                <span className="text-xs">{showProducts ? '▲' : '▼'}</span>
                            </div>

                            {showProducts && (
                                <div className="flex flex-col font-medium">
                                    {displayedProducts.map((item) => (
                                        <span
                                            key={item.name}
                                            onClick={() => setSelectedProduct(selectedProduct === item.name ? null : item.name)}
                                            className={`px-4 py-2.5 text-sm transition cursor-pointer border-l-2 ${selectedProduct === item.name
                                                    ? 'bg-red-950/40 text-red-300 border-red-700 font-bold'
                                                    : 'text-neutral-300 border-transparent hover:bg-neutral-900'
                                                }`}
                                        >
                                            {item.name}
                                        </span>
                                    ))}
                                    {displayedProducts.length === 0 && (
                                        <span className="px-4 py-2.5 text-xs text-neutral-500 italic">No matching products</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Section 2: Category list (Clicking category filters products above) */}
                        <div className="mt-2">
                            <div
                                onClick={() => setShowCategories(!showCategories)}
                                className="bg-amber-800/40 px-4 py-2 text-amber-200 font-bold text-sm tracking-wide flex justify-between items-center cursor-pointer select-none hover:bg-amber-800/50"
                            >
                                <span>Category</span>
                                <span className="text-xs">{showCategories ? '▲' : '▼'}</span>
                            </div>

                            {showCategories && (
                                <div className="flex flex-col font-medium">
                                    {categoriesList.map((category) => (
                                        <span
                                            key={category}
                                            onClick={() => {
                                                // If clicked again, deselect it. Otherwise select it.
                                                setSelectedCategory(selectedCategory === category ? null : category);
                                                setSelectedProduct(null); // Clear selected single product when category changes
                                            }}
                                            className={`px-4 py-2.5 text-sm transition cursor-pointer border-l-2 ${selectedCategory === category
                                                    ? 'bg-red-950/40 text-red-300 border-red-700 font-bold'
                                                    : 'text-neutral-300 border-transparent hover:bg-neutral-900'
                                                }`}
                                        >
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Ticket Grid Container */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.filter(o => activeTab === 'All' || o.status === activeTab).map(order => (
                            <div key={order.id} className="bg-neutral-800 rounded-lg p-5 border border-neutral-700 shadow-xl h-fit">
                                <h2 className="text-xl font-bold border-b border-neutral-700 pb-2 mb-4 text-orange-400">{order.id}</h2>
                                <ul className="space-y-3">
                                    {order.items.map((item, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => toggleItemStrike(order.id, idx)}
                                            className={`text-lg cursor-pointer transition select-none ${item.done ? 'line-through text-neutral-500' : 'text-neutral-200 hover:text-orange-300'}`}
                                        >
                                            {item.qty} × {item.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}