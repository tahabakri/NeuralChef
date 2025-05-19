import { create } from 'zustand';
import { Recipe, RecipeError, RecipeErrorType } from '@/services/recipeService';

export type { Recipe, RecipeError }; // Export Recipe and RecipeError types

interface RecipeStore {
  recipes: Recipe[];
  popularRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  isLoading: boolean;
  error: RecipeError | null;
  hasNewRecipe: boolean;
  fetchRecipes: () => Promise<void>;
  fetchPopularRecipes: () => Promise<void>;
  fetchRecipeById: (id: string) => Promise<void>;
  generateRecipe: (ingredients: string[]) => Promise<void>;
  setHasNewRecipe: (value: boolean) => void;
}

export const useRecipe = () => useRecipeStore(state => state.selectedRecipe);
export const useRecipeLoading = () => useRecipeStore(state => state.isLoading);
export const useRecipeError = () => useRecipeStore(state => state.error);

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
  },
  {
    id: '3',
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade cookies that are crispy outside and chewy inside.',
    heroImage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
    cookTime: 25,
    difficulty: 'Easy',
    rating: 4.9,
    tags: ['dessert', 'snacks', 'baking'],
    ingredients: [
      { name: 'Flour', amount: '2 1/4', unit: 'cups' },
      { name: 'Butter', amount: '1', unit: 'cup' },
      { name: 'Brown Sugar', amount: '3/4', unit: 'cup' },
      { name: 'Chocolate Chips', amount: '2', unit: 'cups' }
    ],
    steps: [
      { instruction: 'Cream butter and sugars together' },
      { instruction: 'Mix in dry ingredients' },
      { instruction: 'Fold in chocolate chips' },
      { instruction: 'Drop spoonfuls onto baking sheet' },
      { instruction: 'Bake at 375°F for 10-12 minutes', hasTimer: true, timerDuration: 12 }
    ]
  }
];

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  popularRecipes: [],
  selectedRecipe: null,
  isLoading: false,
  error: null,
  hasNewRecipe: false,
  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ recipes: MOCK_RECIPES });
    } catch (error) {
      set({ error: { type: RecipeErrorType.FETCH_ERROR, message: 'Failed to fetch recipes' } });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchPopularRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ popularRecipes: MOCK_RECIPES });
    } catch (error) {
      set({ error: { type: RecipeErrorType.FETCH_ERROR, message: 'Failed to fetch popular recipes' } });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchRecipeById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const recipe = MOCK_RECIPES.find(r => r.id === id);
      if (recipe) {
        set({ selectedRecipe: recipe });
      } else {
        throw new Error('Recipe not found');
      }
    } catch (error) {
      set({ error: { type: RecipeErrorType.FETCH_ERROR, message: 'Failed to fetch recipe' } });
    } finally {
      set({ isLoading: false });
    }
  },
  generateRecipe: async (ingredients) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const randomRecipe = MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
      set({ selectedRecipe: randomRecipe, hasNewRecipe: true });
    } catch (error) {
      set({ error: { type: RecipeErrorType.GENERATE_ERROR, message: 'Failed to generate recipe' } });
    } finally {
      set({ isLoading: false });
    }
  },
  setHasNewRecipe: (value) => set({ hasNewRecipe: value })
}));
