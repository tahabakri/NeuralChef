import { create } from 'zustand';
import { Recipe } from '@/services/recipeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

interface RecipeState {
  recipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  favorites: Recipe[];
  setRecipe: (recipe: Recipe) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearRecipe: () => void;
  addToFavorites: (recipe: Recipe) => Promise<void>;
  removeFromFavorites: (recipeTitle: string) => Promise<void>;
  isFavorite: (recipeTitle: string) => boolean;
  loadFavorites: () => Promise<void>;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipe: null,
  isLoading: false,
  error: null,
  favorites: [],
  
  setRecipe: (recipe) => set({ recipe, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearRecipe: () => set({ recipe: null, error: null }),
  
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