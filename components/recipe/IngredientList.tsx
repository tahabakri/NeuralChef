import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
        <Text style={styles.emptyText}>No ingredients available</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {ingredients.map((ingredient, index) => (
        <TouchableOpacity
          key={`${ingredient.name}-${index}`}
          style={styles.ingredientItem}
          onPress={() => toggleIngredient(index)}
        >
          <View style={[
            styles.checkbox,
            checkedIngredients.includes(index) && styles.checkboxChecked
          ]}>
            {checkedIngredients.includes(index) && (
              <Ionicons name="checkmark" size={12} color={colors.white} />
            )}
          </View>
          
          <View style={styles.ingredientContent}>
            <Text style={[
              styles.ingredientName,
              checkedIngredients.includes(index) && styles.ingredientChecked
            ]}>
              {ingredient.name}
            </Text>
            
            <Text style={styles.ingredientQuantity}>
              {ingredient.quantity} {ingredient.unit}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  ingredientQuantity: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});

export default IngredientList; 