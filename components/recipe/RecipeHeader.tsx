import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  // Get difficulty icon and color based on level
  const getDifficultyData = () => {
    switch (difficulty) {
      case 'Easy':
        return { color: colors.success, icon: '🟢' };
      case 'Medium':
        return { color: colors.warning, icon: '🟠' };
      case 'Hard':
        return { color: colors.error, icon: '🔴' };
      default:
        return { color: colors.textSecondary, icon: '⚪' };
    }
  };
  
  const difficultyData = getDifficultyData();
  
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <LinearGradient
          colors={[colors.softPeachStart, colors.softPeachEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleUnderline}
        />
      </View>
      
      <View style={styles.metaContainer}>
        {/* Difficulty */}
        <View style={styles.metaItem}>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyData.color }]}>
            <Text style={styles.difficultyIcon}>{difficultyData.icon}</Text>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>
        
        {/* Cook Time */}
        <View style={styles.metaItem}>
          <View style={styles.metaIconContainer}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.metaText}>{cookTime} min</Text>
        </View>
        
        {/* Servings */}
        <View style={styles.metaItem}>
          <View style={styles.metaIconContainer}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.metaText}>{servings} servings</Text>
        </View>
        
        {/* Rating */}
        {rating && (
          <View style={styles.metaItem}>
            <View style={styles.metaIconContainer}>
              <Ionicons name="star" size={16} color={colors.warning} />
            </View>
            <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 4,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 8,
  },
  titleUnderline: {
    height: 2,
    marginBottom: 12,
    width: '30%',
    borderRadius: 1,
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
  metaIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  metaText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  difficultyText: {
    ...typography.bodySmall,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
  },
});

export default RecipeHeader; 