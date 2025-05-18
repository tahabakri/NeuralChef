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

interface IngredientListProps {
  ingredients: string[];
  editable?: boolean;
  onEdit?: (ingredients: string[]) => void;
  highlight?: string[];
  showQuantities?: boolean;
}

export default function IngredientList({
  ingredients,
  editable = false,
  onEdit,
  highlight = [],
  showQuantities = true,
}: IngredientListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    new Array(ingredients.length).fill(false)
  );
  const [isEditing, setIsEditing] = useState(false);
  
  // Animation for list items
  const itemOpacity = useSharedValue(1);
  const itemScale = useSharedValue(1);
  
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
    
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    
    if (onEdit) {
      onEdit(newIngredients);
    }
  };
  
  const parseIngredientText = (text: string) => {
    if (!showQuantities) {
      // Remove quantities and return just the ingredient name
      return text.replace(/^[\d\s./½⅓⅔¼¾⅛⅜⅝⅞\-–—]+(?:cup|cups|tbsp|tsp|tablespoon|teaspoon|oz|ounce|lb|pound|g|kg|ml|l|liter|bunch|pinch|to taste)[s]?\s+/i, '');
    }
    
    // If showing quantities, check if we should split quantity and name
    const quantityMatch = text.match(/^([\d\s./½⅓⅔¼¾⅛⅜⅝⅞\-–—]+(?:cup|cups|tbsp|tsp|tablespoon|teaspoon|oz|ounce|lb|pound|g|kg|ml|l|liter|bunch|pinch|to taste)[s]?)\s+(.+)$/i);
    
    if (quantityMatch && quantityMatch[1] && quantityMatch[2]) {
      // Return structured ingredient parts
      return {
        quantity: quantityMatch[1].trim(),
        name: quantityMatch[2].trim()
      };
    }
    
    // No quantity detected or not in expected format
    return {
      quantity: '',
      name: text.trim()
    };
  };
  
  const renderIngredient = ({ item, index }: { item: string; index: number }) => {
    const isHighlighted = highlight.some(
      h => item.toLowerCase().includes(h.toLowerCase())
    );
    
    // Parse ingredient text to potentially separate quantity from name
    const parsedIngredient = parseIngredientText(item);
    
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
          disabled={!editable}
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
          {typeof parsedIngredient === 'object' && parsedIngredient.quantity ? (
            <View style={styles.ingredientWithQuantity}>
              <Text style={styles.ingredientQuantity}>{parsedIngredient.quantity}</Text>
              <Text 
                style={[
                  styles.ingredientName, 
                  checkedIngredients[index] && styles.checkedIngredient,
                  isHighlighted && styles.highlightedIngredient
                ]}
              >
                {parsedIngredient.name}
              </Text>
            </View>
          ) : (
            <Text 
              style={[
                styles.ingredientText, 
                checkedIngredients[index] && styles.checkedIngredient,
                isHighlighted && styles.highlightedIngredient
              ]}
            >
              {typeof parsedIngredient === 'object' ? parsedIngredient.name : parsedIngredient}
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
      
      <FlatList
        data={ingredients}
        renderItem={renderIngredient}
        keyExtractor={(item, index) => `ingredient-${index}-${item}`}
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
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: colors.primary,
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
  },
  ingredientWithQuantity: {
    flexDirection: 'row',
    flex: 1,
  },
  ingredientQuantity: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 6,
    fontFamily: 'Poppins-Medium',
  },
  ingredientName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    fontFamily: 'Poppins-Regular',
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