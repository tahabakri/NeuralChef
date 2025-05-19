import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  isChecked?: boolean;
}

interface IngredientsState {
  ingredients: Ingredient[];
  recentIngredients: string[];
  customIngredients: string[];
  isLoading: boolean;
  error: string | null;
}

interface IngredientsActions {
  addIngredient: (ingredient: string | Ingredient) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  setIngredientsBatch: (newIngredients: Ingredient[]) => void; // New action
  clearIngredients: () => void;
  toggleIngredient: (id: string) => void;
  addRecentIngredient: (name: string) => void;
  addCustomIngredient: (name: string) => void;
  loadIngredients: () => Promise<void>;
  saveIngredients: () => Promise<void>;
}

export const useIngredientsStore = create<IngredientsState & IngredientsActions>((set, get) => ({
  ingredients: [],
  recentIngredients: [],
  customIngredients: [],
  isLoading: false,
  error: null,
  
  addIngredient: (ingredient) => {
    // Handle both string and Ingredient object
    if (typeof ingredient === 'string') {
      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        name: ingredient.trim(),
        isChecked: false
      };
      
      set(state => ({
        ingredients: [...state.ingredients, newIngredient]
      }));
      
      get().addRecentIngredient(newIngredient.name);
    } else {
      set(state => ({
        ingredients: [...state.ingredients, { 
          ...ingredient, 
          id: ingredient.id || Date.now().toString() 
        }]
      }));
      
      get().addRecentIngredient(ingredient.name);
    }
    
    get().saveIngredients();
  },
  
  removeIngredient: (id) => {
    set(state => ({
      ingredients: state.ingredients.filter(ing => ing.id !== id)
    }));
    
    get().saveIngredients();
  },
  
  updateIngredient: (id, updates) => {
    set(state => ({
      ingredients: state.ingredients.map(ing => 
        ing.id === id ? { ...ing, ...updates } : ing
      )
    }));
    
    get().saveIngredients();
  },

  setIngredientsBatch: (newIngredients) => {
    set({ ingredients: newIngredients });
    get().saveIngredients();
  },
  
  clearIngredients: () => {
    set({ ingredients: [] });
    get().saveIngredients();
  },
  
  toggleIngredient: (id) => {
    set(state => ({
      ingredients: state.ingredients.map(ing => 
        ing.id === id ? { ...ing, isChecked: !ing.isChecked } : ing
      )
    }));
    
    get().saveIngredients();
  },
  
  addRecentIngredient: (name) => {
    if (!name) return;
    
    set(state => {
      // Keep most recent 20 ingredients without duplicates
      const filtered = state.recentIngredients.filter(ing => ing !== name);
      const updated = [name, ...filtered].slice(0, 20);
      
      return { recentIngredients: updated };
    });
    
    // Save recent ingredients to AsyncStorage
    AsyncStorage.setItem('recentIngredients', JSON.stringify(get().recentIngredients))
      .catch(error => console.error('Error saving recent ingredients:', error));
  },
  
  addCustomIngredient: (name) => {
    if (!name || get().customIngredients.includes(name)) return;
    
    set(state => ({
      customIngredients: [...state.customIngredients, name]
    }));
    
    // Save custom ingredients to AsyncStorage
    AsyncStorage.setItem('customIngredients', JSON.stringify(get().customIngredients))
      .catch(error => console.error('Error saving custom ingredients:', error));
  },
  
  loadIngredients: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Load ingredients
      const ingredientsData = await AsyncStorage.getItem('ingredients');
      if (ingredientsData) {
        set({ ingredients: JSON.parse(ingredientsData) });
      }
      
      // Load recent ingredients
      const recentData = await AsyncStorage.getItem('recentIngredients');
      if (recentData) {
        set({ recentIngredients: JSON.parse(recentData) });
      }
      
      // Load custom ingredients
      const customData = await AsyncStorage.getItem('customIngredients');
      if (customData) {
        set({ customIngredients: JSON.parse(customData) });
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error loading ingredients data:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load ingredients' 
      });
    }
  },
  
  saveIngredients: async () => {
    try {
      await AsyncStorage.setItem('ingredients', JSON.stringify(get().ingredients));
    } catch (error) {
      console.error('Error saving ingredients:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to save ingredients' });
    }
  }
}));

// Initialize by loading saved data
if (typeof window !== 'undefined') {
  useIngredientsStore.getState().loadIngredients();
}
