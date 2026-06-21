import { create } from 'zustand';
import api from '../api';

export const usePaymentStore = create((set, get) => ({
  methods: [],
  
  fetchMethods: async () => {
    try {
      const res = await api.get('/payment-methods');
      if (res.data.length === 0) {
        // Auto-seed default methods if empty
        const defaults = [
          { name: 'upi', is_active: true },
          { name: 'card', is_active: true },
          { name: 'netbanking', is_active: true }
        ];
        for (const method of defaults) {
          await api.post('/payment-methods', method);
        }
        const updatedRes = await api.get('/payment-methods');
        set({ methods: updatedRes.data });
      } else {
        set({ methods: res.data });
      }
    } catch (error) {
      console.error("Failed to fetch payment methods", error);
      // Fallback
      set({ methods: [
        { id: 1, name: 'upi', is_active: true },
        { id: 2, name: 'card', is_active: true },
        { id: 3, name: 'netbanking', is_active: true }
      ] });
    }
  },

  toggleMethod: async (id) => {
    try {
      await api.put(`/payment-methods/${id}/toggle`);
      // Update local state
      set(state => ({
        methods: state.methods.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m)
      }));
    } catch (error) {
      console.error("Failed to toggle payment method", error);
    }
  }
}));
