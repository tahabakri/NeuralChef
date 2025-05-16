import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import Card from './Card';

interface IngredientsListProps {
  ingredients: string[];
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    Array(ingredients.length).fill(false)
  );
  const [progress, setProgress] = useState(0);
  
  // Animation for progress value
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  // Recipe-specific storage key
  const getStorageKey = () => {
    // Create a unique key based on the ingredients list
    const ingredientsKey = ingredients.join('').replace(/\s+/g, '').slice(0, 50);
    return `recipe_ingredients_${ingredientsKey}`;
  };

  // Calculate progress when checkedIngredients changes
  useEffect(() => {
    const checkedCount = checkedIngredients.filter(Boolean).length;
    const newProgress = ingredients.length > 0 ? checkedCount / ingredients.length : 0;
    
    // Animate the progress change
    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 300,
      useNativeDriver: false
    }).start();
    
    setProgress(newProgress);
  }, [checkedIngredients, ingredients.length]);

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
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        newChecked[index] ? 
          Haptics.ImpactFeedbackStyle.Medium : 
          Haptics.ImpactFeedbackStyle.Light
      );
    }
    
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
      {/* Progress bar with percentage */}
      <View style={styles.progressBarContainer}>
        <Progress.Bar 
          progress={progress} 
          width={null} 
          height={8}
          borderRadius={4}
          color={colors.primary}
          unfilledColor="#F0F4F8"
          borderWidth={0}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {checkedIngredients.filter(Boolean).length} of {ingredients.length} ingredients
        </Text>
      </View>
        
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
    marginTop: 16,
    maxHeight: 300,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    transition: '0.3s',
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
    color: colors.success,
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBar: {
    width: '100%',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});