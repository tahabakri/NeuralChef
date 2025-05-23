import React, { useState } from 'react';
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
  recipeName: string; // e.g., "Creamy Broccoli Pasta"
  durationText: string; // e.g., "Ready in 20 minutes"
  imageUrl: string;
  onNavigate: () => void;
  onSaveRecipe?: (recipeName: string) => void;
  isSaved?: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high'; // For progress ring intensity
}

const QuickCookCard: React.FC<QuickCookCardProps> = ({
  recipeName,
  durationText,
  imageUrl,
  onNavigate,
  onSaveRecipe,
  isSaved = false,
  urgencyLevel = 'medium',
}) => {
  const [saved, setSaved] = useState(isSaved);

  const handleSavePress = () => {
    setSaved(!saved);
    onSaveRecipe?.(recipeName);
  };

  const getUrgencyIcon = () => {
    switch (urgencyLevel) {
      case 'high':
        return { name: 'flame' as const, color: '#FF6B6B' };
      case 'low':
        return { name: 'time-outline' as const, color: colors.white };
      default:
        return { name: 'flash' as const, color: '#FFD93D' };
    }
  };

  const urgencyIcon = getUrgencyIcon();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onNavigate}
      accessibilityLabel={`Quick recipe: ${recipeName}, ${durationText}`}
    >
      {/* Urgency Progress Ring */}
      <View style={styles.urgencyRing}>
        <View style={[styles.progressRing, styles[`${urgencyLevel}Urgency`]]} />
      </View>

      <View style={styles.leftContent}>
        <View style={styles.headerRow}>
          <Ionicons 
            name={urgencyIcon.name} 
            size={24} 
            color={urgencyIcon.color} 
            style={styles.icon} 
          />
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSavePress}
            accessibilityLabel={saved ? 'Remove from saved recipes' : 'Save recipe'}
          >

          </TouchableOpacity>
        </View>
        <Text style={styles.titleText}>Need food fast? Try this!</Text>
        <Text style={styles.recipeNameText}>{recipeName}</Text>
        <Text style={styles.durationText}>{durationText}</Text>
      </View>
      <View style={styles.rightContent}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          accessibilityLabel={`${recipeName} recipe image`}
        />
        <Ionicons name="arrow-forward-circle" size={28} color={colors.white} style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentOrange,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xl,
    marginHorizontal: spacing.lg,
    shadowColor: colors.shadow || '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  urgencyRing: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },
  progressRing: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 3,
  },
  lowUrgency: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mediumUrgency: {
    borderColor: '#FFD93D',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  highUrgency: {
    borderColor: '#FF6B6B',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  leftContent: {
    flex: 1, 
    marginRight: spacing.md, 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    // No additional margin needed since it's in a row
  },
  saveButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleText: {
    ...(typography.bodyMedium || typography.subtitle1),
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: 16,
  },
  recipeNameText: {
    ...(typography.title3 || typography.heading2),
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  durationText: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  arrowIcon: {
    marginLeft: spacing.md,
    opacity: 0.9,
  },
});

export default QuickCookCard;
