import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    // Mock login logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          set({
            user: { name: "Demo User", email: credentials.email },
            isAuthenticated: true,
          });
          resolve();
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800); // simulate network delay
    });
  },

  register: async (userData) => {
    // Mock registration logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password && userData.name) {
          set({
            user: { name: userData.name, email: userData.email },
            isAuthenticated: true,
          });
          resolve();
        } else {
          reject(new Error("Unable to create account"));
        }
      }, 800);
    });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
