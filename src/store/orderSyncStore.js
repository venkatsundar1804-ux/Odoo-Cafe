import { create } from 'zustand';

export const useOrderSyncStore = create((set) => ({
  orders: [
    { 
      id: 'ORD-2099', 
      table: 'T-12', 
      items: [
        { product_id: 1, name: '2x Espresso', quantity: 2, completed: false }, 
        { product_id: 2, name: '1x Croissant', quantity: 1, completed: false }
      ], 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
      status: 'pending', 
      paymentMethod: 'cash' 
    },
    { 
      id: 'ORD-2101', 
      table: 'Takeaway', 
      items: [
        { product_id: 3, name: '3x Cappuccino', quantity: 3, completed: false }
      ], 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
      status: 'sent', 
      paymentMethod: 'qr' 
    }
  ],

  // Add a new order from Checkout
  addOrder: (order) => set((state) => ({
    orders: [...state.orders, order]
  })),

  // Employee confirms cash and sends to KDS
  dispatchOrderToKds: (orderId) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'sent' } : o)
  })),

  // KDS transitions order from To Cook -> Preparing -> Completed
  transitionKdsStatus: (orderId) => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.id !== orderId) return order;
      let nextStatus = order.status;
      if (order.status === 'sent') nextStatus = 'Preparing';
      else if (order.status === 'Preparing') nextStatus = 'Completed';
      return { ...order, status: nextStatus };
    })
  })),

  // KDS checks off individual items
  toggleItemStrike: (orderId, productId) => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        items: order.items.map((item) =>
          item.product_id === productId ? { ...item, completed: !item.completed } : item
        ),
      };
    })
  })),
}));
