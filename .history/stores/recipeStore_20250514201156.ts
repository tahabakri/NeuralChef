import { create } from 'zustand';
import { Recipe } from '@/services/recipeService';

interface RecipeState {
  recipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  setRecipe: (recipe: Recipe) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearRecipe: () => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipe: null,
  isLoading: false,
  error: null,
  setRecipe: (recipe) => set({ recipe, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearRecipe: () => set({ recipe: null, error: null }),
}));