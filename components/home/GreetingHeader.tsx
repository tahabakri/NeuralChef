import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/stores/userStore';
import BackArrow from '@/components/BackArrow';
import { useUndoStore } from '@/stores/undoStore';
import { usePathname } from 'expo-router';

export interface GreetingHeaderProps {
  onGetStartedPress?: () => void;
  showMessage?: boolean;
  name?: string; // Explicit name prop for personalization
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ 
  onGetStartedPress,
  showMessage = false,
  name
}) => {
  const [greeting, setGreeting] = useState('Good morning');
  const { user } = useUserStore();
  // Use provided name prop first, fallback to user's name from store
  const userName = name || (user?.name ? user.name.split(' ')[0] : '');
  const pathname = usePathname();
  const setCurrentScreen = useUndoStore(state => state.setCurrentScreen);
  
  useEffect(() => {
    // Set greeting based on time of day
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
    
    // Set current screen for undo functionality
    setCurrentScreen('home');
  }, [setCurrentScreen]);

  return (
    <View style={styles.container}>
      <BackArrow />
      <Text style={styles.greeting}>
        {greeting}{userName ? `, ${userName}` : ''}!
      </Text>
      <Text style={styles.subtitle}>
        What would you like to cook today?
      </Text>
      {showMessage && (
        <Text style={styles.messageText}>
          Let's cook something amazing tonight!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginTop: 8,
  },
  greeting: {
    ...typography.title2, // Using title2 as it matches the greeting title style
    color: colors.text, // Using text as textPrimary
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    ...typography.bodyLarge, // Using bodyLarge as it matches the greeting subtitle style
    color: colors.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default GreetingHeader;
