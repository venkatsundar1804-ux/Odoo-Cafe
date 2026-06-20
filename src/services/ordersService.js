import api from '../api';

export const ordersService = {
  // Submit new order to the kitchen/database
  createOrder: async (orderPayload) => {
    const response = await api.post('/orders/', orderPayload);
    return response.data;
  },

  // Fetch all customers for loyalty association
  getCustomers: async () => {
    // Falls back to a mock list if endpoint is not implemented on backend
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch customers, using mock data", error);
      return [
        { id: 1, name: "Alice Smith", phone_number: "555-0199", email: "alice@example.com" },
        { id: 2, name: "Bob Jones", phone_number: "555-0144", email: "bob@example.com" }
      ];
    }
  },

  // Verify and fetch coupon details
  getCoupons: async () => {
    try {
      const response = await api.get('/coupons');
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch coupons, using mock data", error);
      return [
        { id: 1, code: "WELCOME10", discount_type: "percentage", value: 10, is_active: true },
        { id: 2, code: "CAFE50", discount_type: "fixed", value: 5, is_active: true }
      ];
    }
  }
};
