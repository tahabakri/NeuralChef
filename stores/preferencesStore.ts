import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';

export type DietaryProfile = 
  | 'noRestrictions' 
  | 'vegetarian' 
  | 'vegan' 
  | 'pescatarian' 
  | 'paleo' 
  | 'keto' 
  | 'lowCarb' 
  | 'glutenFree' 
  | 'dairyFree';

export type SpiceLevel = 'none' | 'mild' | 'medium' | 'spicy' | 'extraSpicy';
export type PortionSize = 'single' | 'couple' | 'family' | 'large';
export type MicroPreference = 'highProtein' | 'lowFat' | 'lowSodium' | 'highFiber' | 'lowSugar';
export type CookingGoal = 'mealPrep' | 'quickWeeknight' | 'weightLoss' | 'newTechniques' | 'impressGuests';

export interface PreferencesState {
  dietaryProfile: DietaryProfile;
  allergies: string[];
  dislikedIngredients: string[];
  spiceLevel: SpiceLevel;
  cuisineTypes: string[];
  cookingTimeLimit: number; // In minutes, 0 for no limit
  maxCalories: number; // 0 for no limit
  portionSize: PortionSize;
  microPreferences: MicroPreference[];
  cookingGoals: CookingGoal[];
  mealTimePreference: string;

  updatePreferences: (preferences: Partial<Omit<PreferencesState, 'updatePreferences' | 'resetPreferences'>>) => void;
  resetPreferences: () => void;
  loadPreferences: () => Promise<void>;
}

const defaultPreferences = {
  dietaryProfile: 'noRestrictions' as DietaryProfile,
  allergies: [],
  dislikedIngredients: [],
  spiceLevel: 'medium' as SpiceLevel,
  cuisineTypes: [],
  cookingTimeLimit: 0,
  maxCalories: 0,
  portionSize: 'family' as PortionSize,
  microPreferences: [],
  cookingGoals: [],
  mealTimePreference: '',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      
      updatePreferences: (preferences) =>
        set((state) => ({
          ...state,
          ...preferences,
        })),
      
      resetPreferences: () =>
        set(() => ({
          ...defaultPreferences,
        })),
      
      loadPreferences: async () => {
        try {
          const [
            storedPreferences,
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
            'dietaryProfile',
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
            dietaryProfile: storedPreferences[1] as DietaryProfile || 'noRestrictions',
            allergies: storedAllergies[1] ? JSON.parse(storedAllergies[1]) : [],
            dislikedIngredients: storedDislikedIngredients[1] ? JSON.parse(storedDislikedIngredients[1]) : [],
            spiceLevel: (storedSpiceLevel[1] as SpiceLevel) || 'medium',
            cuisineTypes: storedCuisineTypes[1] ? JSON.parse(storedCuisineTypes[1]) : [],
            cookingTimeLimit: storedCookingTimeLimit[1] ? parseInt(storedCookingTimeLimit[1], 10) : 0,
            maxCalories: storedMaxCalories[1] ? parseInt(storedMaxCalories[1], 10) : 0,
            portionSize: (storedPortionSize[1] as PortionSize) || 'family',
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
      name: 'preferences-storage',
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
    dietaryProfile: state.dietaryProfile,
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

export const getDietaryProfiles = (): DietaryProfile[] => [
  'noRestrictions',
  'vegetarian',
  'vegan',
  'pescatarian',
  'paleo',
  'keto',
  'lowCarb',
  'glutenFree',
  'dairyFree',
];

export const getSpiceLevels = (): SpiceLevel[] => [
  'none',
  'mild',
  'medium',
  'spicy',
  'extraSpicy',
];

export const getPortionSizes = (): PortionSize[] => [
  'single',
  'couple',
  'family',
  'large',
];

export const getMicroPreferences = (): MicroPreference[] => [
  'highProtein',
  'lowFat',
  'lowSodium',
  'highFiber',
  'lowSugar',
];

export const getCookingGoals = (): CookingGoal[] => [
  'mealPrep',
  'quickWeeknight',
  'weightLoss',
  'newTechniques',
  'impressGuests',
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
