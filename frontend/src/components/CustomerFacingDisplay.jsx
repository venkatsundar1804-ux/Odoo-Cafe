import React from 'react';

export default function CustomerFacingDisplay() {
    return (
        <div className="min-h-screen bg-zinc-900 text-white flex font-sans">
            {/* Left Content Column */}
            <div className="w-1/3 bg-zinc-950 p-8 flex flex-col justify-between border-r border-zinc-800">
                <div>
                    <div className="bg-orange-600 text-white font-bold px-4 py-2 rounded inline-block mb-8">Logo</div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Welcome to Odoo Cafe</h1>
                    <p className="text-zinc-400 text-lg">Your fresh dynamic cart updates appear right here in real-time as items are added by the cashier.</p>
                </div>
                <div className="text-zinc-600 text-sm font-medium">Powered by Odoo</div>
            </div>

            {/* Right Cart Summary View */}
            <div className="w-2/3 p-12 flex flex-col justify-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-zinc-400 border-b border-zinc-800 pb-3">Current Cart</h2>
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-xl font-medium"><span className="text-zinc-300">1 × Burger</span><span>₹15</span></div>
                    <div className="flex justify-between text-xl font-medium"><span className="text-zinc-300">2 × Pizza</span><span>₹15</span></div>
                    <div className="flex justify-between text-xl font-medium"><span className="text-zinc-300">2 × Coffee</span><span>₹15</span></div>
                </div>
                <div className="border-t border-zinc-800 pt-4 space-y-2 text-zinc-400">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₹520</span></div>
                    <div className="flex justify-between"><span>Tax:</span><span>₹40</span></div>
                    <div className="flex justify-between text-red-400"><span>Discount (30%):</span><span>- ₹50</span></div>
                    <div className="flex justify-between text-2xl font-black text-white pt-2 border-t border-zinc-800">
                        <span>Total:</span><span className="text-orange-500">₹510</span>
                    </div>
                </div>
            </div>
        </div>
    );
}