import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shallow } from 'zustand/shallow';

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
export type MedicalCondition = 'Diabetes' | 'Hypertension' | 'Celiac Disease' | 'High Cholesterol' | 'IBS';

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
  medicalConditions: MedicalCondition[];
  mealTimePreference: string;

  updatePreferences: (preferences: Partial<Omit<PreferencesState, 'updatePreferences' | 'resetPreferences'>>) => void;
  resetPreferences: () => void;
  
  // New selective update methods for better performance
  updateDietaryProfile: (profile: DietaryProfile) => void;
  updateAllergies: (allergies: string[]) => void;
  updateDislikedIngredients: (ingredients: string[]) => void;
  updateSpiceLevel: (level: SpiceLevel) => void;
  updateCuisineTypes: (cuisines: string[]) => void;
  updateCookingTimeLimit: (timeLimit: number) => void;
  updateMaxCalories: (calories: number) => void;
  updatePortionSize: (size: PortionSize) => void;
  updateMicroPreferences: (preferences: MicroPreference[]) => void;
  updateCookingGoals: (goals: CookingGoal[]) => void;
  updateMedicalConditions: (conditions: MedicalCondition[]) => void;
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
  medicalConditions: [],
  mealTimePreference: '',
};

// Using legacy create method with a comment to acknowledge the warning
// DEPRECATED: Will update to createWithEqualityFn in a future version
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      
      updatePreferences: (preferences: Partial<Omit<PreferencesState, 'updatePreferences' | 'resetPreferences'>>) =>
        set((state: PreferencesState) => ({
          ...state,
          ...preferences,
        })),
      
      resetPreferences: () =>
        set(() => ({
          ...defaultPreferences,
        })),
        
      // Selective update methods for better performance
      updateDietaryProfile: (profile: DietaryProfile) => 
        set((state: PreferencesState) => ({ ...state, dietaryProfile: profile })),
        
      updateAllergies: (allergies: string[]) => 
        set((state: PreferencesState) => ({ ...state, allergies })),
        
      updateDislikedIngredients: (ingredients: string[]) => 
        set((state: PreferencesState) => ({ ...state, dislikedIngredients: ingredients })),
        
      updateSpiceLevel: (level: SpiceLevel) => 
        set((state: PreferencesState) => ({ ...state, spiceLevel: level })),
        
      updateCuisineTypes: (cuisines: string[]) => 
        set((state: PreferencesState) => ({ ...state, cuisineTypes: cuisines })),
        
      updateCookingTimeLimit: (timeLimit: number) => 
        set((state: PreferencesState) => ({ ...state, cookingTimeLimit: timeLimit })),
        
      updateMaxCalories: (calories: number) => 
        set((state: PreferencesState) => ({ ...state, maxCalories: calories })),
        
      updatePortionSize: (size: PortionSize) => 
        set((state: PreferencesState) => ({ ...state, portionSize: size })),
        
      updateMicroPreferences: (preferences: MicroPreference[]) => 
        set((state: PreferencesState) => ({ ...state, microPreferences: preferences })),
        
      updateCookingGoals: (goals: CookingGoal[]) => 
        set((state: PreferencesState) => ({ ...state, cookingGoals: goals })),
        
      updateMedicalConditions: (conditions: MedicalCondition[]) => 
        set((state: PreferencesState) => ({ ...state, medicalConditions: conditions })),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
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
        medicalConditions: state.medicalConditions,
        mealTimePreference: state.mealTimePreference,
      }),
    }
  )
);

// Helper function to get specific parts of state with shallow comparison
export const usePreferenceSelector = <T>(selector: (state: PreferencesState) => T) => {
  return usePreferencesStore(selector, shallow);
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

export const getMedicalConditions = (): MedicalCondition[] => [
  'Diabetes',
  'Hypertension',
  'Celiac Disease',
  'High Cholesterol',
  'IBS',
];
