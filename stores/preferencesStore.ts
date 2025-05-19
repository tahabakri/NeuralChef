import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';

export type DietaryPreference = 'No Restrictions' | 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Dairy-Free' | 'Keto' | 'Paleo' | 'Low-Carb';

export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy';

export type PortionSize = 'Small' | 'Medium' | 'Large' | 'Extra Large';

export type MicroPreference = 'High Protein' | 'Low Fat' | 'Low Sodium' | 'Low Sugar' | 'High Fiber';

export type CookingGoal = 'Meal Prep' | 'Quick Meals' | 'Weight Loss' | 'Building Muscle' | 'Energy Boost';

export interface PreferencesState {
  dietaryPreferences: DietaryPreference[]; // Changed from singular to plural
  allergies: string[];
  dislikedIngredients: string[];
  spiceLevel: SpiceLevel;
  cuisineTypes: string[];
  cookingTimeLimit: number; // in minutes, 0 means no limit
  maxCalories: number; // per serving, 0 means no limit
  portionSize: PortionSize;
  microPreferences: MicroPreference[];
  cookingGoals: CookingGoal[];
  mealTimePreference: string;

  setDietaryPreferences: (preferences: DietaryPreference[]) => void; // Changed from singular to plural
  setAllergies: (allergies: string[]) => void;
  setDislikedIngredients: (ingredients: string[]) => void;
  setSpiceLevel: (level: SpiceLevel) => void;
  setCuisineTypes: (cuisines: string[]) => void;
  setCookingTimeLimit: (limit: number) => void;
  setMaxCalories: (calories: number) => void;
  setPortionSize: (size: PortionSize) => void;
  setMicroPreferences: (preferences: MicroPreference[]) => void;
  setCookingGoals: (goals: CookingGoal[]) => void;
  setMealTimePreference: (preference: string) => void;
  resetPreferences: () => void;
  loadPreferences: () => Promise<void>;
}

const defaultPreferences = {
  dietaryPreferences: ['No Restrictions'] as DietaryPreference[], // Changed to array
  allergies: [],
  dislikedIngredients: [],
  spiceLevel: 'Medium' as SpiceLevel,
  cuisineTypes: [],
  cookingTimeLimit: 30, // 30 minutes by default
  maxCalories: 0, // No limit by default
  portionSize: 'Medium' as PortionSize,
  microPreferences: [],
  cookingGoals: [],
  mealTimePreference: '',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      
      setDietaryPreferences: (preferences) => set({ dietaryPreferences: preferences }), // Changed from singular to plural
      setAllergies: (allergies) => set({ allergies }),
      setDislikedIngredients: (ingredients) => set({ dislikedIngredients: ingredients }),
      setSpiceLevel: (level) => set({ spiceLevel: level }),
      setCuisineTypes: (cuisines) => set({ cuisineTypes: cuisines }),
      setCookingTimeLimit: (limit) => set({ cookingTimeLimit: limit }),
      setMaxCalories: (calories) => set({ maxCalories: calories }),
      setPortionSize: (size) => set({ portionSize: size }),
      setMicroPreferences: (preferences) => set({ microPreferences: preferences }),
      setCookingGoals: (goals) => set({ cookingGoals: goals }),
      setMealTimePreference: (preference) => set({ mealTimePreference: preference }),
      
      resetPreferences: () => set({ ...defaultPreferences }),
      
      loadPreferences: async () => {
        try {
          const [
            storedPreferences, // Changed from singular
            storedAllergies,
            storedDislikedIngredients,
            storedSpiceLevel,
            storedCuisineTypes,
            storedCookingTimeLimit,
            storedMaxCalories,
            storedPortionSize,
            storedMicroPreferences,
            storedCookingGoals,
            storedMealTimePreference
          ] = await AsyncStorage.multiGet([
            'dietaryPreference',
            'allergies',
            'dislikedIngredients',
            'spiceLevel',
            'cuisineTypes',
            'cookingTimeLimit',
            'maxCalories',
            'portionSize',
            'microPreferences',
            'cookingGoals',
            'mealTimePreference'
          ]);
          
          set({
            dietaryPreferences: storedPreferences[1] ? JSON.parse(storedPreferences[1]) : ['No Restrictions'], // Changed from singular
            allergies: storedAllergies[1] ? JSON.parse(storedAllergies[1]) : [],
            dislikedIngredients: storedDislikedIngredients[1] ? JSON.parse(storedDislikedIngredients[1]) : [],
            spiceLevel: (storedSpiceLevel[1] as SpiceLevel) || 'Medium',
            cuisineTypes: storedCuisineTypes[1] ? JSON.parse(storedCuisineTypes[1]) : [],
            cookingTimeLimit: storedCookingTimeLimit[1] ? parseInt(storedCookingTimeLimit[1], 10) : 0,
            maxCalories: storedMaxCalories[1] ? parseInt(storedMaxCalories[1], 10) : 0,
            portionSize: (storedPortionSize[1] as PortionSize) || 'Medium',
            microPreferences: storedMicroPreferences[1] ? JSON.parse(storedMicroPreferences[1]) : [],
            cookingGoals: storedCookingGoals[1] ? JSON.parse(storedCookingGoals[1]) : [],
            mealTimePreference: storedMealTimePreference[1] || ''
          });
        } catch (error) {
          console.error('Failed to load preferences:', error);
        }
      },
    }),
    {
      name: 'recipe-preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useLoadPreferences = () => {
  const loadPreferences = usePreferencesStore(state => state.loadPreferences);
  
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);
  
  return usePreferencesStore(state => ({
    dietaryPreferences: state.dietaryPreferences, // Changed from singular
    allergies: state.allergies,
    dislikedIngredients: state.dislikedIngredients,
    spiceLevel: state.spiceLevel,
    cuisineTypes: state.cuisineTypes,
    cookingTimeLimit: state.cookingTimeLimit,
    maxCalories: state.maxCalories,
    portionSize: state.portionSize,
    microPreferences: state.microPreferences,
    cookingGoals: state.cookingGoals,
    mealTimePreference: state.mealTimePreference
  }));
};

export const getDietaryPreferences = (): DietaryPreference[] => [
  'No Restrictions',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
];

export const getSpiceLevels = (): SpiceLevel[] => [
  'Mild',
  'Medium',
  'Spicy',
  'Extra Spicy'
];

export const getPortionSizes = (): PortionSize[] => [
  'Small',
  'Medium',
  'Large',
  'Extra Large'
];

export const getMicroPreferences = (): MicroPreference[] => [
  'High Protein',
  'Low Fat',
  'Low Sodium',
  'Low Sugar',
  'High Fiber'
];

export const getCookingGoals = (): CookingGoal[] => [
  'Meal Prep',
  'Quick Meals',
  'Weight Loss',
  'Building Muscle',
  'Energy Boost'
];

export const getCommonAllergies = (): string[] => [
  'Peanuts', 
  'Tree nuts', 
  'Milk', 
  'Eggs', 
  'Fish', 
  'Shellfish', 
  'Wheat', 
  'Soy', 
  'Sesame'
];

export const getPopularCuisines = (): string[] => [
  'Italian', 
  'Chinese', 
  'Mexican', 
  'Indian', 
  'Japanese', 
  'Thai', 
  'French', 
  'Mediterranean',
  'American', 
  'Korean', 
  'Middle Eastern', 
  'Greek',
  'Vietnamese', 
  'Spanish'
];
