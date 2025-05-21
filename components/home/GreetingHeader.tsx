import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define the spacing values if not imported from a constants file
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface GreetingHeaderProps {
  greeting: string;
  subTitle: string;
  timestamp: string;
  userName?: string;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  greeting,
  subTitle,
  timestamp,
  userName,
}) => {
  return (
    <View style={styles.container}>
      {/* Decorative circle in the background */}
      <View style={styles.decorativeCircle} />
      
      {/* Main greeting text */}
      <Text style={styles.mainGreeting}>
        {greeting}{userName ? `, ${userName}` : ''}
      </Text>
      
      {/* Subtitle text */}
      <Text style={styles.subtitle}>
        {subTitle}
      </Text>
      
      {/* Timestamp text */}
      <Text style={styles.timestamp}>
        {timestamp}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1, // Ensure text is above the decorative circle
  },
  decorativeCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.secondary ? `${colors.secondary}33` : 'rgba(108, 196, 161, 0.2)', // Using colors.secondary with 20% opacity (33 hex) or fallback
    position: 'absolute',
    top: -spacing.xl,
    right: -spacing.xl,
    opacity: 0.7,
  },
  mainGreeting: {
    ...typography.title1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.title3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timestamp: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});

export default GreetingHeader; 