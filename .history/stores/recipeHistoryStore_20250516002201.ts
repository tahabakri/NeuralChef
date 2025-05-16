import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './recipeStore'; // Assuming Recipe type is defined in recipeStore

export interface RecipeHistoryState {
  history: Recipe[];
  addToHistory: (recipe: Recipe) => void;
  clearHistory: () => void;
  // Future: removeRecipeFromHistory: (recipeId: string) => void;
}

const MAX_HISTORY_LENGTH = 10; // Limit the number of recipes in history

export const useRecipeHistoryStore = create<RecipeHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (recipe) => {
        const currentHistory = get().history;
        // Avoid duplicates based on title (or a unique ID if available)
        const isDuplicate = currentHistory.some(r => r.title === recipe.title);
        if (isDuplicate) {
          // Optionally, move the existing one to the top
          set((state) => ({
            history: [recipe, ...state.history.filter(r => r.title !== recipe.title)].slice(0, MAX_HISTORY_LENGTH),
          }));
          return;
        }
        set((state) => ({
          history: [recipe, ...state.history].slice(0, MAX_HISTORY_LENGTH),
        }));
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'recipe-history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to get a snapshot of the history (e.g., for non-React components)
export const getRecipeHistory = () => useRecipeHistoryStore.getState().history;

export default useRecipeHistoryStore; 