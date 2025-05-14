import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import Card from './Card';

interface IngredientsListProps {
  ingredients: string[];
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  return (
    <Card style={styles.container} variant="elevated">
      <Text style={styles.title}>Ingredients</Text>
      
      <View style={styles.list}>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <View style={styles.bullet} />
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
});