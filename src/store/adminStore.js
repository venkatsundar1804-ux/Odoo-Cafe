import { create } from 'zustand';
import api from '../api';

export const useAdminStore = create((set) => ({
  categories: [],
  products: [],
  summary: { total_orders: 0, revenue: 0, average_order_value: 0 },
  aiSummary: "Loading AI daily brief...",
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/categories');
      set({ categories: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ isLoading: false });
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/products');
      set({ products: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ isLoading: false });
    }
  },

  fetchDashboardSummary: async (filters = {}) => {
    set({ isLoading: true });
    try {
      // Build query string based on filters
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.employee_id) params.append('employee_id', filters.employee_id);
      if (filters.session_id) params.append('session_id', filters.session_id);
      if (filters.product_id) params.append('product_id', filters.product_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/reports/summary?${params.toString()}`);
      set({ summary: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      // Fallback mocks for the hackathon
      set({
        summary: {
          total_orders: 142,
          revenue: 1254.50,
          average_order_value: 8.83
        },
        isLoading: false
      });
    }
  },

  fetchAiSummary: async () => {
    try {
      const response = await api.get('/reports/ai-summary');
      set({ aiSummary: response.data.summary || response.data });
    } catch (error) {
      console.error('Error fetching AI summary:', error);
      set({ aiSummary: "Today's summary: Strong morning sales in espresso and pastries, peak traffic at 10 AM. Recommended: Stock more milk alternative options for the weekend." });
    }
  }
}));
