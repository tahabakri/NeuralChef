import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

// Keys for AsyncStorage
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const DIETARY_PREFERENCES_KEY = 'dietary_preferences';

// Types
export type DietaryPreference = 
  | 'vegetarian' 
  | 'vegan' 
  | 'glutenFree' 
  | 'dairyFree' 
  | 'keto' 
  | 'lowCarb' 
  | 'paleo'
  | 'lowFat';

export type MealPreference = 
  | 'quickMeals' 
  | 'familyFriendly' 
  | 'budgetFriendly' 
  | 'singleServing';

interface OnboardingState {
  // Onboarding status
  onboardingComplete: boolean;
  
  // User preferences
  dietaryPreferences: DietaryPreference[];
  mealPreferences: MealPreference[];
  
  // Camera/Microphone permissions
  cameraPermission: boolean;
  microphonePermission: boolean;
  
  // Actions
  setOnboardingComplete: (complete: boolean) => void;
  setDietaryPreferences: (preferences: DietaryPreference[]) => void;
  setMealPreferences: (preferences: MealPreference[]) => void;
  setCameraPermission: (granted: boolean) => void;
  setMicrophonePermission: (granted: boolean) => void;
  
  // For testing/debugging
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Initial state
      onboardingComplete: false,
      dietaryPreferences: [],
      mealPreferences: [],
      cameraPermission: false,
      microphonePermission: false,
      
      // Actions
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      
      setDietaryPreferences: (preferences) => set({ dietaryPreferences: preferences }),
      
      setMealPreferences: (preferences) => set({ mealPreferences: preferences }),
      
      setCameraPermission: (granted) => set({ cameraPermission: granted }),
      
      setMicrophonePermission: (granted) => set({ microphonePermission: granted }),
      
      resetOnboarding: () => set({
        onboardingComplete: false,
        dietaryPreferences: [],
        mealPreferences: [],
        cameraPermission: false,
        microphonePermission: false,
      }),
    }),
    {
      name: 'reciptai-onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to check if onboarding is completed
export const checkOnboardingStatus = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}; 