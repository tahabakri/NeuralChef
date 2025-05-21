// utils/mockImageRecognition.ts

/**
 * Simulates ingredient recognition from an image.
 * @param imageUri - The URI of the image (unused in this mock).
 * @returns An array of mock detected ingredients.
 */
export const mockIngredientRecognition = (imageUri: string): string[] => {
  console.log(`Mock processing image: ${imageUri}`);
  // Simulate some processing and return a fixed list or randomly chosen ingredients
  const allPossibleIngredients = [
    'Tomatoes', 'Onions', 'Garlic', 'Chicken Breast', 'Pasta', 'Olive Oil',
    'Bell Peppers', 'Mushrooms', 'Spinach', 'Cheese', 'Eggs', 'Potatoes'
  ];
  
  // Return a random subset of 2-5 ingredients
  const count = Math.floor(Math.random() * 4) + 2; // 2 to 5 ingredients
  const shuffled = [...allPossibleIngredients].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
