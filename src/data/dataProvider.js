import categoriesData from './categories.json';
import itemsData from './items.json';

// Export categories directly from the JSON
export const mockCategories = categoriesData;

// Transform the nested items JSON into a flat array of products for the POS UI
export const mockProducts = [];
let productIdCounter = 1;

itemsData.forEach(categoryGroup => {
  if (categoryGroup.itemTypes && Array.isArray(categoryGroup.itemTypes)) {
    categoryGroup.itemTypes.forEach(itemName => {
      mockProducts.push({
        id: productIdCounter++,
        name: itemName,
        // The JSON doesn't contain prices, so we assign a consistent dummy price
        price: 80 + (itemName.length * 5), 
        categoryId: categoryGroup.categoryId
      });
    });
  }
});
