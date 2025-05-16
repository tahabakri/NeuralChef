import { create } from 'zustand';
import { Recipe } from '@/services/recipeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface RecipeState {
  recipe: Recipe | null;
  isLoading: boolean;
  error: RecipeError | null;
  favorites: Recipe[];
  hasNewRecipe: boolean;
  lastRequest: { ingredients: string[] } | null;
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
}

// Separate state and actions to help with type inference in selectors
export const useRecipeStore = create<RecipeState & RecipeActions>((set, get) => ({
  recipe: null,
  isLoading: false,
  error: null,
  favorites: [],
  lastRequest: null,
  hasNewRecipe: false,
  
  setRecipe: (recipe) => {
    // Only update if recipe actually changed
    if (recipe?.title !== get().recipe?.title) {
      set({ recipe, isLoading: false, error: null, hasNewRecipe: true });
      useRecipeHistoryStore.getState().addToHistory(recipe);
    }
  },
  
  markRecipeAsViewed: () => set(state => {
    if (!state.hasNewRecipe) return state;
    return { hasNewRecipe: false };
  }),
  
  setLoading: (isLoading) => set(state => {
    if (state.isLoading === isLoading) return state;
    return { isLoading };
  }),
  
  setError: (type, message, details) => set({ 
    error: { 
      type, 
      message, 
      details, 
      timestamp: Date.now() 
    }, 
    isLoading: false 
  }),
  
  clearError: () => set(state => {
    if (!state.error) return state;
    return { error: null };
  }),
  
  clearRecipe: () => set(state => {
    if (!state.recipe && !state.error) return state;
    return { recipe: null, error: null };
  }),
  
  setLastRequest: (request) => set({ lastRequest: request }),
  
  retryLastOperation: () => {
    const { lastRequest } = get();
    if (lastRequest) {
      set({ isLoading: true, error: null });
      // The actual retry logic should be implemented in the component that uses this method
      // by observing changes to the lastRequest and isLoading states
    }
  },
  
  // Add a recipe to favorites
  addToFavorites: async (recipe) => {
    try {
      const currentFavorites = get().favorites;
      
      // Prevent duplicates
      if (!currentFavorites.some(fav => fav.title === recipe.title)) {
        const updatedFavorites = [...currentFavorites, recipe];
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        set({ favorites: updatedFavorites });
      }
    } catch (error) {
      console.error('Failed to save favorite recipe:', error);
      set({ error: { 
        type: 'unknown', 
        message: 'Failed to save favorite recipe', 
        timestamp: Date.now() 
      } });
    }
  },
  
  // Remove a recipe from favorites
  removeFromFavorites: async (recipeTitle) => {
    try {
      const currentFavorites = get().favorites;
      const updatedFavorites = currentFavorites.filter(recipe => recipe.title !== recipeTitle);
      
      // Only update if there was actually a change
      if (updatedFavorites.length !== currentFavorites.length) {
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        set({ favorites: updatedFavorites });
      }
    } catch (error) {
      console.error('Failed to remove favorite recipe:', error);
      set({ error: { 
        type: 'unknown', 
        message: 'Failed to remove favorite recipe', 
        timestamp: Date.now() 
      } });
    }
  },
  
  // Check if a recipe is in favorites
  isFavorite: (recipeTitle) => {
    return get().favorites.some(recipe => recipe.title === recipeTitle);
  },
  
  // Load favorites from persistent storage
  loadFavorites: async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        set({ favorites: JSON.parse(storedFavorites) });
      }
    } catch (error) {
      console.error('Failed to load favorite recipes:', error);
      set({ error: { 
        type: 'unknown', 
        message: 'Failed to load favorite recipes', 
        timestamp: Date.now() 
      } });
    }
  },
}));

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
      recipeTitle ? state.favorites.some(recipe => recipe.title === recipeTitle) : false,
    [recipeTitle])
  );
};

// Optimized hook to get all favorites
export const useFavorites = () => useRecipeStore(state => state.favorites, shallow);

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