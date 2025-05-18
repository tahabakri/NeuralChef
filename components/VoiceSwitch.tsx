import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';

interface VoiceSwitchProps {
  onVoiceAssistantChange?: (enabled: boolean) => void;
}

export default function VoiceSwitch({ onVoiceAssistantChange }: VoiceSwitchProps) {
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(true);

  // Load the user's voice assistant preference on component mount
  useEffect(() => {
    const loadVoiceAssistantPreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('voiceAssistantEnabled');
        if (savedPreference !== null) {
          const enabled = savedPreference === 'true';
          setVoiceAssistantEnabled(enabled);
          
          // Notify parent if needed
          if (onVoiceAssistantChange) {
            onVoiceAssistantChange(enabled);
          }
        }
      } catch (error) {
        console.error('Error loading voice assistant preference:', error);
      }
    };

    loadVoiceAssistantPreference();
  }, [onVoiceAssistantChange]);

  // Toggle voice assistant and save the preference
  const toggleVoiceAssistant = async (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setVoiceAssistantEnabled(value);
    
    try {
      await AsyncStorage.setItem('voiceAssistantEnabled', value.toString());
      
      // Notify parent if needed
      if (onVoiceAssistantChange) {
        onVoiceAssistantChange(value);
      }
    } catch (error) {
      console.error('Error saving voice assistant preference:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Voice Assistant</Text>
      <Switch
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : voiceAssistantEnabled ? colors.primary : '#f4f3f4'}
        ios_backgroundColor={colors.border}
        onValueChange={toggleVoiceAssistant}
        value={voiceAssistantEnabled}
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