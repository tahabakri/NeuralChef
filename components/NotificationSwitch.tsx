import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';

interface NotificationSwitchProps {
  onNotificationChange?: (enabled: boolean) => void;
}

export default function NotificationSwitch({ onNotificationChange }: NotificationSwitchProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load the user's notification preference on component mount
  useEffect(() => {
    const loadNotificationPreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('notificationsEnabled');
        if (savedPreference !== null) {
          const enabled = savedPreference === 'true';
          setNotificationsEnabled(enabled);
          
          // Notify parent if needed
          if (onNotificationChange) {
            onNotificationChange(enabled);
          }
        }
      } catch (error) {
        console.error('Error loading notification preference:', error);
      }
    };

    loadNotificationPreference();
  }, [onNotificationChange]);

  // Toggle notifications and save the preference
  const toggleNotifications = async (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setNotificationsEnabled(value);
    
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
      
      // Notify parent if needed
      if (onNotificationChange) {
        onNotificationChange(value);
      }
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Notifications</Text>
      <Switch
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : notificationsEnabled ? colors.primary : '#f4f3f4'}
        ios_backgroundColor={colors.border}
        onValueChange={toggleNotifications}
        value={notificationsEnabled}
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