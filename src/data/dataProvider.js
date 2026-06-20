import categoriesData from './categories.json';
import itemsData from './items.json';

// Export categories directly from the JSON
export const mockCategories = categoriesData;

// Transform the nested items JSON into a flat array of products for the POS UI
let productIdCounter = 1;

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
