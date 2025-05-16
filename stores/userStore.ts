import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

interface UserProfile {
  name: string;
  email: string;
  profileImage?: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: UserProfile) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updateProfileImage: (imageUri: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  clearProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  setProfile: async (profile) => {
    try {
      set({ isLoading: true, error: null });
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      set({ profile, isLoading: false });
    } catch (error) {
      console.error('Failed to save user profile:', error);
      set({ error: 'Failed to save user profile', isLoading: false });
    }
  },

  updateName: async (name) => {
    try {
      const { profile } = get();
      if (!profile) return;
      
      const updatedProfile = { ...profile, name };
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      set({ profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update user name:', error);
      set({ error: 'Failed to update user name' });
    }
  },

  updateEmail: async (email) => {
    try {
      const { profile } = get();
      if (!profile) return;
      
      const updatedProfile = { ...profile, email };
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      set({ profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update user email:', error);
      set({ error: 'Failed to update user email' });
    }
  },

  updateProfileImage: async (imageUri) => {
    try {
      const { profile } = get();
      if (!profile) return;
      
      const updatedProfile = { ...profile, profileImage: imageUri };
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      set({ profile: updatedProfile });
    } catch (error) {
      console.error('Failed to update profile image:', error);
      set({ error: 'Failed to update profile image' });
    }
  },

  loadProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const storedProfile = await AsyncStorage.getItem('userProfile');
      
      if (storedProfile) {
        set({ profile: JSON.parse(storedProfile), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      set({ error: 'Failed to load user profile', isLoading: false });
    }
  },

  clearProfile: async () => {
    try {
      await AsyncStorage.removeItem('userProfile');
      set({ profile: null });
    } catch (error) {
      console.error('Failed to clear user profile:', error);
      set({ error: 'Failed to clear user profile' });
    }
  },
}));

// Helper hook to load user profile on component mount
export const useLoadUserProfile = () => {
  const loadProfile = useUserStore(state => state.loadProfile);
  const profile = useUserStore(state => state.profile);
  
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  
  return profile;
}; 