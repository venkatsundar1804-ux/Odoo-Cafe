import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const tableChannel = new BroadcastChannel('odoo-cafe-table-sync');

// Initial mock tables
const initialTables = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  number: `T-${String(i + 1).padStart(2, '0')}`,
  seats: i % 3 === 0 ? 4 : 2,
  status: 'available', // 'available' or 'occupied'
  occupiedBy: null, // Track which user took this table
}));

export const useTableStore = create(
  persist(
    (set, get) => {
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

        fetchTables: async () => {},

        setTableId: (id, userName = null) => set((state) => {
          const newTables = state.tables.map(t => 
            t.id === id ? { ...t, status: 'occupied', occupiedBy: userName } : t
          );
          syncTables(newTables);
          return { currentTableId: id, tables: newTables };
        }),

        freeTable: (id) => set((state) => {
          const newTables = state.tables.map(t => 
            t.id === id ? { ...t, status: 'available', occupiedBy: null } : t
          );
          syncTables(newTables);
          return { tables: newTables };
        })
      };
    },
    {
      name: 'odoo-cafe-table-sync-storage',
    }
  )
);
