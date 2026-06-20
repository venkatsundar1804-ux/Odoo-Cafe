import { create } from 'zustand';
import { customerService } from '../services/customerService';

export const useCustomerStore = create((set) => ({
  customers: [],
  activeCustomerId: null,
  isLoading: false,

  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const customers = await customerService.getCustomers();
      set({ customers, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      set({ isLoading: false });
    }
  },

  addCustomer: async (customerData) => {
    try {
      const newCustomer = await customerService.createCustomer(customerData);
      set((state) => ({ customers: [...state.customers, newCustomer] }));
      return newCustomer;
    } catch (error) {
      console.error('Failed to add customer:', error);
      throw error;
    }
  },

  setActiveCustomer: (customerId) => {
    set({ activeCustomerId: customerId });
  }
}));
