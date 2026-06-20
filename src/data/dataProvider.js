import categoriesData from './categories.json';
import itemsData from './items.json';
import api from '../api';

// ── Static fallbacks (used as defaults before API data loads) ──────
let productIdCounter = 1;

export const mockCategories = categoriesData;

export const mockProducts = itemsData.flatMap(categoryGroup => {
  if (categoryGroup.itemTypes && Array.isArray(categoryGroup.itemTypes)) {
    return categoryGroup.itemTypes.map(itemName => ({
      id: productIdCounter++,
      name: itemName,
      price: 80 + (itemName.length * 5),
      categoryId: categoryGroup.categoryId
    }));
  }
  return [];
});

// ── Live API fetchers ──────────────────────────────────────────────

export async function fetchProductsFromDB() {
  try {
    const response = await api.get('/products');
    return response.data.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      categoryId: p.category_id,
      category_id: p.category_id,
      category: { name: p.category_name },
      tax_percentage: p.tax_percentage || 0,
      description: p.description
    }));
  } catch (error) {
    console.warn("Failed to fetch products from DB, using local fallback", error);
    return mockProducts;
  }
}

export async function fetchCategoriesFromDB() {
  try {
    const response = await api.get('/categories');
    return response.data.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color
    }));
  } catch (error) {
    console.warn("Failed to fetch categories from DB, using local fallback", error);
    return mockCategories;
  }
}

export async function fetchTransactionsFromDB() {
  try {
    const response = await api.get('/transactions');
    return response.data.map(t => ({
      id: `TRX-${t.id}`,
      order_id: t.order_id,
      customer: t.customer_name || 'Guest User',
      amount: t.amount,
      status: t.status,
      payment_method: t.payment_method,
      date: t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    }));
  } catch (error) {
    console.warn("Failed to fetch transactions from DB", error);
    return [];
  }
}

export async function fetchLiveStats() {
  try {
    const response = await api.get('/reports/live-stats');
    return response.data;
  } catch (error) {
    console.warn("Failed to fetch live stats", error);
    return null;
  }
}
