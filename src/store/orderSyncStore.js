import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a secure broadcast channel for cross-tab communication
const channel = new BroadcastChannel('odoo-cafe-order-sync');

export const useOrderSyncStore = create(
  persist(
    (set) => {
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
        orders: [],

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

        markDelivered: (orderId) => set((state) => {
          const newOrders = state.orders.map(o => o.id === orderId ? { ...o, status: 'Delivered' } : o);
          syncToOtherTabs(newOrders);
          return { orders: newOrders };
        }),
      };
    },
    {
      name: 'odoo-cafe-order-sync-storage',
    }
  )
);
