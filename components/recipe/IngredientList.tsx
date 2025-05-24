import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  // servings: number; // Servings prop seems unused, removing for now
  // onAddToShoppingList?: () => void; // Removed
}

const IngredientList = ({ ingredients }: IngredientListProps) => { // Removed onAddToShoppingList from props
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    new Array(ingredients?.length || 0).fill(false)
  );

  if (!ingredients || ingredients.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No ingredients available</Text>
      </View>
    );
  }

  const toggleCheck = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };
  
  return (
    <View style={styles.container}>
      {/* {onAddToShoppingList && ( // Removed button
        <TouchableOpacity style={styles.shoppingListButton} onPress={onAddToShoppingList}>
          <Ionicons name="cart-outline" size={20} color={colors.primary} />
          <Text style={styles.shoppingListButtonText}>Add All to Shopping List</Text>
        </TouchableOpacity>
      )} */}
      {ingredients.map((ingredient, index) => (
        <View
          key={`${ingredient.name}-${index}`}
          style={styles.ingredientItem}
        >
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleCheck(index)}
          >
            <View
              style={[
                styles.checkbox,
                checkedIngredients[index] && styles.checkedCheckbox,
                !checkedIngredients[index] && styles.uncheckedCheckbox, // For orange border
              ]}
            >
              {checkedIngredients[index] && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>
          
          <View style={styles.ingredientContent}>
            <Text style={[styles.ingredientNameText, checkedIngredients[index] && styles.checkedIngredientText]}>
              {ingredient.name}
            </Text>
            {(ingredient.quantity || ingredient.unit) && (
              <Text style={[styles.ingredientQuantityText, checkedIngredients[index] && styles.checkedIngredientText]}>
                {ingredient.quantity}{ingredient.unit && ` ${ingredient.unit}`}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  // shoppingListButton: { // Styles removed
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   paddingVertical: spacing.md,
  //   paddingHorizontal: spacing.lg,
  //   backgroundColor: colors.primaryLight,
  //   borderRadius: spacing.borderRadius.md,
  //   marginBottom: spacing.md,
  //   alignSelf: 'center',
  // },
  // shoppingListButtonText: { // Styles removed
  //   ...typography.button,
  //   fontFamily: 'Poppins-Medium',
  //   color: colors.primary,
  //   marginLeft: spacing.sm,
  // },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center', // Align checkbox and text
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  checkboxContainer: {
    marginRight: spacing.md,
    padding: spacing.xs, // Increase tappable area
  },
  checkbox: {
    width: 24, // Slightly larger for better touch
    height: 24,
    borderRadius: 12, // Circular
    borderWidth: 2,
    // borderColor: colors.border, // Default border, will be overridden
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white, // Background for unchecked state
  },
  uncheckedCheckbox: {
    borderColor: colors.accentOrange, // Orange border for unchecked
  },
  checkedCheckbox: {
    backgroundColor: colors.success,
    borderColor: colors.success, // Green border for checked
  },
  ingredientContent: {
    flex: 1,
    justifyContent: 'center', // Align text vertically if needed
  },
  ingredientNameText: { // Renamed from ingredientText
    ...typography.bodyMedium, // Should be OpenSans 16px
    fontFamily: 'OpenSans-Regular',
    color: colors.text,
    // lineHeight: 22, // Default from typography or adjust as needed
  },
  ingredientQuantityText: {
    ...typography.bodySmall, // Smaller font for quantity, OpenSans 14px
    fontFamily: 'OpenSans-Regular',
    color: colors.textSecondary,
    marginTop: 4, // Small space between name and quantity (spacing.xxs was not defined)
  },
  checkedIngredientText: {
    textDecorationLine: 'line-through',
    opacity: 0.7, // Make it slightly faded
    // color: colors.textSecondary, // Already applied by default to quantity, name will inherit
  },
  // quantityText: { // Merged into ingredientQuantityText
  //   fontFamily: 'OpenSans-Semibold',
  //   color: colors.primary,
  // },
  // unitText: { // Merged into ingredientQuantityText
  //   fontFamily: 'OpenSans-Regular',
  //   color: colors.textSecondary,
  // },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    fontFamily: 'OpenSans-Regular',
    color: colors.textSecondary,
  },
});

export default IngredientList;
