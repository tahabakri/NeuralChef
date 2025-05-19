import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export type Language = 'en' | 'ar'; // English and Arabic support

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  createdAt: number;
  language?: Language; // User's preferred language
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  language: Language; // Current app language
  
  // Authentication actions
  signIn: (email: string, password: string, name?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => void;
  
  // Language settings
  setLanguage: (language: Language) => void;
}

// Create the user store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      authToken: null,
      language: 'en', // Default to English
      
      // Actions
      signIn: async (email: string, password: string, name?: string) => {
        // In a real app, this would be an API call to authenticate
        // For demo, simulate successful authentication if email and password meet criteria
        
        if (!email) {
          throw new Error('Email is required');
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (name) {
          // This is a social sign-in with name provided
          const user: User = {
            id: `user_${Date.now()}`,
            email,
            name,
            createdAt: Date.now(),
          };
          
          set({
            user,
            isAuthenticated: true,
            authToken: `mock_token_${Date.now()}`
          });
          
          return;
        }
        
        // For email/password sign in, validate password
        if (!password || password.length < 6) {
          throw new Error('Invalid email or password');
        }
        
        // For demo, create a mock user with email
        const user: User = {
          id: `user_${Date.now()}`,
          email,
          name: email.split('@')[0], // Use part of email as name
          createdAt: Date.now(),
        };
        
        set({
          user,
          isAuthenticated: true,
          authToken: `mock_token_${Date.now()}`
        });
      },
      
      signUp: async (email: string, password: string, name: string) => {
        // In a real app, this would be an API call to register
        // For demo, validate input and simulate successful registration
        
        if (!email || !email.includes('@')) {
          throw new Error('Valid email is required');
        }
        
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        if (!name.trim()) {
          throw new Error('Name is required');
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo, create a mock user
        const user: User = {
          id: `user_${Date.now()}`,
          email,
          name,
          createdAt: Date.now(),
        };
        
        set({
          user,
          isAuthenticated: true,
          authToken: `mock_token_${Date.now()}`
        });
      },
      
      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          authToken: null
        });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },
      
      // Language settings
      setLanguage: (language) => {
        set((state) => {
          // Update both the app-wide language setting and the user's preference if logged in
          if (state.user) {
            return {
              language,
              user: { ...state.user, language }
            };
          }
          return { language };
        });
      },
    }),
    {
      name: 'reciptai-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper hook to load user profile on component mount
export const useLoadUserProfile = () => {
  const loadProfile = useUserStore(state => state.loadProfile);
  const profile = useUserStore(state => state.profile);
  
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  
  return profile;
}; 