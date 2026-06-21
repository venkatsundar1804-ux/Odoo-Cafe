import { create } from 'zustand';
import api from '../api';

const adminChannel = new BroadcastChannel('odoo-cafe-admin-sync');

export const useAdminStore = create((set, get) => {
  adminChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'SYNC_ADMIN') {
      if (event.data.categories) set({ categories: event.data.categories });
      if (event.data.products) set({ products: event.data.products });
    }
  };

  const syncAdmin = (payload) => {
    adminChannel.postMessage({ type: 'SYNC_ADMIN', ...payload });
  };

  return {
    categories: [],
    products: [],
    isLoading: false,

    syncCategories: (newCategories) => {
      set({ categories: newCategories });
      syncAdmin({ categories: newCategories });
    },

    syncProducts: (newProducts) => {
      set({ products: newProducts });
      syncAdmin({ products: newProducts });
    },

    fetchCategories: async () => {
      set({ isLoading: true });
      try {
        const response = await api.get('/categories');
        set({ categories: response.data, isLoading: false });
        syncAdmin({ categories: response.data });
      } catch (error) {
        console.error('Error fetching categories:', error);
        set({ categories: [], isLoading: false });
      }
    },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/products');
      set({ products: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ products: [], isLoading: false });
    }
  },

  };
});
