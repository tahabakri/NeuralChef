import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define spacing if not imported from constants
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  }
};

export interface WeatherSuggestionBannerProps {
  iconName: keyof typeof Ionicons.glyphMap;
  message: string;
  reason: string;
  onPress: () => void;
}

const WeatherSuggestionBanner: React.FC<WeatherSuggestionBannerProps> = ({
  iconName,
  message,
  reason,
  onPress
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${message}. ${reason}`}
      accessibilityHint="Opens recipe suggestion based on weather"
    >
      <Ionicons 
        name={iconName} 
        size={24} 
        color={colors.accentOrange} 
        style={styles.icon} 
      />
      
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>{message}</Text>
        <Text style={styles.reasonText}>{reason}</Text>
      </View>
      
      <Ionicons 
        name="chevron-forward-outline" 
        size={22} 
        color={colors.textTertiary} 
        style={styles.arrowIcon} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt, // Light peach/beige #FEF7F0
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  reasonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  arrowIcon: {
    marginLeft: spacing.sm,
  },
});

export default WeatherSuggestionBanner;
