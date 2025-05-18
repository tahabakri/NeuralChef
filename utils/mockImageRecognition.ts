import { commonIngredients } from '@/constants/ingredients';

// Mock ingredients by category for more realistic grouping
const ingredientGroups = {
  vegetables: [
    'onion', 'garlic', 'tomato', 'potato', 'carrot', 'bell pepper',
    'broccoli', 'spinach', 'lettuce', 'cucumber', 'zucchini',
    'mushroom', 'corn', 'green beans', 'peas', 'cauliflower'
  ],
  fruits: [
    'apple', 'banana', 'orange', 'lemon', 'lime', 'strawberry',
    'blueberry', 'raspberry', 'blackberry', 'mango', 'pineapple',
    'avocado', 'grapes', 'watermelon', 'peach', 'pear'
  ],
  proteins: [
    'chicken', 'beef', 'pork', 'shrimp', 'salmon', 'tuna',
    'tofu', 'eggs', 'turkey', 'lamb', 'bacon', 'sausage'
  ],
  dairy: [
    'milk', 'cheese', 'butter', 'yogurt', 'cream', 'sour cream',
    'cream cheese', 'parmesan', 'cheddar', 'mozzarella', 'feta'
  ],
  grains: [
    'rice', 'pasta', 'noodles', 'bread', 'quinoa', 'couscous',
    'oats', 'flour', 'tortilla', 'pita'
  ],
  herbs: [
    'basil', 'oregano', 'thyme', 'rosemary', 'cilantro',
    'parsley', 'dill', 'mint', 'cumin', 'paprika'
  ]
};

/**
 * Mock functionality to detect ingredients from an image.
 * In a real implementation, this would call a vision API service.
 * 
 * @param imageUri - The URI of the captured image
 * @returns An array of detected ingredients
 */
export function mockIngredientRecognition(imageUri: string): string[] {
  // Generate a random seed based on the image URI
  // This ensures consistent results for the same image
  const seed = generateSeedFromString(imageUri);
  
  // Determine which category to pick from based on the seed
  const randomCategory = getRandomCategory(seed);
  
  // Pick 2-5 ingredients from the selected category
  const numIngredients = 2 + Math.floor(randomNumberFromSeed(seed, 0, 4));
  const detectedIngredients: string[] = [];
  
  // Add ingredients from the primary category
  const categoryIngredients = ingredientGroups[randomCategory as keyof typeof ingredientGroups];
  for (let i = 0; i < numIngredients; i++) {
    if (categoryIngredients.length > 0) {
      const index = Math.floor(randomNumberFromSeed(seed + i, 0, categoryIngredients.length));
      detectedIngredients.push(categoryIngredients[index]);
    }
  }
  
  // Sometimes add 1-2 ingredients from a different category for variety
  if (randomNumberFromSeed(seed, 0, 10) > 6) {
    const secondaryCategory = getSecondaryCategory(randomCategory, seed);
    const secondaryCategoryIngredients = ingredientGroups[secondaryCategory as keyof typeof ingredientGroups];
    
    const numSecondaryIngredients = 1 + Math.floor(randomNumberFromSeed(seed + 100, 0, 2));
    for (let i = 0; i < numSecondaryIngredients; i++) {
      if (secondaryCategoryIngredients.length > 0) {
        const index = Math.floor(randomNumberFromSeed(seed + 100 + i, 0, secondaryCategoryIngredients.length));
        detectedIngredients.push(secondaryCategoryIngredients[index]);
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(detectedIngredients)];
}

/**
 * Generate a numeric seed from a string
 */
function generateSeedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a random category based on a seed
 */
function getRandomCategory(seed: number): string {
  const categories = Object.keys(ingredientGroups);
  const index = Math.floor(randomNumberFromSeed(seed, 0, categories.length));
  return categories[index];
}

/**
 * Get a secondary category that's different from the primary
 */
function getSecondaryCategory(primaryCategory: string, seed: number): string {
  const categories = Object.keys(ingredientGroups).filter(c => c !== primaryCategory);
  const index = Math.floor(randomNumberFromSeed(seed + 50, 0, categories.length));
  return categories[index];
}

/**
 * Generate a random number between min and max based on a seed
 */
function randomNumberFromSeed(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);
  return min + rand * (max - min);
} 