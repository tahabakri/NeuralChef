import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface NutritionalValue {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  [key: string]: number; // For additional nutrition facts
}

interface NutritionalInfoProps {
  nutritionalInfo: NutritionalValue;
}

const NutritionalInfo = ({ nutritionalInfo }: NutritionalInfoProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };
  
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: withTiming(expanded ? 500 : 0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      opacity: withTiming(expanded ? 1 : 0, {
        duration: expanded ? 300 : 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    };
  });
  
  // Get all nutrition keys except the main ones that we display separately
  const additionalNutrition = Object.keys(nutritionalInfo)
    .filter(key => !['calories', 'protein', 'carbs', 'fat'].includes(key));
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Nutritional Information</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      
      {/* Always visible nutrition summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Calories</Text>
          <Text style={styles.nutritionValue}>{nutritionalInfo.calories}</Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Protein</Text>
          <Text style={styles.nutritionValue}>{nutritionalInfo.protein}g</Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Carbs</Text>
          <Text style={styles.nutritionValue}>{nutritionalInfo.carbs}g</Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Fat</Text>
          <Text style={styles.nutritionValue}>{nutritionalInfo.fat}g</Text>
        </View>
      </View>
      
      {/* Expandable detailed nutrition */}
      <Animated.View style={[styles.detailsContainer, contentAnimatedStyle]}>
        <View style={styles.divider} />
        
        {additionalNutrition.map((key) => (
          <View key={key} style={styles.detailItem}>
            <Text style={styles.detailLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </Text>
            <Text style={styles.detailValue}>
              {nutritionalInfo[key]}
              {typeof nutritionalInfo[key] === 'number' ? 'g' : ''}
            </Text>
          </View>
        ))}
        
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  nutritionLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nutritionValue: {
    ...typography.bodyLarge,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
  },
  detailsContainer: {
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
  },
  disclaimer: {
    padding: 16,
    backgroundColor: colors.cardAlt,
    marginTop: 16,
  },
  disclaimerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default NutritionalInfo; 