export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Step {
  instruction: string;
  imageUrl?: string;
  hasTimer?: boolean;
  timerDuration?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  heroImage?: string;
  cookTime?: number;
  difficulty: Difficulty;
  rating?: number;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
}

export enum RecipeErrorType {
  FETCH_ERROR = 'FETCH_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
  DELETE_ERROR = 'DELETE_ERROR',
  GENERATE_ERROR = 'GENERATE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
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
const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Classic Margherita Pizza',
    description: 'A traditional Italian pizza with fresh basil, mozzarella, and tomatoes.',
    heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    cookTime: 30,
    difficulty: 'Medium',
    rating: 4.8,
    tags: ['italian', 'dinner', 'vegetarian'],
    ingredients: [
      { name: 'Pizza Dough', amount: '1', unit: 'ball' },
      { name: 'Fresh Mozzarella', amount: '200', unit: 'g' },
      { name: 'Fresh Basil', amount: '10', unit: 'leaves' },
      { name: 'Tomato Sauce', amount: '1/2', unit: 'cup' }
    ],
    steps: [
      { instruction: 'Preheat oven to 450°F (230°C)' },
      { instruction: 'Roll out the pizza dough' },
      { instruction: 'Spread tomato sauce evenly' },
      { instruction: 'Add mozzarella and bake for 15-20 minutes', hasTimer: true, timerDuration: 20 },
      { instruction: 'Top with fresh basil leaves' }
    ]
  },
  {
    id: '2',
    title: 'Grilled Chicken Salad',
    description: 'A healthy and filling salad with grilled chicken breast.',
    heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    cookTime: 20,
    difficulty: 'Easy',
    rating: 4.5,
    tags: ['healthy', 'lunch', 'quick'],
    ingredients: [
      { name: 'Chicken Breast', amount: '2', unit: 'pieces' },
      { name: 'Mixed Greens', amount: '200', unit: 'g' },
      { name: 'Cherry Tomatoes', amount: '1', unit: 'cup' },
      { name: 'Olive Oil', amount: '2', unit: 'tbsp' }
    ],
    steps: [
      { instruction: 'Season chicken with salt and pepper' },
      { instruction: 'Grill chicken for 6-8 minutes per side', hasTimer: true, timerDuration: 16 },
      { instruction: 'Let chicken rest for 5 minutes, then slice', hasTimer: true, timerDuration: 5 },
      { instruction: 'Toss greens with olive oil' },
      { instruction: 'Top with sliced chicken and tomatoes' }
    ]
  }
];

interface GenerateRecipeParams {
  ingredients?: string[];
  random?: boolean;
  mealType?: string;
}

export const generateRecipe = async (params: GenerateRecipeParams): Promise<Recipe> => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate network error (uncomment to test error handling)
  // if (Math.random() < 0.2) {
  //   throw new Error('network error: failed to connect to server');
  // }
  
  // Return a mock recipe
  const randomRecipe = MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
  
  // Create a copy to avoid modifying the original
  const generatedRecipe: Recipe = {
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
        amount: '1', 
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
