import { create } from 'zustand';

const tableChannel = new BroadcastChannel('odoo-cafe-table-sync');

// Initial mock tables
const initialTables = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  number: `T-${String(i + 1).padStart(2, '0')}`,
  seats: i % 3 === 0 ? 4 : 2,
  status: 'available', // 'available' or 'occupied'
}));

export const useTableStore = create((set, get) => {
  tableChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'SYNC_TABLES') {
      set({ tables: event.data.tables });
    }
  };

  const syncTables = (newTables) => {
    tableChannel.postMessage({ type: 'SYNC_TABLES', tables: newTables });
  };

  return {
    tables: initialTables,
    currentTableId: null,
    isLoading: false,

    fetchTables: async () => {
      // In this demo, we rely entirely on the real-time synced state instead of fetching from the backend
      // to easily support multi-tab demoing.
    },

    setTableId: (id) => set((state) => {
      // Mark the selected table as occupied so it hides from other customers
      const newTables = state.tables.map(t => t.id === id ? { ...t, status: 'occupied' } : t);
      syncTables(newTables);
      return { currentTableId: id, tables: newTables };
    }),

    freeTable: (id) => set((state) => {
      // Mark as available again (e.g., after checkout)
      const newTables = state.tables.map(t => t.id === id ? { ...t, status: 'available' } : t);
      syncTables(newTables);
      return { tables: newTables };
    })
  };
});
