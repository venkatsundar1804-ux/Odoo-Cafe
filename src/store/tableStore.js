import { create } from 'zustand';
import api from '../api';

export const useTableStore = create((set) => ({
  currentTableId: null,
  tables: [],
  isLoading: false,

  setTableId: (tableId) => set({ currentTableId: tableId }),

  fetchTables: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/tables/');
      set({ tables: response.data, isLoading: false });
    } catch (error) {
      console.warn("Failed to fetch tables from backend, using fallback data", error);
      // Fallback data matching the tables seeded in seed.py
      set({
        tables: [
          { id: 1, number: 1, seats: 2, has_active_order: true },
          { id: 2, number: 2, seats: 2, has_active_order: false },
          { id: 3, number: 3, seats: 4, has_active_order: false },
          { id: 4, number: 4, seats: 4, has_active_order: true },
          { id: 5, number: 5, seats: 6, has_active_order: false },
        ],
        isLoading: false
      });
    }
  },
}));
