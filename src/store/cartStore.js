import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cart: [],
  customer: null,
  coupon: null,
  
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= 10) return state;
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    // Set default tax_percentage if not present
    const prodWithTax = { ...product, tax_percentage: product.tax_percentage ?? 0.0 };
    return { cart: [...state.cart, { ...prodWithTax, quantity: 1 }] };
  }),
  
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
      .filter((item) => item.quantity > 0),
  })),
  
  clearCart: () => set({ cart: [], customer: null, coupon: null }),
  
  setCustomer: (customer) => set({ customer }),
  setCoupon: (coupon) => set({ coupon }),
  
  getTotals: () => {
    const { cart, coupon } = get();
    
    // 1. Subtotal
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // 2. Tax calculated per-product tax percentage
    const tax = cart.reduce((acc, item) => {
      const rate = item.tax_percentage ?? 0.0;
      return acc + (item.price * item.quantity * (rate / 100.0));
    }, 0);
    
    // 3. Discount calculation
    let discountAmount = 0.0;
    if (coupon && coupon.is_active) {
      let applicableSubtotal = subtotal;
      
      if (coupon.product_id) {
        applicableSubtotal = cart
          .filter(item => item.id === coupon.product_id)
          .reduce((acc, item) => acc + (item.price * item.quantity), 0);
      }
      
      if (coupon.discount_type === 'percentage') {
        discountAmount = applicableSubtotal * (coupon.value / 100.0);
      } else if (coupon.discount_type === 'fixed') {
        discountAmount = Math.min(coupon.value, applicableSubtotal);
      }
      discountAmount = Math.min(discountAmount, subtotal);
    }
    
    const total = (subtotal + tax) - discountAmount;
    
    return { 
      subtotal, 
      tax, 
      discountAmount, 
      total 
    };
  },
}));
