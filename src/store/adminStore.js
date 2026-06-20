import { create } from 'zustand';
import axios from 'axios';

export const useAdminStore = create((set) => ({
  categories: [],
  products: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('http://localhost:8000/api/categories');
      set({ categories: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ isLoading: false });
    }
  },
}));
