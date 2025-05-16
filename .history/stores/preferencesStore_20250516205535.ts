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

export type SpiceLevel = 'none' | 'mild' | 'medium' | 'spicy' | 'extra-spicy';

export type PortionSize = 'single' | 'couple' | 'family' | 'large-group';

export type MicroPreference = 
  | 'low-sodium' 
  | 'high-protein' 
  | 'low-sugar' 
  | 'high-fiber' 
  | 'low-fat' 
  | 'heart-healthy' 
  | 'diabetic-friendly';

export interface PreferencesState {
  dietaryPreference: DietaryPreference;
  allergies: string[];
  dislikedIngredients: string[];
  spiceLevel: SpiceLevel;
  cuisineTypes: string[];
  cookingTimeLimit: number; // in minutes, 0 means no limit
  maxCalories: number; // per serving, 0 means no limit
  portionSize: PortionSize;
  microPreferences: MicroPreference[];

  setDietaryPreference: (preference: DietaryPreference) => Promise<void>;
  setAllergies: (allergies: string[]) => Promise<void>;
  setDislikedIngredients: (ingredients: string[]) => Promise<void>;
  setSpiceLevel: (level: SpiceLevel) => Promise<void>;
  setCuisineTypes: (cuisines: string[]) => Promise<void>;
  setCookingTimeLimit: (minutes: number) => Promise<void>;
  setMaxCalories: (calories: number) => Promise<void>;
  setPortionSize: (size: PortionSize) => Promise<void>;
  setMicroPreferences: (preferences: MicroPreference[]) => Promise<void>;
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
  maxCalories: 0,
  portionSize: 'couple',
  microPreferences: [],
  
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
  
  setMaxCalories: async (calories) => {
    try {
      // Ensure calories is a valid number
      const validCalories = Math.max(0, parseInt(String(calories), 10) || 0);
      await AsyncStorage.setItem('maxCalories', String(validCalories));
      set({ maxCalories: validCalories });
    } catch (error) {
      console.error('Failed to save max calories:', error);
    }
  },
  
  setPortionSize: async (size) => {
    try {
      await AsyncStorage.setItem('portionSize', size);
      set({ portionSize: size });
    } catch (error) {
      console.error('Failed to save portion size:', error);
    }
  },
  
  setMicroPreferences: async (preferences) => {
    try {
      await AsyncStorage.setItem('microPreferences', JSON.stringify(preferences));
      set({ microPreferences: preferences });
    } catch (error) {
      console.error('Failed to save micro preferences:', error);
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
        'cookingTimeLimit',
        'maxCalories',
        'portionSize',
        'microPreferences'
      ]);
      set({
        dietaryPreference: 'all',
        allergies: [],
        dislikedIngredients: [],
        spiceLevel: 'medium',
        cuisineTypes: [],
        cookingTimeLimit: 0,
        maxCalories: 0,
        portionSize: 'couple',
        microPreferences: []
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
        storedCookingTimeLimit,
        storedMaxCalories,
        storedPortionSize,
        storedMicroPreferences
      ] = await AsyncStorage.multiGet([
        'dietaryPreference',
        'allergies',
        'dislikedIngredients',
        'spiceLevel',
        'cuisineTypes',
        'cookingTimeLimit',
        'maxCalories',
        'portionSize',
        'microPreferences'
      ]);
      
      // Update state with stored values
      set({
        dietaryPreference: (storedPreference[1] as DietaryPreference) || 'all',
        allergies: storedAllergies[1] ? JSON.parse(storedAllergies[1]) : [],
        dislikedIngredients: storedDislikedIngredients[1] ? JSON.parse(storedDislikedIngredients[1]) : [],
        spiceLevel: (storedSpiceLevel[1] as SpiceLevel) || 'medium',
        cuisineTypes: storedCuisineTypes[1] ? JSON.parse(storedCuisineTypes[1]) : [],
        cookingTimeLimit: storedCookingTimeLimit[1] ? parseInt(storedCookingTimeLimit[1], 10) : 0,
        maxCalories: storedMaxCalories[1] ? parseInt(storedMaxCalories[1], 10) : 0,
        portionSize: (storedPortionSize[1] as PortionSize) || 'couple',
        microPreferences: storedMicroPreferences[1] ? JSON.parse(storedMicroPreferences[1]) : []
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
    cookingTimeLimit: state.cookingTimeLimit,
    maxCalories: state.maxCalories,
    portionSize: state.portionSize,
    microPreferences: state.microPreferences
  }));
}; 