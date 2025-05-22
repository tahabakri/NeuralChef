import { create } from 'zustand';
import { Recipe, RecipeError, RecipeErrorType } from '@/services/recipeService';
import { todayRecipes } from '@/constants/sampleRecipes';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type { Recipe, RecipeError }; // Export Recipe and RecipeError types

interface RecipeStore {
  recipes: Recipe[];
  popularRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  isLoading: boolean;
  error: RecipeError | null;
  hasNewRecipe: boolean;
  lastNewRecipeTimestamp: number | null;
  fetchRecipes: () => Promise<void>;
  fetchPopularRecipes: () => Promise<void>;
  fetchRecipeById: (id: string) => Promise<void>;
  generateRecipe: (ingredients: string[]) => Promise<void>;
  setHasNewRecipe: (value: boolean) => void;
  toggleSave?: (recipeId: string) => void; // Optional because it's added now
}

export const useRecipe = () => useRecipeStore((state: RecipeStore) => state.selectedRecipe);
export const useRecipeLoading = () => useRecipeStore((state: RecipeStore) => state.isLoading);
export const useRecipeError = () => useRecipeStore((state: RecipeStore) => state.error);

// Mock data for development
const MOCK_RECIPES: Recipe[] = [
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
  },
  {
    id: '3',
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade cookies that are crispy outside and chewy inside.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
    heroImage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
    cookTime: 25,
    servings: 24,
    difficulty: 'Easy',
    rating: 4.9,
    tags: ['dessert', 'snacks', 'baking'],
    ingredients: [
      { name: 'Flour', quantity: '2 1/4', unit: 'cups' },
      { name: 'Butter', quantity: '1', unit: 'cup' },
      { name: 'Brown Sugar', quantity: '3/4', unit: 'cup' },
      { name: 'Chocolate Chips', quantity: '2', unit: 'cups' }
    ],
    steps: [
      { description: 'Cream butter and sugars together' },
      { description: 'Mix in dry ingredients' },
      { description: 'Fold in chocolate chips' },
      { description: 'Drop spoonfuls onto baking sheet' },
      { description: 'Bake at 375°F for 10-12 minutes', time: 12 }
    ]
  }
];

export const useRecipeStore = create<RecipeStore>()(
  persist<RecipeStore>(
    (set, get) => ({
      recipes: [],
      popularRecipes: [],
      selectedRecipe: null,
      isLoading: false,
      error: null,
      hasNewRecipe: false,
      lastNewRecipeTimestamp: null,
      fetchRecipes: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ recipes: todayRecipes });
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
          set({ popularRecipes: todayRecipes });
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
          let recipe = todayRecipes.find(r => r.id === id);
          
          if (!recipe) {
            recipe = MOCK_RECIPES.find(r => r.id === id);
          }
          
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
          const randomRecipe = todayRecipes[Math.floor(Math.random() * todayRecipes.length)];
          const now = Date.now();
          set({ 
            selectedRecipe: randomRecipe, 
            hasNewRecipe: true,
            lastNewRecipeTimestamp: now
          });
        } catch (error) {
          set({ error: { type: RecipeErrorType.GENERATE_ERROR, message: 'Failed to generate recipe' } });
        } finally {
          set({ isLoading: false });
        }
      },
      setHasNewRecipe: (value: boolean): void => {
        set({ 
          hasNewRecipe: value,
          lastNewRecipeTimestamp: value && !get().lastNewRecipeTimestamp 
            ? Date.now() 
            : get().lastNewRecipeTimestamp
        });
      },
      toggleSave: (recipeId: string) => {
        set((state) => ({
          recipes: state.recipes.map(recipe =>
            recipe.id === recipeId
              ? { ...recipe, saved: !recipe.saved }
              : recipe
          ),
          // Also update popularRecipes if the toggled recipe is in there
          popularRecipes: state.popularRecipes.map(recipe =>
            recipe.id === recipeId
              ? { ...recipe, saved: !recipe.saved }
              : recipe
          ),
          // And the selectedRecipe if it's the one being toggled
          selectedRecipe: state.selectedRecipe?.id === recipeId
            ? { ...state.selectedRecipe, saved: !state.selectedRecipe.saved }
            : state.selectedRecipe,
        }));
      },
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
