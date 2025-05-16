import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';

export type DietaryPreference = 
  | 'all'
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'paleo'
  | 'low-carb';

export type SpiceLevel = 'mild' | 'medium' | 'spicy' | 'extra-spicy';

export interface PreferencesState {
  dietaryPreference: DietaryPreference;
  allergies: string[];
  dislikedIngredients: string[];
  spiceLevel: SpiceLevel;
  cuisineTypes: string[];
  cookingTimeLimit: number; // in minutes, 0 means no limit

  setDietaryPreference: (preference: DietaryPreference) => Promise<void>;
  setAllergies: (allergies: string[]) => Promise<void>;
  setDislikedIngredients: (ingredients: string[]) => Promise<void>;
  setSpiceLevel: (level: SpiceLevel) => Promise<void>;
  setCuisineTypes: (cuisines: string[]) => Promise<void>;
  setCookingTimeLimit: (minutes: number) => Promise<void>;
  resetPreferences: () => Promise<void>;
  loadPreferences: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  dietaryPreference: 'all',
  allergies: [],
  dislikedIngredients: [],
  spiceLevel: 'medium',
  cuisineTypes: [],
  cookingTimeLimit: 0,
  
  setDietaryPreference: async (preference) => {
    try {
      await AsyncStorage.setItem('dietaryPreference', preference);
      set({ dietaryPreference: preference });
    } catch (error) {
      console.error('Failed to save dietary preference:', error);
    }
  },
  
  setAllergies: async (allergies) => {
    try {
      // Filter out any empty strings
      const validAllergies = allergies.filter(item => item.trim() !== '');
      await AsyncStorage.setItem('allergies', JSON.stringify(validAllergies));
      set({ allergies: validAllergies });
    } catch (error) {
      console.error('Failed to save allergies:', error);
    }
  },
  
  setDislikedIngredients: async (ingredients) => {
    try {
      // Filter out any empty strings
      const validIngredients = ingredients.filter(item => item.trim() !== '');
      await AsyncStorage.setItem('dislikedIngredients', JSON.stringify(validIngredients));
      set({ dislikedIngredients: validIngredients });
    } catch (error) {
      console.error('Failed to save disliked ingredients:', error);
    }
  },
  
  setSpiceLevel: async (level) => {
    try {
      await AsyncStorage.setItem('spiceLevel', level);
      set({ spiceLevel: level });
    } catch (error) {
      console.error('Failed to save spice level:', error);
    }
  },
  
  setCuisineTypes: async (cuisines) => {
    try {
      // Filter out any empty strings
      const validCuisines = cuisines.filter(item => item.trim() !== '');
      await AsyncStorage.setItem('cuisineTypes', JSON.stringify(validCuisines));
      set({ cuisineTypes: validCuisines });
    } catch (error) {
      console.error('Failed to save cuisine types:', error);
    }
  },
  
  setCookingTimeLimit: async (minutes) => {
    try {
      // Ensure minutes is a valid number
      const validMinutes = Math.max(0, parseInt(String(minutes), 10) || 0);
      await AsyncStorage.setItem('cookingTimeLimit', String(validMinutes));
      set({ cookingTimeLimit: validMinutes });
    } catch (error) {
      console.error('Failed to save cooking time limit:', error);
    }
  },
  
  resetPreferences: async () => {
    try {
      await AsyncStorage.multiRemove([
        'dietaryPreference',
        'allergies',
        'dislikedIngredients',
        'spiceLevel',
        'cuisineTypes',
        'cookingTimeLimit'
      ]);
      set({
        dietaryPreference: 'all',
        allergies: [],
        dislikedIngredients: [],
        spiceLevel: 'medium',
        cuisineTypes: [],
        cookingTimeLimit: 0
      });
    } catch (error) {
      console.error('Failed to reset preferences:', error);
    }
  },
  
  loadPreferences: async () => {
    try {
      const [
        storedPreference,
        storedAllergies,
        storedDislikedIngredients,
        storedSpiceLevel,
        storedCuisineTypes,
        storedCookingTimeLimit
      ] = await AsyncStorage.multiGet([
        'dietaryPreference',
        'allergies',
        'dislikedIngredients',
        'spiceLevel',
        'cuisineTypes',
        'cookingTimeLimit'
      ]);
      
      // Update state with stored values
      set({
        dietaryPreference: (storedPreference[1] as DietaryPreference) || 'all',
        allergies: storedAllergies[1] ? JSON.parse(storedAllergies[1]) : [],
        dislikedIngredients: storedDislikedIngredients[1] ? JSON.parse(storedDislikedIngredients[1]) : [],
        spiceLevel: (storedSpiceLevel[1] as SpiceLevel) || 'medium',
        cuisineTypes: storedCuisineTypes[1] ? JSON.parse(storedCuisineTypes[1]) : [],
        cookingTimeLimit: storedCookingTimeLimit[1] ? parseInt(storedCookingTimeLimit[1], 10) : 0
      });
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  },
}));

// Helper hook to load preferences on app start
export const useLoadPreferences = () => {
  const loadPreferences = usePreferencesStore(state => state.loadPreferences);
  
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);
  
  return usePreferencesStore(state => ({
    dietaryPreference: state.dietaryPreference,
    allergies: state.allergies,
    dislikedIngredients: state.dislikedIngredients,
    spiceLevel: state.spiceLevel,
    cuisineTypes: state.cuisineTypes,
    cookingTimeLimit: state.cookingTimeLimit
  }));
}; 