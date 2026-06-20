import { create } from 'zustand';

let ws;

export const usePromoStore = create((set, get) => {
  const connectWebSocket = () => {
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;

    ws = new WebSocket('ws://127.0.0.1:8000/ws/coupons');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'COUPON_ADDED' || data.event === 'COUPON_DELETED') {
          get().fetchPromos();
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, 3000);
    };
  };

  // Initiate connection
  connectWebSocket();

  return {
    promos: [],
    isLoading: false,

    fetchPromos: async () => {
      set({ isLoading: true });
      try {
        const response = await fetch('http://127.0.0.1:8000/api/coupons');
        if (response.ok) {
          const data = await response.json();
          set({ promos: data, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (err) {
        console.error("Failed to fetch promos", err);
        set({ isLoading: false });
      }
    },

    addPromo: async (couponData) => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponData),
        });
        if (!response.ok) {
          console.error("Failed to add promo");
        }
      } catch (err) {
        console.error("Failed to add promo", err);
      }
    },

    removePromo: async (id) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/coupons/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          console.error("Failed to remove promo");
        }
      } catch (err) {
        console.error("Failed to remove promo", err);
      }
    }
  };
});
