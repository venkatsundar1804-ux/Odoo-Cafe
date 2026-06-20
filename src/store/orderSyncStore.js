import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

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

        fetchOrders: async () => {
          try {
            const res = await api.get('/orders');
            const mappedOrders = res.data.map(o => ({
              id: o.id,
              table: `T-${o.table_id}`,
              total: o.total_amount,
              status: o.status,
              time: o.created_at || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              paymentMethod: o.status === 'pending' ? 'cash' : 'card',
              items: o.items ? o.items.map(i => ({
                product_id: i.product_id,
                name: i.product_name || `Item ${i.product_id}`,
                quantity: i.quantity,
                completed: false
              })) : []
            }));
            
            set((state) => {
              // Merge fetched orders with existing to preserve local UI states like completed items if needed
              const existingIds = state.orders.map(o => o.id);
              const newOrders = mappedOrders.filter(o => !existingIds.includes(o.id));
              const merged = [...state.orders, ...newOrders];
              syncToOtherTabs(merged);
              return { orders: merged };
            });
          } catch (error) {
            console.error("Failed to fetch initial orders:", error);
          }
        },

        addOrder: (order) => set((state) => {
          const existingIndex = state.orders.findIndex(o => o.id === order.id);
          let newOrders;
          if (existingIndex >= 0) {
            newOrders = [...state.orders];
            newOrders[existingIndex] = { ...newOrders[existingIndex], ...order };
          } else {
            newOrders = [...state.orders, order];
          }
          syncToOtherTabs(newOrders);
          return { orders: newOrders };
        }),

        dispatchOrderToKds: async (orderId) => {
          set((state) => {
            const newOrders = state.orders.map(o => o.id === orderId ? { ...o, status: 'sent' } : o);
            syncToOtherTabs(newOrders);
            return { orders: newOrders };
          });
          try {
            await api.put(`/orders/${orderId}/status`, { status: 'sent' });
          } catch (error) {
            console.error('Failed to update order status in backend:', error);
          }
        },

        transitionKdsStatus: async (orderId) => {
          let nextStatus = '';
          set((state) => {
            const newOrders = state.orders.map((order) => {
              if (order.id !== orderId) return order;
              nextStatus = order.status;
              if (order.status === 'sent' || order.status === 'To Cook') nextStatus = 'Preparing';
              else if (order.status === 'Preparing') nextStatus = 'Completed';
              return { ...order, status: nextStatus };
            });
            syncToOtherTabs(newOrders);
            return { orders: newOrders };
          });
          if (nextStatus) {
            try {
              await api.put(`/orders/${orderId}/status`, { status: nextStatus });
            } catch (error) {
              console.error('Failed to update order status in backend:', error);
            }
          }
        },

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

        markDelivered: async (orderId) => {
          try {
            await api.put(`/orders/${orderId}/status`, { status: 'Delivered' });
          } catch (error) {
            console.error('Failed to update order status in backend:', error);
          }
          set((state) => {
            const newOrders = state.orders.map(o => o.id === orderId ? { ...o, status: 'Delivered' } : o);
            syncToOtherTabs(newOrders);
            channel.postMessage({ type: 'ORDER_DELIVERED', orderId });
            return { orders: newOrders };
          });
        },
      };
    },
    {
      name: 'odoo-cafe-order-sync-storage',
    }
  )
);
