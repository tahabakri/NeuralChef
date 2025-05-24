import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define the spacing values if not imported from a constants file
const spacing = {
  xs: 4, // Adjusted xs for more typical spacing
  sm: 8,
  md: 12, // Adjusted md for consistency
  lg: 16, // Adjusted lg for consistency
  xl: 24, // Adjusted xl for consistency
  borderRadius: {
    lg: 16, // Standard large border radius
    xl: 20, // Extra large border radius as per prompt
  }
};

interface QuickCookCardProps {
  introText: string;
  recipeName: string;
  durationText: string;
  imageUrl: string;
  onNavigate: () => void;
  // Removed onSaveRecipe, isSaved, urgencyLevel as per new design
}

const QuickCookCard: React.FC<QuickCookCardProps> = ({
  introText,
  recipeName,
  durationText,
  imageUrl,
  onNavigate,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onNavigate}
      accessibilityLabel={`${introText}: ${recipeName}, ${durationText}`}
      activeOpacity={0.8}
    >
      <View style={styles.leftContent}>
        <Text style={styles.iconText}>🔥</Text>
        <Text style={styles.introText}>{introText}</Text>
        <Text style={styles.recipeNameText}>{recipeName}</Text>
        <Text style={styles.durationText}>{durationText}</Text>
      </View>
      <View style={styles.rightContent}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          accessibilityLabel={`${recipeName} recipe image`}
        />
        <Ionicons name="arrow-forward-circle-outline" size={32} color={colors.accentOrange} style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentOrangeLight || '#FFF0E5', // Fallback if accentOrangeLight is not defined
    borderRadius: spacing.borderRadius.xl, // Using xl as per prompt
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xl,
    marginHorizontal: spacing.lg,
    shadowColor: colors.shadow || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  leftContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 22, // Approximate size for flame emoji
    marginBottom: spacing.xs,
    color: colors.accentOrange, // Should be visible on accentOrangeLight
  },
  introText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins-Regular', // Assuming Poppins is set up
    color: colors.accentOrange, // Using accentOrange as the darker shade
    marginBottom: spacing.xs,
  },
  recipeNameText: {
    ...typography.title2,
    fontFamily: 'Poppins-Bold', // Assuming Poppins is set up
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: typography.title2?.fontSize ? typography.title2.fontSize * 1.3 : 28, // Adjust line height
  },
  durationText: {
    ...typography.bodyMedium,
    fontFamily: 'Poppins-Regular', // Assuming Poppins is set up
    color: colors.textSecondary,
  },
  rightContent: {
    flexDirection: 'column', // Stack image and arrow vertically if needed, or adjust layout
    alignItems: 'center',
    justifyContent: 'center', // Center items in the right column
  },
  image: {
    width: 60, // Slightly smaller circular image
    height: 60,
    borderRadius: 30, // Half of width/height for circle
    backgroundColor: colors.background, // Placeholder bg
    marginBottom: spacing.sm, // Space between image and arrow
  },
  arrowIcon: {
    // marginLeft: spacing.md, // No longer needed if rightContent is column
  },
});

export default QuickCookCard;
