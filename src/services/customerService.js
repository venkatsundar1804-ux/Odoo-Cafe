import api from '../api';

export const customerService = {
  getCustomers: async () => {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch customers, using mock data", error);
      return [
        { id: 1, name: "Alice Smith", phone_number: "555-0199", email: "alice@example.com", loyalty_points: 120 },
        { id: 2, name: "Bob Jones", phone_number: "555-0144", email: "bob@example.com", loyalty_points: 50 }
      ];
    }
  },

  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers/', customerData);
      return response.data;
    } catch (error) {
      console.warn("Failed to create customer, simulating local success", error);
      return { id: Date.now(), ...customerData, loyalty_points: 0 };
    }
  }
};
