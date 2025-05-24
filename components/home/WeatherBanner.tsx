import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

import { router } from 'expo-router';

// Define the spacing values if not imported from a constants file
// Assuming spacing.borderRadius.xl and spacing.lg are defined in your constants/spacing.ts
// If not, you might need to define them or import them.
// For this example, let's assume they exist or define placeholder values.
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24, // Used for padding and marginHorizontal
  xl: 32, // Used for marginTop (example value)
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20, // Used for banner borderRadius (example value)
  },
};

interface WeatherBannerProps {
  weatherCondition: string;
  recipeSuggestionText: string;
  weatherIconName: keyof typeof Ionicons.glyphMap;
  recipeIdToNavigate: string;
  // onPress prop is now implicitly handled by router.push
}

const WeatherBanner: React.FC<WeatherBannerProps> = ({
  weatherCondition,
  recipeSuggestionText,
  weatherIconName,
  recipeIdToNavigate,
}) => {
  const handlePress = () => {
    router.push(`/recipe/${recipeIdToNavigate}`);
  };

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={handlePress}
      accessibilityLabel={`${weatherCondition}. Suggestion: ${recipeSuggestionText}. Tap to view recipe.`}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={weatherIconName}
          size={30} // Increased size
          color={colors.accentOrange} // Example: accentOrange on light blue background
          style={styles.icon}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.weatherConditionText}>{weatherCondition}</Text>
        <Text style={styles.recipeSuggestionText}>{recipeSuggestionText}</Text>
      </View>
      <Ionicons
        name="chevron-forward-outline" // Using a simple chevron for now
        size={26} // Slightly larger arrow
        color={colors.textPrimary} // Contrasting color for arrow
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.accentBlueLight, // Using accentBlueLight
    borderRadius: spacing.borderRadius.xl, // More pronounced rounding
    padding: spacing.lg, // Larger padding
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl, // Larger top margin
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 }, // Adjusted shadow
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4, // Adjusted elevation
  },
  iconContainer: {
    // Optional: Add a circular background to the icon if desired
    // backgroundColor: colors.accentBlue, // Slightly darker blue for icon background
    // borderRadius: 20, // Make it circular
    // padding: spacing.xs, // Padding around the icon
    marginRight: spacing.md,
  },
  icon: {
    // Styles for the icon itself, if not covered by container
  },
  textContainer: {
    flex: 1,
  },
  weatherConditionText: {
    ...typography.subtitle1, // Poppins bold, larger
    color: colors.textDark, // Ensure contrast with accentBlueLight
    marginBottom: spacing.xs, // Space between condition and suggestion
  },
  recipeSuggestionText: {
    ...typography.bodyMedium, // OpenSans, engaging
    color: colors.textDark, // Ensure contrast
    // To highlight recipe name, you might need to parse the string or pass structured text
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});

export default WeatherBanner;
