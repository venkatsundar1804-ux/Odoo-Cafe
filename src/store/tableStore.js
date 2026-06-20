import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

const tableChannel = new BroadcastChannel('odoo-cafe-table-sync');

export const useTableStore = create(
  persist(
    (set, get) => {
      // Listen for instantaneous broadcasts from other tabs
      tableChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_TABLES') {
          set({ tables: event.data.tables });
        }
      };

      const syncTablesLocal = (newTables) => {
        tableChannel.postMessage({ type: 'SYNC_TABLES', tables: newTables });
        set({ tables: newTables });
      };

      return {
        tables: [],
        currentTableId: null,
        isLoading: false,
        error: null,

        fetchTables: async () => {
          set({ isLoading: true });
          try {
            const response = await api.get('/tables');
            set({ tables: response.data, isLoading: false });
          } catch (err) {
            console.error("Failed to fetch tables:", err);
            set({ error: err.message, isLoading: false });
          }
        },

        setTableId: async (id, userName = null) => {
          // 1. Optimistic UI Update (Instant)
          const currentTables = get().tables;
          const newTables = currentTables.map(t => 
            t.id === id ? { ...t, status: 'occupied', occupied_by: userName } : t
          );
          syncTablesLocal(newTables);
          set({ currentTableId: id });

          // 2. Database Update (Background)
          try {
            await api.patch(`/tables/${id}`, { status: 'occupied', occupied_by: userName });
          } catch (err) {
            console.error("Failed to update table in DB:", err);
            // Revert on failure
            syncTablesLocal(currentTables);
            set({ currentTableId: null });
          }
        },

        freeTable: async (id) => {
          // 1. Optimistic UI Update (Instant)
          const currentTables = get().tables;
          const newTables = currentTables.map(t => 
            t.id === id ? { ...t, status: 'available', occupied_by: null } : t
          );
          syncTablesLocal(newTables);

          // 2. Database Update (Background)
          try {
            await api.patch(`/tables/${id}`, { status: 'available', occupied_by: null });
          } catch (err) {
            console.error("Failed to free table in DB:", err);
            // Revert on failure
            syncTablesLocal(currentTables);
          }
        }
      };
    },
    {
      name: 'odoo-cafe-table-sync-storage',
      partialize: (state) => ({ tables: state.tables, currentTableId: state.currentTableId })
    }
  )
);
