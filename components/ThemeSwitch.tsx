import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';

interface ThemeSwitchProps {
  onThemeChange?: (isDarkMode: boolean) => void;
}

export default function ThemeSwitch({ onThemeChange }: ThemeSwitchProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load the user's theme preference on component mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('darkMode');
        if (savedPreference !== null) {
          const prefersDark = savedPreference === 'true';
          setIsDarkMode(prefersDark);
          
          // Notify parent if needed
          if (onThemeChange) {
            onThemeChange(prefersDark);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, [onThemeChange]);

  // Toggle the theme and save the preference
  const toggleTheme = async (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsDarkMode(value);
    
    try {
      await AsyncStorage.setItem('darkMode', value.toString());
      
      // Notify parent if needed
      if (onThemeChange) {
        onThemeChange(value);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dark Mode</Text>
      <Switch
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : isDarkMode ? colors.primary : '#f4f3f4'}
        ios_backgroundColor={colors.border}
        onValueChange={toggleTheme}
        value={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins-Regular',
  },
}); 