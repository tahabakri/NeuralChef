import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './recipeStore'; // Assuming Recipe type is defined in recipeStore

export interface RecipeHistoryState {
  history: Recipe[];
  filteredHistory: Recipe[];
  addToHistory: (recipe: Recipe) => void;
  clearHistory: () => void;
  
  // Tag functions
  addTagToHistoryRecipe: (recipeTitle: string, tag: string) => void;
  removeTagFromHistoryRecipe: (recipeTitle: string, tag: string) => void;
  getHistoryTags: () => string[]; // Get all unique tags from history
  getHistoryRecipesByTags: (tags: string[]) => Recipe[]; // Filter history by tags
  updateHistoryRecipeTags: (recipeTitle: string, tags: string[]) => void; // Set all tags for a recipe
  
  // Search and filter functions
  searchHistory: (searchText: string) => void;
  filterHistoryByDate: (dateFilter: 'all' | 'today' | 'week' | 'month') => void;
  sortHistory: (sortBy: 'newest' | 'oldest' | 'name' | 'rating') => void;
  applyHistoryFilters: (options: {
    searchText?: string,
    tags?: string[],
    dateFilter?: 'all' | 'today' | 'week' | 'month',
    sortBy?: 'newest' | 'oldest' | 'name' | 'rating',
    tagsOnly?: boolean
  }) => void;
  resetHistoryFilters: () => void;
}

const MAX_HISTORY_LENGTH = 30; // Increased history length for better filtering options

export const useRecipeHistoryStore = create<RecipeHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      filteredHistory: [],
      
      addToHistory: (recipe) => {
        const currentHistory = get().history;
        // Avoid duplicates based on title (or a unique ID if available)
        const isDuplicate = currentHistory.some(r => r.title === recipe.title);
        
        // Ensure the recipe has a tags array and timestamp
        const recipeWithMeta = {
          ...recipe,
          tags: recipe.tags || [],
          createdAt: recipe.createdAt || new Date().toISOString()
        };
        
        let updatedHistory;
        
        if (isDuplicate) {
          // Optionally, move the existing one to the top
          updatedHistory = [
            recipeWithMeta, 
            ...currentHistory.filter(r => r.title !== recipe.title)
          ].slice(0, MAX_HISTORY_LENGTH);
        } else {
          updatedHistory = [recipeWithMeta, ...currentHistory].slice(0, MAX_HISTORY_LENGTH);
        }
        
        set({
          history: updatedHistory,
          filteredHistory: updatedHistory
        });
      },
      
      clearHistory: () => set({ 
        history: [],
        filteredHistory: []
      }),
      
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
          
          return { 
            history: updatedHistory,
            filteredHistory: updatedHistory
          };
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
          
          return { 
            history: updatedHistory,
            filteredHistory: updatedHistory
          };
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
          
          return { 
            history: updatedHistory,
            filteredHistory: updatedHistory
          };
        });
      },
      
      // Search history recipes by text (title, description, ingredients)
      searchHistory: (searchText) => {
        if (!searchText.trim()) {
          // If no search text, reset to all recipes
          set({ filteredHistory: get().history });
          return;
        }
        
        const normalizedSearchText = searchText.toLowerCase().trim();
        const filtered = get().history.filter(recipe => {
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
        
        set({ filteredHistory: filtered });
      },
      
      // Filter history recipes by date
      filterHistoryByDate: (dateFilter) => {
        if (dateFilter === 'all') {
          // If 'all', reset to all recipes
          set({ filteredHistory: get().history });
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
        
        const filtered = get().history.filter(recipe => {
          const recipeDate = recipe.createdAt
            ? new Date(recipe.createdAt)
            : new Date(0);
          return recipeDate >= cutoffDate;
        });
        
        set({ filteredHistory: filtered });
      },
      
      // Sort history recipes
      sortHistory: (sortBy) => {
        const recipes = [...get().filteredHistory];
        
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
        
        set({ filteredHistory: recipes });
      },
      
      // Apply multiple filters at once for better performance
      applyHistoryFilters: (options) => {
        let filtered = [...get().history];
        
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
        
        set({ filteredHistory: filtered });
      },
      
      // Reset all filters to show all history recipes
      resetHistoryFilters: () => {
        set({ filteredHistory: get().history });
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
export const getFilteredRecipeHistory = () => useRecipeHistoryStore.getState().filteredHistory;

export default useRecipeHistoryStore; 