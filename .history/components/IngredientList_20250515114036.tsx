import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';
import Card from './Card';

interface IngredientsListProps {
  ingredients: string[];
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    Array(ingredients.length).fill(false)
  );

  // Recipe-specific storage key
  const getStorageKey = () => {
    // Create a unique key based on the ingredients list
    const ingredientsKey = ingredients.join('').replace(/\s+/g, '').slice(0, 50);
    return `recipe_ingredients_${ingredientsKey}`;
  };

  // Load checked state from AsyncStorage
  useEffect(() => {
    const loadCheckedState = async () => {
      try {
        const storageKey = getStorageKey();
        const savedState = await AsyncStorage.getItem(storageKey);
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          
          // Only use saved state if array lengths match
          if (parsedState.length === ingredients.length) {
            setCheckedIngredients(parsedState);
          }
        }
      } catch (error) {
        console.error('Failed to load ingredient checked state:', error);
      }
    };
    
    loadCheckedState();
  }, [ingredients]);

  const toggleChecked = async (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
    
    // Save to AsyncStorage
    try {
      const storageKey = getStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(newChecked));
    } catch (error) {
      console.error('Failed to save ingredient checked state:', error);
    }
  };

  // Function to split an ingredient into quantity and name
  const formatIngredient = (ingredient: string, isChecked: boolean) => {
    // Match patterns like "2 cups", "1/2 tsp", "3-4 tbsp", etc.
    const match = ingredient.match(/^([\d./\-\s]+)(\s*\w+)?(\s+)(.+)$/);
    
    if (match) {
      const quantity = match[1] + (match[2] || ''); // The number/fraction + unit if exists
      const restOfIngredient = match[4]; // The ingredient name
      
      return (
        <>
          <Text style={[
            styles.quantityText, 
            isChecked && styles.checkedText
          ]}>
            {quantity}
          </Text>
          <Text style={[
            styles.ingredientText, 
            isChecked && styles.checkedText
          ]}>
            {restOfIngredient}
          </Text>
        </>
      );
    }
    
    // If no quantity pattern found, return the ingredient as is
    return (
      <Text style={[
        styles.ingredientText, 
        isChecked && styles.checkedText
      ]}>
        {ingredient}
      </Text>
    );
  };

  return (
    <Card style={styles.container} variant="elevated">
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {ingredients.map((ingredient, index) => (
          <Pressable 
            key={index} 
            style={[
              styles.ingredientItem,
              checkedIngredients[index] && styles.ingredientItemChecked
            ]}
            onPress={() => toggleChecked(index)}
          >
            <View style={styles.checkboxContainer}>
              {checkedIngredients[index] ? (
                <CheckCircle size={24} color={colors.primary} />
              ) : (
                <Circle size={24} color={colors.textSecondary} />
              )}
            </View>
            
            <View style={styles.ingredientTextContainer}>
              {formatIngredient(ingredient, checkedIngredients[index])}
            </View>
          </Pressable>
        ))}
      </ScrollView>
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${(checkedIngredients.filter(Boolean).length / ingredients.length) * 100}%` 
            }
          ]} 
        />
        <Text style={styles.progressText}>
          {checkedIngredients.filter(Boolean).length} of {ingredients.length} ingredients
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  list: {
    marginBottom: 16,
    maxHeight: 300,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  ingredientItemChecked: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 1,
  },
  ingredientTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quantityText: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.primary,
    marginRight: 4,
    lineHeight: 24,
  },
  ingredientText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  progressContainer: {
    height: 24,
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  progressText: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
  },
});