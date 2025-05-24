import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import colors from '@/constants/colors';
import { Ingredient } from '@/types/recipe'; // Import Ingredient type

interface IngredientListProps {
  ingredients: Ingredient[]; // Changed from string[] to Ingredient[]
  editable?: boolean;
  onEdit?: (ingredients: Ingredient[]) => void; // Changed from string[] to Ingredient[]
  highlight?: string[];
  showQuantities?: boolean;
  onAddToShoppingList?: () => void;
}

export default function IngredientList({
  ingredients,
  editable = false,
  onEdit,
  highlight = [],
  showQuantities = true,
  onAddToShoppingList,
}: IngredientListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    new Array(ingredients.length).fill(false)
  );
  const [isEditing, setIsEditing] = useState(false);
  const itemOpacity = useSharedValue(1); 
  const itemScale = useSharedValue(1); 
  
  // itemOpacity and itemScale were defined twice. Removed duplicate.
  
  const toggleCheck = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate the item when checked/unchecked
    itemScale.value = withSequence(
      withTiming(1.02, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };
  
  const removeIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate the item being removed
    itemOpacity.value = withTiming(0, { duration: 300 });
    
    const newIngredients = ingredients.filter((_, i) => i !== index); // Create new array
    
    if (onEdit) {
      onEdit(newIngredients);
    }
  };
  
  // No longer need parseIngredientText as we receive structured Ingredient objects
  // const parseIngredientText = (text: string) => { ... }
  
  const renderIngredient = ({ item, index }: { item: Ingredient; index: number }) => { // item is now Ingredient
    const isHighlighted = highlight.some(
      h => item.name.toLowerCase().includes(h.toLowerCase()) // Use item.name
    );
    
    // Use item.quantity, item.unit, and item.name directly
    
    // Animated styles
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: itemOpacity.value,
        transform: [{ scale: itemScale.value }],
      };
    });
    
    return (
      <Animated.View style={[styles.ingredientContainer, animatedStyle]}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleCheck(index)}
          // disabled={!editable} // Checkboxes are always active for tracking
        >
          <View 
            style={[
              styles.checkbox,
              checkedIngredients[index] && styles.checkedCheckbox
            ]}
          >
            {checkedIngredients[index] && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.ingredientTextContainer}>
          {showQuantities && (item.quantity || item.unit) ? (
            <View style={styles.ingredientWithQuantity}>
              {item.quantity && <Text style={styles.ingredientQuantity}>{item.quantity}</Text>}
              {item.unit && <Text style={styles.ingredientUnit}>{item.unit}</Text>}
              <Text
                style={[
                  styles.ingredientName,
                  checkedIngredients[index] && styles.checkedIngredient,
                  isHighlighted && styles.highlightedIngredient,
                  !(item.quantity || item.unit) && styles.ingredientNameFullWidth // Adjust if no quantity/unit
                ]}
              >
                {item.name}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.ingredientText, // Use ingredientText for full width name
                styles.ingredientName, // Ensure consistent styling for name part
                checkedIngredients[index] && styles.checkedIngredient,
                isHighlighted && styles.highlightedIngredient
              ]}
            >
              {item.name}
            </Text>
          )}

          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeIngredient(index)}
            >
              <Ionicons name="close-circle" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ingredients</Text>
        <View style={styles.headerActions}>
          {onAddToShoppingList && (
            <TouchableOpacity
              style={styles.shoppingListButton}
              onPress={onAddToShoppingList}
            >
              <Ionicons name="cart-outline" size={22} color={colors.primary} />
              {/* <Text style={styles.shoppingListButtonText}>Add to List</Text> */}
            </TouchableOpacity>
          )}
          {editable && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <FlatList
        data={ingredients}
        renderItem={renderIngredient}
        keyExtractor={(item, index) => `ingredient-${index}-${item.name}`} // Use item.name for key
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
    flex: 1, // Allow title to take available space
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shoppingListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    // backgroundColor: colors.primaryLight,
    // borderRadius: 20,
    marginRight: 8,
  },
  shoppingListButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginLeft: 6,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  ingredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4, // Square checkbox
    borderWidth: 2,
    borderColor: colors.border, // Subtle border for unchecked
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: colors.success, // Green when checked
    borderColor: colors.success, // Green border when checked
  },
  ingredientTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ingredientText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins-Regular',
    flex: 1, // Ensure text takes full width if no quantity
  },
  ingredientWithQuantity: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align text nicely
    flex: 1,
  },
  ingredientQuantity: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 4, // Reduced margin
    fontFamily: 'Poppins-Medium',
  },
  ingredientUnit: {
    fontSize: 15, // Slightly smaller for unit
    color: colors.textSecondary,
    marginRight: 6,
    fontFamily: 'Poppins-Regular',
  },
  ingredientName: {
    fontSize: 16,
    color: colors.text,
    flex: 1, // Allow name to take remaining space
    fontFamily: 'Poppins-Regular',
  },
  ingredientNameFullWidth: { // Style for when name is the only element
    // No specific styles needed if ingredientText already handles it
  },
  checkedIngredient: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  highlightedIngredient: {
    backgroundColor: 'rgba(255, 213, 79, 0.3)',
  },
  deleteButton: {
    padding: 4,
  },
});
