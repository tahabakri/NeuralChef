import { create } from 'zustand';
import { Recipe } from '@/services/recipeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useRecipeHistoryStore } from './recipeHistoryStore';

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
  lastRequest: { ingredients: string[] } | null;
  setLastRequest: (request: { ingredients: string[] }) => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipe: null,
  isLoading: false,
  error: null,
  favorites: [],
  lastRequest: null,
  
  setRecipe: (recipe) => {
    set({ recipe, isLoading: false, error: null });
    useRecipeHistoryStore.getState().addToHistory(recipe);
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (type, message, details) => set({ 
    error: { 
      type, 
      message, 
      details, 
      timestamp: Date.now() 
    }, 
    isLoading: false 
  }),
  
  clearError: () => set({ error: null }),
  
  clearRecipe: () => set({ recipe: null, error: null }),
  
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
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      set({ favorites: updatedFavorites });
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

// Helper hook to load favorites on app start
export const useFavoriteRecipes = () => {
  const loadFavorites = useRecipeStore(state => state.loadFavorites);
  
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
  
  return useRecipeStore(state => state.favorites);
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