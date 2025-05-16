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
  
  // Tag functions
  addTagToRecipe: (recipeTitle: string, tag: string) => Promise<void>;
  removeTagFromRecipe: (recipeTitle: string, tag: string) => Promise<void>;
  getAllTags: () => string[]; // Get all unique tags
  getRecipesByTags: (tags: string[]) => Recipe[]; // Filter recipes by tags
  updateRecipeTags: (recipeTitle: string, tags: string[]) => Promise<void>; // Set all tags for a recipe
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
            // Initialize tags if not present
            const recipeWithTags = {
              ...recipe,
              tags: recipe.tags || []
            };
            const updatedSaved = [...currentSaved, recipeWithTags];
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
      
      // Add a tag to a recipe
      addTagToRecipe: async (recipeTitle, tag) => {
        try {
          const currentSaved = get().savedRecipes;
          const updatedSaved = currentSaved.map(recipe => {
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
          
          set({ savedRecipes: updatedSaved });
        } catch (error) {
          console.error('Failed to add tag to recipe:', error);
        }
      },
      
      // Remove a tag from a recipe
      removeTagFromRecipe: async (recipeTitle, tag) => {
        try {
          const currentSaved = get().savedRecipes;
          const updatedSaved = currentSaved.map(recipe => {
            if (recipe.title === recipeTitle && recipe.tags) {
              return {
                ...recipe,
                tags: recipe.tags.filter(t => t !== tag)
              };
            }
            return recipe;
          });
          
          set({ savedRecipes: updatedSaved });
        } catch (error) {
          console.error('Failed to remove tag from recipe:', error);
        }
      },
      
      // Get all unique tags from all recipes
      getAllTags: () => {
        const recipes = get().savedRecipes;
        const allTags = recipes.flatMap(recipe => recipe.tags || []);
        return [...new Set(allTags)]; // Remove duplicates
      },
      
      // Get recipes with specific tags
      getRecipesByTags: (tags) => {
        const recipes = get().savedRecipes;
        
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
      
      // Update all tags for a recipe
      updateRecipeTags: async (recipeTitle, tags) => {
        try {
          const currentSaved = get().savedRecipes;
          const updatedSaved = currentSaved.map(recipe => {
            if (recipe.title === recipeTitle) {
              return {
                ...recipe,
                tags
              };
            }
            return recipe;
          });
          
          set({ savedRecipes: updatedSaved });
        } catch (error) {
          console.error('Failed to update recipe tags:', error);
        }
      },
    }),
    {
      name: 'saved-recipes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSavedRecipesStore; 