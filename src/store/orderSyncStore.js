import { create } from 'zustand';

// Create a secure broadcast channel for cross-tab communication
const channel = new BroadcastChannel('odoo-cafe-order-sync');

export const useOrderSyncStore = create((set) => {
  // Listen for real-time updates from other tabs
  channel.onmessage = (event) => {
    if (event.data && event.data.type === 'SYNC_STATE') {
      set({ orders: event.data.orders });
    }
  };

  const syncToOtherTabs = (newOrders) => {
    channel.postMessage({ type: 'SYNC_STATE', orders: newOrders });
  };

  return {
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

    addOrder: (order) => set((state) => {
      const newOrders = [...state.orders, order];
      syncToOtherTabs(newOrders);
      return { orders: newOrders };
    }),

    dispatchOrderToKds: (orderId) => set((state) => {
      const newOrders = state.orders.map(o => o.id === orderId ? { ...o, status: 'sent' } : o);
      syncToOtherTabs(newOrders);
      return { orders: newOrders };
    }),

    transitionKdsStatus: (orderId) => set((state) => {
      const newOrders = state.orders.map((order) => {
        if (order.id !== orderId) return order;
        let nextStatus = order.status;
        if (order.status === 'sent') nextStatus = 'Preparing';
        else if (order.status === 'Preparing') nextStatus = 'Completed';
        return { ...order, status: nextStatus };
      });
      syncToOtherTabs(newOrders);
      return { orders: newOrders };
    }),

    toggleItemStrike: (orderId, productId) => set((state) => {
      const newOrders = state.orders.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: order.items.map((item) =>
            item.product_id === productId ? { ...item, completed: !item.completed } : item
          ),
        };
      });
      syncToOtherTabs(newOrders);
      return { orders: newOrders };
    }),
  };
});
