import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define the spacing values if not imported from a constants file
const spacing = {
  xs: 1,
  sm: 8,
  md: 16,
  lg: 12,
  xl: 20,
  borderRadius: { // Added for consistency with prompt
    lg: 16,
  }
};

interface QuickCookCardProps {
  title: string; // e.g., "Quick Cook"
  recipeName: string; // e.g., "Try this Creamy Broccoli Pasta"
  durationText: string; // e.g., "Ready in 20 minutes"
  imageUrl: string;
  onNavigate: () => void;
}

const QuickCookCard: React.FC<QuickCookCardProps> = ({
  title,
  recipeName,
  durationText,
  imageUrl,
  onNavigate,
}) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onNavigate}
      accessibilityLabel={`${title}: ${recipeName}, ${durationText}`}
    >
      <View style={styles.leftContent}>
        <Ionicons name="flash-outline" size={24} color={colors.white} style={styles.icon} />
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.recipeNameText}>{recipeName}</Text>
        <Text style={styles.durationText}>{durationText}</Text>
      </View>
      <View style={styles.rightContent}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
        />
        <Ionicons name="arrow-forward-circle-outline" size={24} color={colors.white} style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentOrange, // Using consistent accent color from colors.ts
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xl,
    marginHorizontal: spacing.lg,
    shadowColor: colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 }, // Subtle shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  leftContent: {
    flex: 1, 
    marginRight: spacing.md, 
  },
  icon: {
    marginBottom: spacing.sm,
  },
  titleText: { // For "Quick Cook"
    ...(typography.bodyMedium || typography.subtitle1), // As per prompt: bodyMedium or new subtitle
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  recipeNameText: { // For "Try this Creamy Broccoli Pasta"
    ...(typography.title3 || typography.heading2), // As per prompt: title3 or heading2
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    // Assuming typography.title3 or heading2 handles line height appropriately for 2 lines.
    // If not, add lineHeight: (typography.title3?.fontSize || 20) * 1.2,
  },
  durationText: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35, // Circular image
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional: slight tint if image is transparent
  },
  arrowIcon: {
    marginLeft: spacing.md, // Adjusted from sm to md for a bit more space
  },
});

export default QuickCookCard;
