import { create } from 'zustand';

export const useCfdStore = create((set) => ({
  displayMode: 'order', // 'order' | 'payment' | 'success'
  orderData: {
    items: [],
    subtotal: 0,
    tax: 0,
    discountAmount: 0,
    total: 0,
    couponCode: null,
    customerName: null,
  },

  setCFDState: (mode, data) => set({
    displayMode: mode,
    orderData: {
      items: data.items || [],
      subtotal: data.subtotal || 0,
      tax: data.tax || 0,
      discountAmount: data.discount || 0,
      total: data.total || 0,
      couponCode: data.coupon_code || null,
      customerName: data.customer_name || null,
    }
  }),

  resetCFD: () => set({
    displayMode: 'order',
    orderData: {
      items: [],
      subtotal: 0,
      tax: 0,
      discountAmount: 0,
      total: 0,
      couponCode: null,
      customerName: null,
    }
  })
}));
