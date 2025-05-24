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
  interface DifficultyDisplayData {
    bgColor: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    textColor: string;
  }

  const getDifficultyData = (): DifficultyDisplayData => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return {
          bgColor: colors.tagBackground || '#E6F5EA', // Fallback light green
          iconName: 'leaf-outline',
          iconColor: colors.success,
          textColor: colors.success,
        };
      case 'medium':
        return {
          bgColor: colors.accentOrangeLight || '#FFEEDA', // Fallback light orange
          iconName: 'flash-outline',
          iconColor: colors.accentOrange,
          textColor: colors.accentOrange,
        };
      case 'hard':
        return {
          bgColor: colors.errorLight || '#FFD6D6', // Fallback light red
          iconName: 'flame-outline',
          iconColor: colors.error,
          textColor: colors.error,
        };
      default:
        return {
          bgColor: colors.border,
          iconName: 'help-circle-outline',
          iconColor: colors.textSecondary,
          textColor: colors.textSecondary,
        };
    }
  };
  
  const difficultyData = getDifficultyData();
  
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <LinearGradient
          colors={[colors.orangeAccentStart, colors.orangeAccentEnd]} // Updated gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleUnderline}
        />
      </View>
      
      <View style={styles.metaContainer}>
        {/* Difficulty */}
        <View style={styles.metaItem}>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyData.bgColor }]}>
            <Ionicons name={difficultyData.iconName} size={14} color={difficultyData.iconColor} style={styles.difficultyIcon} />
            <Text style={[styles.difficultyText, { color: difficultyData.textColor }]}>{difficulty}</Text>
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
              <Ionicons name="star-outline" size={16} color={colors.textSecondary} />
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
    ...typography.heading1, // Provides size (e.g., fontSize.huge)
    fontFamily: 'Poppins-Bold', // Explicitly Poppins-Bold
    color: colors.text,
    marginBottom: 8,
  },
  titleUnderline: {
    height: 3, // Slightly thicker
    marginBottom: 16, // More space after underline
    width: '40%', // Slightly wider
    borderRadius: 1.5,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
    alignItems: 'center', // Vertically align items in the row
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16, // Spacing between meta items
    marginBottom: 8, // Spacing if items wrap
  },
  metaIconContainer: {
    // Removed fixed width/height to let icon size dictate
    marginRight: 4, // Space between icon and text
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaText: {
    ...typography.bodyMedium, // OpenSans-Regular, 16px
    color: colors.textSecondary,
    // marginLeft: 6, // Removed, using marginRight on icon container
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, // More horizontal padding for pill shape
    paddingVertical: 5,   // More vertical padding
    borderRadius: 16,     // More rounded corners for pill shape
  },
  difficultyIcon: {
    // fontSize: 10, // Size is now controlled by Ionicons size prop
    marginRight: 6, // Increased space between icon and text
  },
  difficultyText: {
    ...typography.bodySmall, // OpenSans-Regular, 14px
    fontFamily: 'OpenSans-SemiBold', // Make difficulty text slightly bolder
    // color: colors.white, // Color is now dynamic
  },
});

export default RecipeHeader;
