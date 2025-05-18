import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, generateRecipe as generateRecipeService } from '@/services/recipeService';
import { useEffect, useCallback } from 'react';
import { useRecipeHistoryStore } from './recipeHistoryStore';
import { shallow } from 'zustand/shallow';

// Define specific error types for better error handling
export type RecipeErrorType = 
  | 'network'
  | 'timeout'
  | 'generation'
  | 'validation'
  | 'unknown';

export interface RecipeError {
  type: RecipeErrorType;
  message: string;
  details?: string;
  timestamp: number;
}

export interface Ingredient {
  name: string;
  amount?: string;
  unit?: string;
}

export interface RecipeStep {
  step: number;
  description: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  cookTime: number; // in minutes
  servings: number;
  calories?: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
}

export interface RecipeState {
  savedRecipes: Recipe[];
  recentRecipes: Recipe[];
  hasNewRecipe: boolean;
  lastRequest: { ingredients: string[] } | null;
  todayRecipes: Recipe[];
  recommendedRecipes: Recipe[];
  
  // Actions
  saveRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: string) => void;
  toggleFavorite: (recipeId: string) => void;
  addToRecent: (recipe: Recipe) => void;
  clearRecent: () => void;
  setHasNewRecipe: (hasNew: boolean) => void;
}

interface RecipeActions {
  setRecipe: (recipe: Recipe) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (errorType: RecipeErrorType, message: string, details?: string) => void;
  clearError: () => void;
  clearRecipe: () => void;
  addToFavorites: (recipe: Recipe) => Promise<void>;
  removeFromFavorites: (recipeTitle: string) => Promise<void>;
  isFavorite: (recipeTitle: string) => boolean;
  loadFavorites: () => Promise<void>;
  retryLastOperation: () => void;
  setLastRequest: (request: { ingredients: string[] }) => void;
  markRecipeAsViewed: () => void;
  generateRecipe: (ingredients: string[]) => Promise<Recipe | null>;
  fetchTodayRecipes: () => Promise<Recipe[]>;
  fetchRecommendedRecipes: () => Promise<Recipe[]>;
}

export interface RecipeStore {
  hasNewRecipe: boolean;
  setHasNewRecipe: (hasNew: boolean) => void;
}

// Create the recipe store with persistence
export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set) => ({
      // Initial state
      hasNewRecipe: false,
      
      // Actions
      setHasNewRecipe: (hasNew) => set({ hasNewRecipe: hasNew }),
    }),
    {
      name: 'reciptai-recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Optimized selectors to prevent unnecessary re-renders
export const useRecipe = () => useRecipeStore(state => state.recipe);
export const useRecipeLoading = () => useRecipeStore(state => state.isLoading);
export const useRecipeError = () => useRecipeStore(state => state.error);
export const useHasNewRecipe = () => useRecipeStore(state => state.hasNewRecipe);
export const useLastRequest = () => useRecipeStore(state => state.lastRequest);

// Helper hook to check if a recipe is a favorite
export const useIsFavorite = (recipeTitle?: string) => {
  return useRecipeStore(
    useCallback(state => 
      recipeTitle ? state.savedRecipes.some(recipe => recipe.title === recipeTitle) : false,
    [recipeTitle])
  );
};

// Optimized hook to get all favorites
export const useFavorites = () => useRecipeStore(state => state.savedRecipes, shallow);

// Helper hook to load favorites on app start
export const useFavoriteRecipes = () => {
  const loadFavorites = useRecipeStore(state => state.loadFavorites);
  const favorites = useFavorites();
  
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
  
  return favorites;
};

// Helper function to get user-friendly error messages
export function getUserFriendlyErrorMessage(error: RecipeError | null): string {
  if (!error) return '';
  
  switch (error.type) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'timeout':
      return 'The operation is taking longer than expected. Please try again later.';
    case 'generation':
      return 'We couldn\'t create a recipe with these ingredients. Please try different ingredients or try again later.';
    case 'validation':
      return 'Please check your ingredients and try again.';
    case 'unknown':
    default:
      return error.message || 'Something unexpected happened. Please try again.';
  }
}