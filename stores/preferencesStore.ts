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

export interface PreferencesState {
  dietaryPreference: DietaryPreference;
  setDietaryPreference: (preference: DietaryPreference) => Promise<void>;
  loadPreferences: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  dietaryPreference: 'all',
  
  setDietaryPreference: async (preference) => {
    try {
      await AsyncStorage.setItem('dietaryPreference', preference);
      set({ dietaryPreference: preference });
    } catch (error) {
      console.error('Failed to save dietary preference:', error);
    }
  },
  
  loadPreferences: async () => {
    try {
      const storedPreference = await AsyncStorage.getItem('dietaryPreference');
      if (storedPreference) {
        set({ dietaryPreference: storedPreference as DietaryPreference });
      }
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
  
  return usePreferencesStore(state => state.dietaryPreference);
}; 