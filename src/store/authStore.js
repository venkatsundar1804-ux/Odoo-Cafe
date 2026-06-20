import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      role: null, // 'customer' | 'employee' | null
      user: null, // { name: string }
      login: (role) => {
        let user = null;
        if (role === 'customer') user = { name: 'Alex Johnson' };
        if (role === 'employee') user = { name: 'Sarah (Barista)' };
        set({ role, user });
      },
      logout: () => set({ role: null, user: null })
    }),
    {
      name: 'odoo-cafe-auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
