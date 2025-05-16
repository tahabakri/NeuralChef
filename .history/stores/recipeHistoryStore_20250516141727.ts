import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './recipeStore'; // Assuming Recipe type is defined in recipeStore

export interface RecipeHistoryState {
  history: Recipe[];
  addToHistory: (recipe: Recipe) => void;
  clearHistory: () => void;
  
  // Tag functions
  addTagToHistoryRecipe: (recipeTitle: string, tag: string) => void;
  removeTagFromHistoryRecipe: (recipeTitle: string, tag: string) => void;
  getHistoryTags: () => string[]; // Get all unique tags from history
  getHistoryRecipesByTags: (tags: string[]) => Recipe[]; // Filter history by tags
  updateHistoryRecipeTags: (recipeTitle: string, tags: string[]) => void; // Set all tags for a recipe
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
        
        // Ensure the recipe has a tags array
        const recipeWithTags = {
          ...recipe,
          tags: recipe.tags || []
        };
        
        if (isDuplicate) {
          // Optionally, move the existing one to the top
          set((state) => ({
            history: [
              recipeWithTags, 
              ...state.history.filter(r => r.title !== recipe.title)
            ].slice(0, MAX_HISTORY_LENGTH),
          }));
          return;
        }
        set((state) => ({
          history: [recipeWithTags, ...state.history].slice(0, MAX_HISTORY_LENGTH),
        }));
      },
      clearHistory: () => set({ history: [] }),
      
      // Add a tag to a history recipe
      addTagToHistoryRecipe: (recipeTitle, tag) => {
        set((state) => {
          const updatedHistory = state.history.map(recipe => {
            if (recipe.title === recipeTitle) {
              // Initialize tags array if not present
              const currentTags = recipe.tags || [];
              
              // Don't add duplicate tags (case insensitive)
              if (!currentTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
                return {
                  ...recipe,
                  tags: [...currentTags, tag]
                };
              }
            }
            return recipe;
          });
          
          return { history: updatedHistory };
        });
      },
      
      // Remove a tag from a history recipe
      removeTagFromHistoryRecipe: (recipeTitle, tag) => {
        set((state) => {
          const updatedHistory = state.history.map(recipe => {
            if (recipe.title === recipeTitle && recipe.tags) {
              return {
                ...recipe,
                tags: recipe.tags.filter(t => t !== tag)
              };
            }
            return recipe;
          });
          
          return { history: updatedHistory };
        });
      },
      
      // Get all unique tags from all history recipes
      getHistoryTags: () => {
        const recipes = get().history;
        const allTags = recipes.flatMap(recipe => recipe.tags || []);
        return [...new Set(allTags)]; // Remove duplicates
      },
      
      // Get history recipes with specific tags
      getHistoryRecipesByTags: (tags) => {
        const recipes = get().history;
        
        if (tags.length === 0) {
          return recipes; // Return all recipes if no tags selected
        }
        
        return recipes.filter(recipe => {
          // Skip recipes without tags
          if (!recipe.tags || recipe.tags.length === 0) {
            return false;
          }
          
          // Check if the recipe has all the selected tags
          return tags.every(tag => 
            recipe.tags!.some(recipeTag => 
              recipeTag.toLowerCase() === tag.toLowerCase()
            )
          );
        });
      },
      
      // Update all tags for a history recipe
      updateHistoryRecipeTags: (recipeTitle, tags) => {
        set((state) => {
          const updatedHistory = state.history.map(recipe => {
            if (recipe.title === recipeTitle) {
              return {
                ...recipe,
                tags
              };
            }
            return recipe;
          });
          
          return { history: updatedHistory };
        });
      },
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