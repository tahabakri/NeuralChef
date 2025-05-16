import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/services/recipeService';

export interface SavedRecipesState {
  savedRecipes: Recipe[];
  saveRecipe: (recipe: Recipe) => Promise<void>;
  removeSavedRecipe: (recipeTitle: string) => Promise<void>;
  isSaved: (recipeTitle: string) => boolean;
  loadSavedRecipes: () => Promise<void>;
}

export const useSavedRecipesStore = create<SavedRecipesState>()(
  persist(
    (set, get) => ({
      savedRecipes: [],
      
      saveRecipe: async (recipe) => {
        try {
          const currentSaved = get().savedRecipes;
          
          // Prevent duplicates
          if (!currentSaved.some(saved => saved.title === recipe.title)) {
            const updatedSaved = [...currentSaved, recipe];
            set({ savedRecipes: updatedSaved });
          }
        } catch (error) {
          console.error('Failed to save recipe:', error);
        }
      },
      
      removeSavedRecipe: async (recipeTitle) => {
        try {
          const currentSaved = get().savedRecipes;
          const updatedSaved = currentSaved.filter(recipe => recipe.title !== recipeTitle);
          set({ savedRecipes: updatedSaved });
        } catch (error) {
          console.error('Failed to remove saved recipe:', error);
        }
      },
      
      isSaved: (recipeTitle) => {
        return get().savedRecipes.some(recipe => recipe.title === recipeTitle);
      },
      
      loadSavedRecipes: async () => {
        // This function is mostly for compatibility with other stores
        // The persist middleware will handle loading from AsyncStorage
      },
    }),
    {
      name: 'saved-recipes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSavedRecipesStore; 