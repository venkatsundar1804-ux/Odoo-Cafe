import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      role: null, // 'customer' | 'employee' | 'admin' | null
      user: null, // { id: number, name: string, email: string }
      token: null, // JWT token
      sessionId: null, // Track the current POS session ID
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);
          
          const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
          
          const { access_token, role } = response.data;
          
          set({
            token: access_token,
            user: { email, role }, // The backend doesn't return full user object in token response, so we store what we know
            role: role,
            isLoading: false
          });

          return role;
        } catch (err) {
          set({ 
            error: err.response?.data?.detail || 'Login failed. Please check your credentials.', 
            isLoading: false 
          });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Send name as username since backend expects username
          const response = await api.post('/auth/signup', { 
            username: email, // Use email as username for login purposes
            password: password,
            role: 'customer' // Default role for new signups
          });
          
          set({ isLoading: false });
          // Auto login after register
          return get().login(email, password);
        } catch (err) {
          set({ 
            error: err.response?.data?.detail || 'Registration failed.', 
            isLoading: false 
          });
          throw err;
        }
      },

      logout: () => {
        set({ role: null, user: null, token: null, sessionId: null, error: null });
      },

      openSession: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const response = await api.post('/sessions/open', { employee_id: user.id });
          set({ sessionId: response.data.id });
        } catch (err) {
          console.error("Failed to open session:", err);
        }
      },

      closeSession: async (closingAmount = 0) => {
        const { sessionId } = get();
        if (!sessionId) return;

        try {
          await api.post(`/sessions/${sessionId}/close`, { closing_amount: closingAmount });
          set({ sessionId: null });
        } catch (err) {
          console.error("Failed to close session:", err);
        }
      }
    }),
    {
      name: 'odoo-cafe-auth-storage',
      // Only persist these specific fields to avoid keeping stale errors or loading states
      partialize: (state) => ({ 
        role: state.role, 
        user: state.user, 
        token: state.token, 
        sessionId: state.sessionId 
      })
    }
  )
);
