import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface RecipeHeaderProps {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookTime: number;
  servings: number;
  rating?: number;
}

const RecipeHeader = ({
  title,
  difficulty,
  cookTime,
  servings,
  rating
}: RecipeHeaderProps) => {
  // Get difficulty color based on level
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Easy':
        return colors.success;
      case 'Medium':
        return colors.warning;
      case 'Hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.metaContainer}>
        {/* Difficulty */}
        <View style={styles.metaItem}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>
        
        {/* Cook Time */}
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{cookTime} min</Text>
        </View>
        
        {/* Servings */}
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{servings} servings</Text>
        </View>
        
        {/* Rating */}
        {rating && (
          <View style={styles.metaItem}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    ...typography.bodySmall,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
  },
});

export default RecipeHeader; 