import { create } from 'zustand';
import axios from 'axios';
import { mockCategories } from '../data/dataProvider';

export const useAdminStore = create((set) => ({
  categories: mockCategories,
  products: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('http://localhost:8000/api/categories');
      set({ categories: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories, using fallback mock data:', error);
      set({ categories: mockCategories, isLoading: false });
    }
  },
}));
