import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DietaryProfile, SpiceLevel } from './preferencesStore';

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

export type MealPreference = 'quickMeals' | 'familyFriendly' | 'budgetFriendly' | 'singleServing';

interface OnboardingState {
  // User personal info
  name: string;
  email: string;
  
  // Onboarding navigation
  currentStep: number;
  hasCompletedOnboarding: boolean;
  
  // Dietary preferences from onboarding
  dietaryPreferences: DietaryProfile[];
  mealPreferences: MealPreference[];
  spicePreference: SpiceLevel;
  
  // Actions
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setDietaryPreferences: (prefs: DietaryProfile[]) => void;
  setMealPreferences: (prefs: MealPreference[]) => void;
  setSpicePreference: (pref: SpiceLevel) => void;

  // Permissions
  cameraPermissionGranted: boolean;
  microphonePermissionGranted: boolean;
  setCameraPermissionGranted: (granted: boolean) => void;
  setMicrophonePermissionGranted: (granted: boolean) => void;
}

// Create the store
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Default values
      name: '',
      email: '',
      currentStep: 0,
      hasCompletedOnboarding: false,
      dietaryPreferences: [],
      mealPreferences: [],
      spicePreference: 'medium',
      cameraPermissionGranted: false,
      microphonePermissionGranted: false,
      
      // Actions
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      
      nextStep: () => set((state) => ({ 
        currentStep: state.currentStep + 1 
      })),
      
      previousStep: () => set((state) => ({ 
        currentStep: Math.max(0, state.currentStep - 1) 
      })),
      
      goToStep: (step) => set({ 
        currentStep: step 
      }),
// inside completeOnboarding
      completeOnboarding: async () => {
        // 1. update zustand state
        set({ hasCompletedOnboarding: true });
        // 2. keep the helper in sync for legacy callers
        try {
          await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
        } catch (err) {
          console.warn('[onboardingStore] Failed to persist ONBOARDING_COMPLETED_KEY', err);
        }
      },
      
resetOnboarding: () => set({ 
         currentStep: 0,
         hasCompletedOnboarding: false,
        name: '',
        email: '',
         dietaryPreferences: [],
         mealPreferences: [],
         spicePreference: 'medium',
        cameraPermissionGranted: false,
        microphonePermissionGranted: false,
       }),
      
      setDietaryPreferences: (prefs) => set({ 
        dietaryPreferences: prefs 
      }),
      
      setMealPreferences: (prefs) => set({ 
        mealPreferences: prefs 
      }),
      
      setSpicePreference: (pref) => set({ 
        spicePreference: pref 
      }),
      setCameraPermissionGranted: (granted) => set({ cameraPermissionGranted: granted }),
      setMicrophonePermissionGranted: (granted) => set({ microphonePermissionGranted: granted }),
    }),
    {
      name: 'onboarding-storage',
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
