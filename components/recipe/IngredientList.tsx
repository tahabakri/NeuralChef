import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  servings: number;
}

const IngredientList = ({ ingredients, servings }: IngredientListProps) => {
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  
  const toggleIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedIngredients(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  if (!ingredients || ingredients.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView
          source={require('@/assets/animations/empty-state.json')}
          autoPlay
          loop
          style={styles.emptyAnimation}
        />
        <Text style={styles.emptyText}>No ingredients available</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {ingredients.map((ingredient, index) => {
        const isChecked = checkedIngredients.includes(index);
        // Animation values
        const checkScale = useSharedValue(isChecked ? 1 : 0);

        const checkmarkAnimatedStyle = useAnimatedStyle(() => {
          return {
            transform: [{ scale: checkScale.value }],
            opacity: checkScale.value,
          };
        });

        // Update animation when checked state changes
        React.useEffect(() => {
          if (isChecked) {
            checkScale.value = withSequence(
              withTiming(0.8, { duration: 50 }),
              withTiming(1, { duration: 200 })
            );
          } else {
            checkScale.value = withTiming(0, { duration: 150 });
          }
        }, [isChecked]);
        
        return (
          <TouchableOpacity
            key={`${ingredient.name}-${index}`}
            style={[
              styles.ingredientItem,
              index % 2 === 1 && styles.zebraStripe,
              isChecked && styles.checkedItem
            ]}
            onPress={() => toggleIngredient(index)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <View style={[
              styles.checkbox,
              isChecked && styles.checkboxChecked
            ]}>
              <Animated.View style={checkmarkAnimatedStyle}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </Animated.View>
            </View>
            
            <View style={styles.ingredientContent}>
              <Text style={[
                styles.ingredientName,
                isChecked && styles.ingredientChecked
              ]}>
                {ingredient.name}
              </Text>
              
              <Text style={[
                styles.ingredientQuantity,
                isChecked && styles.ingredientChecked
              ]}>
                {ingredient.quantity} {ingredient.unit}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  zebraStripe: {
    backgroundColor: colors.softPeachStart,
  },
  checkedItem: {
    backgroundColor: colors.softPeachEnd,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientName: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: 2,
  },
  ingredientChecked: {
    color: colors.textSecondary,
    opacity: 0.7,
  },
  ingredientQuantity: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyAnimation: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});

export default IngredientList; 