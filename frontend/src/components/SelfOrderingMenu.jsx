import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SelfOrderingMenu() {
    const { token } = useParams();
    const [cartCount, setCartCount] = useState(0);

    return (
        <div className="min-h-screen bg-stone-900 text-stone-100 max-w-md mx-auto flex flex-col justify-between font-sans shadow-2xl relative border-x border-stone-800">
            {/* Top App Header bar */}
            <div className="bg-stone-950 p-4 flex justify-between items-center sticky top-0 z-50 border-b border-stone-800">
                <span className="bg-orange-600 px-3 py-1 rounded text-xs font-bold">Logo</span>
                <span className="text-xs bg-stone-800 text-stone-400 px-3 py-1 rounded-full font-mono font-bold">Table: {token || 'Default'}</span>
            </div>

            {/* Main Container Wrapper */}
            <div className="p-6 flex-grow flex flex-col justify-center items-center text-center">
                <div className="w-24 h-24 bg-orange-600/10 text-orange-500 rounded-full flex items-center justify-center mb-6 border border-orange-500/20">
                    ☕
                </div>
                <h2 className="text-3xl font-black mb-2 tracking-tight">Odoo Smart Menu</h2>
                <p className="text-stone-400 text-sm max-w-xs mb-8">Scan, explore our gourmet options, custom build your order items, and checkout right from your phone.</p>

                <button
                    onClick={() => setCartCount(prev => prev + 1)}
                    className="bg-orange-600 hover:bg-orange-700 active:scale-95 transition text-white px-8 py-3 rounded-xl font-bold w-full max-w-xs shadow-lg shadow-orange-950/20"
                >
                    Add Quick Burger (₹15)
                </button>
            </div>

            {/* Persistent Bottom Call to Action Drawer */}
            <div className="bg-stone-950 p-4 border-t border-stone-800 sticky bottom-0">
                <div className="flex justify-between items-center mb-3 text-xs text-stone-400 px-1">
                    <span>Items in Basket:</span>
                    <span className="font-bold text-white bg-stone-800 px-2 py-0.5 rounded-full">{cartCount}</span>
                </div>
                <button className="bg-stone-800 hover:bg-stone-700 text-white w-full py-3 rounded-xl font-bold tracking-wide transition text-sm">
                    View Cart & Order
                </button>
            </div>
        </div>
    );
}