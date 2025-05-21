import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe as RecipeType, Ingredient, Step } from '@/types/recipe';
import { NetworkManager } from '@/components/OfflineBanner';
import { todayRecipes } from '@/constants/sampleRecipes';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

// Re-export the imported types
export type { RecipeType as Recipe, Ingredient, Step };

export enum RecipeErrorType {
  FETCH_ERROR = 'FETCH_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
  DELETE_ERROR = 'DELETE_ERROR',
  GENERATE_ERROR = 'GENERATE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RECIPE_NOT_FOUND = 'RECIPE_NOT_FOUND', // Added for recipe not found cases
  UNKNOWN_ERROR = 'UNKNOWN_ERROR', // Added for unknown error cases
}

export interface RecipeError {
  type: RecipeErrorType;
  message: string;
  details?: string;
  timestamp?: number;
}

export const getUserFriendlyErrorMessage = (error: RecipeError): string => {
  switch (error.type) {
    case RecipeErrorType.FETCH_ERROR:
      return 'Unable to load recipe. Please try again later.';
    case RecipeErrorType.SAVE_ERROR:
      return 'Failed to save recipe. Please try again.';
    case RecipeErrorType.DELETE_ERROR:
      return 'Could not delete recipe. Please try again.';
    case RecipeErrorType.GENERATE_ERROR:
      return 'Failed to generate recipe. Please try different ingredients.';
    case RecipeErrorType.NETWORK_ERROR:
      return 'Network connection error. Please check your connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Mock data for development
const MOCK_RECIPES: RecipeType[] = [
  {
    id: '1',
    title: 'Classic Margherita Pizza',
    description: 'A traditional Italian pizza with fresh basil, mozzarella, and tomatoes.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    cookTime: 30,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.8,
    tags: ['italian', 'dinner', 'vegetarian'],
    ingredients: [
      { name: 'Pizza Dough', quantity: '1', unit: 'ball' },
      { name: 'Fresh Mozzarella', quantity: '200', unit: 'g' },
      { name: 'Fresh Basil', quantity: '10', unit: 'leaves' },
      { name: 'Tomato Sauce', quantity: '1/2', unit: 'cup' }
    ],
    steps: [
      { description: 'Preheat oven to 450°F (230°C)' },
      { description: 'Roll out the pizza dough' },
      { description: 'Spread tomato sauce evenly' },
      { description: 'Add mozzarella and bake for 15-20 minutes', time: 20 },
      { description: 'Top with fresh basil leaves' }
    ]
  },
  {
    id: '2',
    title: 'Grilled Chicken Salad',
    description: 'A healthy and filling salad with grilled chicken breast.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    cookTime: 20,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.5,
    tags: ['healthy', 'lunch', 'quick'],
    ingredients: [
      { name: 'Chicken Breast', quantity: '2', unit: 'pieces' },
      { name: 'Mixed Greens', quantity: '200', unit: 'g' },
      { name: 'Cherry Tomatoes', quantity: '1', unit: 'cup' },
      { name: 'Olive Oil', quantity: '2', unit: 'tbsp' }
    ],
    steps: [
      { description: 'Season chicken with salt and pepper' },
      { description: 'Grill chicken for 6-8 minutes per side', time: 16 },
      { description: 'Let chicken rest for 5 minutes, then slice', time: 5 },
      { description: 'Toss greens with olive oil' },
      { description: 'Top with sliced chicken and tomatoes' }
    ]
  }
];

interface GenerateRecipeParams {
  ingredients?: string[];
  random?: boolean;
  mealType?: string;
}

export const generateRecipe = async (params: GenerateRecipeParams): Promise<RecipeType> => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate network error (uncomment to test error handling)
  // if (Math.random() < 0.2) {
  //   throw new Error('network error: failed to connect to server');
  // }
  
  // Return a mock recipe
  const randomRecipe = MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
  
  // Create a copy to avoid modifying the original
  const generatedRecipe: RecipeType = {
    ...randomRecipe,
    id: Date.now().toString(), // Generate a unique ID
  };
  
  // If we have ingredients, let's customize the recipe a bit
  if (params.ingredients && params.ingredients.length > 0) {
    generatedRecipe.title = `Custom ${randomRecipe.title} with ${params.ingredients[0]}`;
    generatedRecipe.ingredients = [
      ...randomRecipe.ingredients.slice(0, 2),
      ...params.ingredients.map(name => ({ 
        name, 
        quantity: '1', 
        unit: 'portion' 
      }))
    ];
  }
  
  // If mealType is specified, add it to tags
  if (params.mealType && params.mealType !== 'any') {
    generatedRecipe.tags = [
      ...generatedRecipe.tags.filter(tag => tag !== 'breakfast' && tag !== 'lunch' && tag !== 'dinner'),
      params.mealType.toLowerCase()
    ];
  }
  
  return generatedRecipe;
};

// Sample recipes for development/fallback
const sampleRecipes: RecipeType[] = [
  {
    id: '1',
    title: 'Classic Tomato Pasta',
    description: 'A simple and delicious tomato pasta that comes together in minutes.',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
    cookTime: 20,
    prepTime: 10,
    totalTime: 30,
    difficulty: 'Easy',
    rating: 4.8,
    servings: 4,
    author: 'Chef Mario',
    tags: ['pasta', 'italian', 'quick', 'vegetarian'],
    ingredients: [
      { name: 'Spaghetti', quantity: '400', unit: 'g' },
      { name: 'Olive oil', quantity: '2', unit: 'tbsp' },
      { name: 'Garlic', quantity: '3', unit: 'cloves' },
      { name: 'Canned tomatoes', quantity: '400', unit: 'g' },
      { name: 'Fresh basil', quantity: '1', unit: 'handful' },
      { name: 'Salt', quantity: 'to', unit: 'taste' },
      { name: 'Black pepper', quantity: 'to', unit: 'taste' },
      { name: 'Parmesan cheese', quantity: '50', unit: 'g' }
    ],
    steps: [
      {
        description: 'Bring a large pot of salted water to a boil. Add pasta and cook according to package instructions until al dente.',
        time: 10
      },
      {
        description: 'While pasta cooks, heat olive oil in a large pan over medium heat. Add minced garlic and cook for 1 minute until fragrant.',
        time: 2
      },
      {
        description: 'Add canned tomatoes to the pan, break them up with a wooden spoon. Season with salt and pepper. Simmer for 10 minutes.',
        time: 10
      },
      {
        description: 'Drain pasta, reserving 1/4 cup of pasta water. Add pasta to the sauce along with reserved pasta water. Toss to coat.',
        time: 2
      },
      {
        description: 'Tear fresh basil leaves and add to the pasta. Serve with grated parmesan cheese on top.',
        time: 1
      }
    ],
    nutritionalInfo: {
      calories: 380,
      protein: 12,
      carbs: 65,
      fat: 8,
      fiber: 3,
      sodium: 230
    }
  },
  {
    id: '2',
    title: 'Spicy Chicken Stir-fry',
    description: 'A flavorful and quick chicken stir-fry with vegetables and a spicy sauce.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
    cookTime: 15,
    prepTime: 15,
    totalTime: 30,
    difficulty: 'Medium',
    rating: 4.6,
    servings: 3,
    author: 'Chef Lin',
    tags: ['asian', 'chicken', 'quick', 'spicy'],
    ingredients: [
      { name: 'Chicken breast', quantity: '500', unit: 'g' },
      { name: 'Bell peppers', quantity: '2', unit: 'medium' },
      { name: 'Broccoli', quantity: '1', unit: 'head' },
      { name: 'Carrots', quantity: '2', unit: 'medium' },
      { name: 'Garlic', quantity: '3', unit: 'cloves' },
      { name: 'Ginger', quantity: '1', unit: 'thumb' },
      { name: 'Soy sauce', quantity: '3', unit: 'tbsp' },
      { name: 'Sriracha', quantity: '1', unit: 'tbsp' },
      { name: 'Honey', quantity: '2', unit: 'tsp' },
      { name: 'Vegetable oil', quantity: '2', unit: 'tbsp' },
      { name: 'Sesame seeds', quantity: '1', unit: 'tbsp' },
      { name: 'Rice', quantity: '200', unit: 'g' }
    ],
    steps: [
      {
        description: 'Slice chicken breast into thin strips. Mix with 1 tbsp soy sauce and set aside.',
        time: 5
      },
      {
        description: 'Slice bell peppers, cut broccoli into florets, and julienne carrots.',
        time: 5
      },
      {
        description: 'Cook rice according to package instructions.',
        time: 15
      },
      {
        description: 'Heat oil in a wok or large frying pan over high heat. Add chicken and stir-fry for 5-6 minutes until golden.',
        time: 6
      },
      {
        description: 'Add minced garlic and ginger, stir-fry for 30 seconds.',
        time: 1
      },
      {
        description: 'Add vegetables and stir-fry for 3-4 minutes until crisp-tender.',
        time: 4
      },
      {
        description: 'Mix remaining soy sauce with sriracha and honey, pour over the stir-fry. Toss to coat and cook for 1 minute.',
        time: 1
      },
      {
        description: 'Serve hot over rice, sprinkled with sesame seeds.',
        time: 1
      }
    ],
    nutritionalInfo: {
      calories: 420,
      protein: 35,
      carbs: 45,
      fat: 12,
      fiber: 5,
      sodium: 720
    }
  },
  {
    id: '3',
    title: 'Avocado Toast with Poached Egg',
    description: 'The perfect breakfast or brunch option that\'s both nutritious and delicious.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
    cookTime: 10,
    prepTime: 5,
    totalTime: 15,
    difficulty: 'Easy',
    rating: 4.9,
    servings: 2,
    author: 'Chef Emma',
    tags: ['breakfast', 'vegetarian', 'quick', 'healthy'],
    ingredients: [
      { name: 'Sourdough bread', quantity: '2', unit: 'slices' },
      { name: 'Avocado', quantity: '1', unit: 'ripe' },
      { name: 'Eggs', quantity: '2', unit: 'large' },
      { name: 'Lemon juice', quantity: '1', unit: 'tsp' },
      { name: 'Red pepper flakes', quantity: '1/4', unit: 'tsp' },
      { name: 'Salt', quantity: 'to', unit: 'taste' },
      { name: 'Black pepper', quantity: 'to', unit: 'taste' },
      { name: 'Fresh cilantro', quantity: '1', unit: 'tbsp' },
      { name: 'Vinegar', quantity: '1', unit: 'tbsp' }
    ],
    steps: [
      {
        description: 'Toast the sourdough bread slices until golden brown.',
        time: 3
      },
      {
        description: 'Bring a pot of water to a simmer. Add vinegar.',
        time: 3
      },
      {
        description: 'Mash the avocado with lemon juice, salt, and pepper in a bowl.',
        time: 2
      },
      {
        description: 'Crack each egg into a small bowl, then gently slide into the simmering water. Poach for 3-4 minutes.',
        time: 4
      },
      {
        description: 'Spread the mashed avocado on the toasted bread slices.',
        time: 1
      },
      {
        description: 'Remove poached eggs with a slotted spoon, allowing water to drain. Place on top of avocado toast.',
        time: 1
      },
      {
        description: 'Season with salt, pepper, red pepper flakes, and chopped cilantro.',
        time: 1
      }
    ],
    nutritionalInfo: {
      calories: 320,
      protein: 13,
      carbs: 28,
      fat: 18,
      fiber: 7,
      sodium: 380
    }
  }
];

// Cache key for local storage
const RECIPE_CACHE_KEY = 'recipe_cache_';

/**
 * Fetch a recipe by its ID
 */
export const getRecipeById = async (id: string): Promise<RecipeType | null> => {
  try {
    // Check if we're offline
    if (NetworkManager.isOffline) {
      // Try to get from local cache
      const cachedRecipe = await AsyncStorage.getItem(`${RECIPE_CACHE_KEY}${id}`);
      if (cachedRecipe) {
        return JSON.parse(cachedRecipe);
      }
      
      // If not in cache, use sample data from todayRecipes
      const sampleRecipe = todayRecipes.find(recipe => recipe.id === id);
      if (sampleRecipe) return sampleRecipe;
      
      // Fallback to other sample data
      const fallbackRecipe = sampleRecipes.find(recipe => recipe.id === id);
      return fallbackRecipe || null;
    }
    
    // Online: try to fetch from API
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`https://api.recipai.app/recipes/${id}`);
      // if (!response.ok) throw new Error('Failed to fetch recipe');
      // const recipe = await response.json();
      
      // For demo purposes, first check todayRecipes from sampleRecipes.ts
      const todayRecipe = todayRecipes.find(recipe => recipe.id === id);
      if (todayRecipe) {
        // Cache the result
        await AsyncStorage.setItem(`${RECIPE_CACHE_KEY}${id}`, JSON.stringify(todayRecipe));
        return todayRecipe;
      }
      
      // If not found in todayRecipes, check other sample data
      const recipe = sampleRecipes.find(recipe => recipe.id === id);
      
      if (recipe) {
        // Cache the result
        await AsyncStorage.setItem(`${RECIPE_CACHE_KEY}${id}`, JSON.stringify(recipe));
        return recipe;
      }
      
      return null;
    } catch (error) {
      console.error('API fetch error:', error);
      
      // API fetch failed, try to get from cache
      const cachedRecipe = await AsyncStorage.getItem(`${RECIPE_CACHE_KEY}${id}`);
      if (cachedRecipe) {
        return JSON.parse(cachedRecipe);
      }
      
      // If not in cache, check todayRecipes from sampleRecipes.ts
      const todayRecipe = todayRecipes.find(recipe => recipe.id === id);
      if (todayRecipe) return todayRecipe;
      
      // If not found in todayRecipes, use other sample data
      const sampleRecipe = sampleRecipes.find(recipe => recipe.id === id);
      return sampleRecipe || null;
    }
  } catch (error) {
    console.error('Error getting recipe:', error);
    return null;
  }
};

/**
 * Fetch multiple recipes (for listings)
 */
export const getRecipes = async (limit: number = 10): Promise<RecipeType[]> => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch(`https://api.recipai.app/recipes?limit=${limit}`);
    // if (!response.ok) throw new Error('Failed to fetch recipes');
    // const recipes = await response.json();
    
    // For demo purposes, we'll use the sample data
    return sampleRecipes.slice(0, limit);
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
};

/**
 * Search for recipes by query
 */
export const searchRecipes = async (query: string): Promise<RecipeType[]> => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch(`https://api.recipai.app/search?q=${encodeURIComponent(query)}`);
    // if (!response.ok) throw new Error('Failed to search recipes');
    // const recipes = await response.json();
    
    // For demo purposes, we'll filter the sample data
    const lowercaseQuery = query.toLowerCase();
    return sampleRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowercaseQuery) ||
      recipe.description.toLowerCase().includes(lowercaseQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
};
