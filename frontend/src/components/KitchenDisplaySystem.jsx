import React, { useMemo, useState } from 'react';

const tabs = ['All', 'To Cook', 'Preparing', 'Completed'];

const menuCatalog = [
    { name: 'Masala Tea', category: 'Drink' },
    { name: 'Lassi', category: 'Drink' },
    { name: 'Coffee', category: 'Drink' },
    { name: 'Water', category: 'Drink' },
    { name: 'Burger', category: 'Quick Bites' },
    { name: 'Pizza', category: 'Quick Bites' },
    { name: 'Desert', category: 'Desert' }
];

const categoriesList = ['Desert', 'Quick Bites', 'Drink'];

const initialOrders = [
    {
        id: '#2205',
        items: [
            { name: 'Masala Tea', qty: 3, done: false },
            { name: 'Lassi', qty: 3, done: false },
            { name: 'Coffee', qty: 3, done: false },
            { name: 'Water', qty: 3, done: true }
        ]
    }
];

export default function KitchenDisplaySystem() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('To Cook');
    const [searchQuery, setSearchQuery] = useState('');
    const [paginationText] = useState('1-3');
    const [showProducts, setShowProducts] = useState(true);
    const [showCategories, setShowCategories] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orders, setOrders] = useState(initialOrders);

    const displayedProducts = useMemo(() => {
        if (!selectedCategory) return menuCatalog;
        return menuCatalog.filter(item => item.category === selectedCategory);
    }, [selectedCategory]);

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedProduct(null);
    };

    const toggleItemStrike = (orderId, itemIndex) => {
        setOrders(currentOrders =>
            currentOrders.map(order => {
                if (order.id !== orderId) return order;

                return {
                    ...order,
                    items: order.items.map((item, index) =>
                        index === itemIndex ? { ...item, done: !item.done } : item
                    )
                };
            })
        );
    };

    const itemMatchesTab = (item, tab) => {
        if (tab === 'To Cook' || tab === 'Preparing') return !item.done;
        if (tab === 'Completed') return item.done;
        return true;
    };

    const itemMatchesSidebarFilters = (item) => {
        if (selectedProduct && item.name !== selectedProduct) return false;

        if (selectedCategory) {
            const catalogItem = menuCatalog.find(product => product.name === item.name);
            if (!catalogItem || catalogItem.category !== selectedCategory) return false;
        }

        return true;
    };

    const itemMatchesSearch = (item, orderId) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;

        return item.name.toLowerCase().includes(query) || orderId.toLowerCase().includes(query);
    };

    const getTabCount = (tab) => {
        return orders.reduce((count, order) => {
            return count + order.items.filter(item => itemMatchesTab(item, tab)).length;
        }, 0);
    };

    const visibleOrders = orders
        .map(order => ({
            ...order,
            visibleItems: order.items
                .map((item, index) => ({ ...item, originalIndex: index }))
                .filter(item => itemMatchesTab(item, activeTab))
                .filter(itemMatchesSidebarFilters)
                .filter(item => itemMatchesSearch(item, order.id))
        }))
        .filter(order => order.visibleItems.length > 0);

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans flex flex-col">
            <div className="flex items-center gap-5 border-b border-neutral-700 px-6 py-4 bg-neutral-900 z-10">
                <div className="flex items-center gap-5 min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-white hover:text-orange-400 focus:outline-none p-1 rounded transition active:scale-95 cursor-pointer shrink-0"
                        aria-label="Toggle filters"
                    >
                        <div className="space-y-1.5 w-6">
                            <span className="block h-0.5 bg-current rounded"></span>
                            <span className="block h-0.5 bg-current rounded"></span>
                            <span className="block h-0.5 bg-current rounded"></span>
                        </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                        {tabs.map((tab, index) => (
                            <React.Fragment key={tab}>
                                {index > 0 && <span className="text-neutral-600 font-semibold">|</span>}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer flex items-center gap-2 ${
                                        activeTab === tab
                                            ? 'bg-red-950/70 text-orange-100 border border-red-900'
                                            : 'text-neutral-200 hover:bg-neutral-800'
                                    }`}
                                >
                                    <span>{tab}</span>
                                    <span
                                        className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                                            activeTab === tab
                                                ? 'bg-red-900/80 text-orange-100'
                                                : 'bg-neutral-800 text-neutral-300'
                                        }`}
                                    >
                                        {getTabCount(tab)}
                                    </span>
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="relative w-full max-w-sm min-w-48">
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search....."
                            className="w-full rounded-full bg-neutral-800 border border-neutral-700 py-2 pl-4 pr-11 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-orange-700"
                        />
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="7"></circle>
                            <path d="m16 16 4 4"></path>
                        </svg>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-3 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 shrink-0">
                    <span className="text-sm font-semibold text-neutral-200">{paginationText}</span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className="h-6 w-6 rounded bg-neutral-900 text-neutral-300 hover:text-white hover:bg-red-950/70 transition"
                            aria-label="Previous page"
                        >
                            &lt;
                        </button>
                        <button
                            type="button"
                            className="h-6 w-6 rounded bg-neutral-900 text-neutral-300 hover:text-white hover:bg-red-950/70 transition"
                            aria-label="Next page"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {isSidebarOpen && (
                    <div className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0 overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-900">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-orange-700/90 font-semibold text-lg tracking-wide cursor-pointer hover:text-orange-600 select-none"
                            >
                                Clear Filter
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="text-orange-700/90 font-bold hover:text-orange-600 text-lg px-2 cursor-pointer"
                                aria-label="Close filters"
                            >
                                x
                            </button>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setShowProducts(!showProducts)}
                                className="w-full bg-amber-800/40 px-4 py-2 text-amber-200 font-bold text-sm tracking-wide flex justify-between items-center cursor-pointer select-none hover:bg-amber-800/50"
                            >
                                <span>Product</span>
                                <span className="text-xs">{showProducts ? 'Up' : 'Down'}</span>
                            </button>

                            {showProducts && (
                                <div className="flex flex-col font-medium">
                                    {displayedProducts.map(item => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => setSelectedProduct(selectedProduct === item.name ? null : item.name)}
                                            className={`px-4 py-2.5 text-left text-sm transition cursor-pointer border-l-2 ${
                                                selectedProduct === item.name
                                                    ? 'bg-red-950/40 text-red-300 border-red-700 font-bold'
                                                    : 'text-neutral-300 border-transparent hover:bg-neutral-900'
                                            }`}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => setShowCategories(!showCategories)}
                                className="w-full bg-amber-800/40 px-4 py-2 text-amber-200 font-bold text-sm tracking-wide flex justify-between items-center cursor-pointer select-none hover:bg-amber-800/50"
                            >
                                <span>Category</span>
                                <span className="text-xs">{showCategories ? 'Up' : 'Down'}</span>
                            </button>

                            {showCategories && (
                                <div className="flex flex-col font-medium">
                                    {categoriesList.map(category => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(selectedCategory === category ? null : category);
                                                setSelectedProduct(null);
                                            }}
                                            className={`px-4 py-2.5 text-left text-sm transition cursor-pointer border-l-2 ${
                                                selectedCategory === category
                                                    ? 'bg-red-950/40 text-red-300 border-red-700 font-bold'
                                                    : 'text-neutral-300 border-transparent hover:bg-neutral-900'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleOrders.map(order => (
                            <div
                                key={order.id}
                                className="bg-neutral-800 rounded-lg p-5 border border-neutral-700 shadow-xl h-fit"
                            >
                                <h2 className="text-xl font-bold border-b border-neutral-700 pb-2 mb-4 text-orange-400">
                                    {order.id}
                                </h2>
                                <ul className="space-y-3">
                                    {order.visibleItems.map(item => (
                                        <li
                                            key={`${order.id}-${item.originalIndex}`}
                                            onClick={() => toggleItemStrike(order.id, item.originalIndex)}
                                            className={`text-lg cursor-pointer transition select-none ${
                                                item.done
                                                    ? 'line-through text-neutral-500'
                                                    : 'text-neutral-200 hover:text-orange-300'
                                            }`}
                                        >
                                            {item.qty} x {item.name}
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
