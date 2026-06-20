import { create } from 'zustand';

export const useKdsStore = create((set) => ({
  activeOrders: [],

  // Load initial orders (e.g. from backend database)
  setOrders: (orders) => set({ activeOrders: orders }),

  // Add a newly received real-time order
  addOrder: (order) => set((state) => {
    // Avoid duplicates if order is already present
    if (state.activeOrders.some((o) => o.id === order.id)) {
      return state;
    }
    return { activeOrders: [...state.activeOrders, order] };
  }),

  // Transition order to the next stage: 'To Cook' -> 'Preparing' -> 'Completed'
  transitionOrder: (orderId) => set((state) => ({
    activeOrders: state.activeOrders.map((order) => {
      if (order.id !== orderId) return order;
      
      let nextStatus = order.status;
      if (order.status === 'To Cook') nextStatus = 'Preparing';
      else if (order.status === 'Preparing') nextStatus = 'Completed';
      
      return { ...order, status: nextStatus };
    }),
  })),

  // Toggle item-level completion (strikethrough)
  toggleItemStrike: (orderId, productId) => set((state) => ({
    activeOrders: state.activeOrders.map((order) => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        items: order.items.map((item) =>
          item.product_id === productId ? { ...item, completed: !item.completed } : item
        ),
      };
    }),
  })),
}));
