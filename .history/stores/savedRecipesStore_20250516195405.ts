import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/services/recipeService';

export interface SavedRecipesState {
  savedRecipes: Recipe[];
  filteredRecipes: Recipe[];
  
  // Save, remove, update
  saveRecipe: (recipe: Recipe) => Promise<void>;
  removeSavedRecipe: (recipeTitle: string) => Promise<void>;
  isSaved: (recipeTitle: string) => boolean;
  loadSavedRecipes: () => Promise<void>;
  updateRecipe: (recipeId: string, updatedRecipe: Recipe) => Promise<void>;
  
  // Tag functions
  addTagToRecipe: (recipeTitle: string, tag: string) => Promise<void>;
  removeTagFromRecipe: (recipeTitle: string, tag: string) => Promise<void>;
  getAllTags: () => string[]; // Get all unique tags
  getRecipesByTags: (tags: string[]) => Recipe[]; // Filter recipes by tags
  updateRecipeTags: (recipeTitle: string, tags: string[]) => Promise<void>; // Set all tags for a recipe
  
  // Search and filter functions
  searchRecipes: (searchText: string) => void;
  filterRecipesByDate: (dateFilter: 'all' | 'today' | 'week' | 'month') => void;
  sortRecipes: (sortBy: 'newest' | 'oldest' | 'name' | 'rating') => void;
  applyFilters: (options: {
    searchText?: string,
    tags?: string[],
    dateFilter?: 'all' | 'today' | 'week' | 'month',
    sortBy?: 'newest' | 'oldest' | 'name' | 'rating',
    tagsOnly?: boolean
  }) => void;
  resetFilters: () => void;
}

export const useSavedRecipesStore = create<SavedRecipesState>()(
  persist(
    (set, get) => ({
      savedRecipes: [],
      filteredRecipes: [],
      
      saveRecipe: async (recipe) => {
        try {
          const currentSaved = get().savedRecipes;
          
          // Prevent duplicates
          if (!currentSaved.some(saved => saved.title === recipe.title)) {
            // Initialize tags if not present
            const recipeWithTags = {
              ...recipe,
              tags: recipe.tags || [],
              // Add timestamp for date filtering
              createdAt: recipe.createdAt || new Date().toISOString()
            };
            const updatedSaved = [...currentSaved, recipeWithTags];
            set({ 
              savedRecipes: updatedSaved,
              filteredRecipes: updatedSaved
            });
          }
        } catch (error) {
          console.error('Failed to save recipe:', error);
        }
      },
      
      removeSavedRecipe: async (recipeTitle) => {
        try {
          const currentSaved = get().savedRecipes;
          const updatedSaved = currentSaved.filter(recipe => recipe.title !== recipeTitle);
          set({ 
            savedRecipes: updatedSaved,
            filteredRecipes: updatedSaved
          });
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
        const recipes = get().savedRecipes;
        set({ filteredRecipes: recipes });
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
          
          set({ 
            savedRecipes: updatedSaved,
            filteredRecipes: updatedSaved
          });
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
          
          set({ 
            savedRecipes: updatedSaved,
            filteredRecipes: updatedSaved 
          });
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
          
          set({ 
            savedRecipes: updatedSaved,
            filteredRecipes: updatedSaved
          });
        } catch (error) {
          console.error('Failed to update recipe tags:', error);
        }
      },
      
      // Update an existing recipe with new data
      updateRecipe: async (recipeId, updatedRecipe) => {
        try {
          const currentSaved = get().savedRecipes;
          
          // Find the index of the recipe to update by matching the ID or title
          const index = currentSaved.findIndex(recipe => 
            (recipe.id && recipe.id === recipeId) || recipe.title === updatedRecipe.title
          );
          
          if (index !== -1) {
            // Create a new array with the updated recipe
            const updatedSaved = [...currentSaved];
            updatedSaved[index] = {
              ...updatedRecipe,
              tags: updatedRecipe.tags || currentSaved[index].tags || [],
              // Maintain the original creation timestamp
              createdAt: currentSaved[index].createdAt || new Date().toISOString(),
              // Add updated timestamp
              updatedAt: new Date().toISOString()
            };
            
            set({ 
              savedRecipes: updatedSaved,
              filteredRecipes: updatedSaved
            });
          } else {
            console.warn('Recipe not found for update:', recipeId);
          }
        } catch (error) {
          console.error('Failed to update recipe:', error);
        }
      },
      
      // Search recipes by text (title, description, ingredients)
      searchRecipes: (searchText) => {
        if (!searchText.trim()) {
          // If no search text, reset to all recipes
          set({ filteredRecipes: get().savedRecipes });
          return;
        }
        
        const normalizedSearchText = searchText.toLowerCase().trim();
        const filtered = get().savedRecipes.filter(recipe => {
          // Search in title
          if (recipe.title.toLowerCase().includes(normalizedSearchText)) {
            return true;
          }
          
          // Search in description
          if (recipe.description.toLowerCase().includes(normalizedSearchText)) {
            return true;
          }
          
          // Search in ingredients
          if (recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(normalizedSearchText)
          )) {
            return true;
          }
          
          // Search in tags if available
          if (recipe.tags && recipe.tags.some(tag => 
            tag.toLowerCase().includes(normalizedSearchText)
          )) {
            return true;
          }
          
          return false;
        });
        
        set({ filteredRecipes: filtered });
      },
      
      // Filter recipes by date
      filterRecipesByDate: (dateFilter) => {
        if (dateFilter === 'all') {
          // If 'all', reset to all recipes
          set({ filteredRecipes: get().savedRecipes });
          return;
        }
        
        const now = new Date();
        let cutoffDate: Date;
        
        switch (dateFilter) {
          case 'today':
            cutoffDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            const dayOfWeek = now.getDay();
            const diffToStartOfWeek = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            cutoffDate = new Date(now.setDate(diffToStartOfWeek));
            cutoffDate.setHours(0, 0, 0, 0);
            break;
          case 'month':
            cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            cutoffDate = new Date(0); // Beginning of time
        }
        
        const filtered = get().savedRecipes.filter(recipe => {
          const recipeDate = recipe.createdAt
            ? new Date(recipe.createdAt)
            : new Date(0);
          return recipeDate >= cutoffDate;
        });
        
        set({ filteredRecipes: filtered });
      },
      
      // Sort recipes
      sortRecipes: (sortBy) => {
        const recipes = [...get().filteredRecipes];
        
        switch (sortBy) {
          case 'newest':
            recipes.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            break;
          case 'oldest':
            recipes.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateA - dateB;
            });
            break;
          case 'name':
            recipes.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case 'rating':
            recipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        }
        
        set({ filteredRecipes: recipes });
      },
      
      // Apply multiple filters at once for better performance
      applyFilters: (options) => {
        let filtered = [...get().savedRecipes];
        
        // Filter by tag if tags are provided
        if (options.tags && options.tags.length > 0) {
          filtered = filtered.filter(recipe => {
            if (!recipe.tags || recipe.tags.length === 0) {
              return false;
            }
            return options.tags!.every(tag => 
              recipe.tags!.some(recipeTag => 
                recipeTag.toLowerCase() === tag.toLowerCase()
              )
            );
          });
        }

        // Filter recipes with tags only
        if (options.tagsOnly) {
          filtered = filtered.filter(recipe => 
            recipe.tags && recipe.tags.length > 0
          );
        }
        
        // Filter by date if dateFilter is provided
        if (options.dateFilter && options.dateFilter !== 'all') {
          const now = new Date();
          let cutoffDate: Date;
          
          switch (options.dateFilter) {
            case 'today':
              cutoffDate = new Date(now.setHours(0, 0, 0, 0));
              break;
            case 'week':
              const dayOfWeek = now.getDay();
              const diffToStartOfWeek = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
              cutoffDate = new Date(now.setDate(diffToStartOfWeek));
              cutoffDate.setHours(0, 0, 0, 0);
              break;
            case 'month':
              cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            default:
              cutoffDate = new Date(0);
          }
          
          filtered = filtered.filter(recipe => {
            const recipeDate = recipe.createdAt
              ? new Date(recipe.createdAt)
              : new Date(0);
            return recipeDate >= cutoffDate;
          });
        }
        
        // Search by text if searchText is provided
        if (options.searchText && options.searchText.trim()) {
          const normalizedSearchText = options.searchText.toLowerCase().trim();
          filtered = filtered.filter(recipe => {
            return (
              recipe.title.toLowerCase().includes(normalizedSearchText) ||
              recipe.description.toLowerCase().includes(normalizedSearchText) ||
              recipe.ingredients.some(ingredient => 
                ingredient.toLowerCase().includes(normalizedSearchText)
              ) ||
              (recipe.tags && recipe.tags.some(tag => 
                tag.toLowerCase().includes(normalizedSearchText)
              ))
            );
          });
        }
        
        // Sort filtered recipes if sortBy is provided
        if (options.sortBy) {
          switch (options.sortBy) {
            case 'newest':
              filtered.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              });
              break;
            case 'oldest':
              filtered.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
              });
              break;
            case 'name':
              filtered.sort((a, b) => a.title.localeCompare(b.title));
              break;
            case 'rating':
              filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
              break;
          }
        }
        
        set({ filteredRecipes: filtered });
      },
      
      // Reset all filters to show all recipes
      resetFilters: () => {
        set({ filteredRecipes: get().savedRecipes });
      },
    }),
    {
      name: 'saved-recipes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSavedRecipesStore; 