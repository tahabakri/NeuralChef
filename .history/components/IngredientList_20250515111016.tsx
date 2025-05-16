import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import colors from '@/constants/colors';
import Card from './Card';

interface IngredientsListProps {
  ingredients: string[];
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    Array(ingredients.length).fill(false)
  );

  const toggleChecked = (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };

  // Function to split an ingredient into quantity and name
  const formatIngredient = (ingredient: string) => {
    // Match patterns like "2 cups", "1/2 tsp", "3-4 tbsp", etc.
    const match = ingredient.match(/^([\d./\-\s]+)(\s*\w+)?(\s+)(.+)$/);
    
    if (match) {
      const quantity = match[1] + (match[2] || ''); // The number/fraction + unit if exists
      const restOfIngredient = match[4]; // The ingredient name
      
      return (
        <>
          <Text style={styles.quantityText}>{quantity}</Text>
          <Text style={styles.ingredientText}>{restOfIngredient}</Text>
        </>
      );
    }
    
    // If no quantity pattern found, return the ingredient as is
    return <Text style={styles.ingredientText}>{ingredient}</Text>;
  };

  return (
    <Card style={styles.container} variant="elevated">
      <Text style={styles.title}>Ingredients</Text>
      
      <View style={styles.list}>
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
                <CheckCircle size={20} color={colors.primary} />
              ) : (
                <Circle size={20} color={colors.textSecondary} />
              )}
            </View>
            
            <View style={styles.ingredientTextContainer}>
              {formatIngredient(ingredient)}
            </View>
          </Pressable>
        ))}
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
    marginTop: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  ingredientItemChecked: {
    opacity: 0.6,
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
    lineHeight: 22,
  },
  ingredientText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
});