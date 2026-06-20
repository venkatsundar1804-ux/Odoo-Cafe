import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const promoChannel = new BroadcastChannel('odoo-cafe-promo-sync');

export const usePromoStore = create(
  persist(
    (set, get) => {
      promoChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_PROMOS') {
          set({ promos: event.data.promos });
        }
      };

      const syncPromos = (newPromos) => {
        promoChannel.postMessage({ type: 'SYNC_PROMOS', promos: newPromos });
      };

      return {
        promos: [
          { code: 'CAFE10', discountPercent: 10, description: '10% off your entire order' },
          { code: 'WELCOME20', discountPercent: 20, description: '20% off for new customers' },
          { code: 'STUDENT15', discountPercent: 15, description: '15% student discount' },
          { code: 'FESTIVE25', discountPercent: 25, description: '25% off festive special' },
          { code: 'EARLYBIRD', discountPercent: 5, description: '5% off early morning orders' },
          { code: 'VIP50', discountPercent: 50, description: '50% off VIP orders' }
        ],

        addPromo: (code, discountPercent, description) => set((state) => {
          const newPromos = [...state.promos, { code: code.toUpperCase(), discountPercent: Number(discountPercent), description }];
          syncPromos(newPromos);
          return { promos: newPromos };
        }),

        removePromo: (code) => set((state) => {
          const newPromos = state.promos.filter(p => p.code !== code);
          syncPromos(newPromos);
          return { promos: newPromos };
        })
      };
    },
    {
      name: 'odoo-cafe-promo-sync-storage',
    }
  )
);
