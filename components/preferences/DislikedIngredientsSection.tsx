import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { DislikedIngredientsSectionProps } from './types';

// Chef icon states for this section
const WINKING_CHEF_ICON = "happy-outline"; // For successful add

// TypeScript interfaces for memoized components
interface IngredientChipProps {
  ingredient: string;
  animValue: Animated.Value;
  onRemove: (ingredient: string) => void;
}

// Memoized ingredient chip component
const IngredientChip = memo<IngredientChipProps>(({
  ingredient,
  animValue,
  onRemove
}) => {
  const handleRemove = useCallback(() => {
    onRemove(ingredient);
  }, [ingredient, onRemove]);

  return (
    <Animated.View 
      style={[
        styles.ingredientChip,
        { 
          opacity: animValue, 
          transform: [{ scale: animValue }] 
        }
      ]}
    >
      <Text style={styles.ingredientChipText}>{ingredient}</Text>
      <TouchableOpacity
        style={styles.removeChipButton}
        onPress={handleRemove}
      >
        <Ionicons name="close-outline" size={20} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const DislikedIngredientsSection = memo<DislikedIngredientsSectionProps>(({
  dislikedIngredients,
  onAddIngredient,
  onRemoveIngredient,
}) => {
  const [newIngredient, setNewIngredient] = useState('');
  const [chefMessage, setChefMessage] = useState<string | null>(null);
  const chefMessageAnim = useRef(new Animated.Value(0)).current;
  const addBtnScale = useRef(new Animated.Value(1)).current;

  // Animation for individual ingredient chips - optimized with useRef
  const ingredientChipAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Optimize animation creation with useEffect
  useEffect(() => {
    // Create animations for new ingredients only
    dislikedIngredients.forEach(ingredient => {
      if (!ingredientChipAnimations[ingredient]) {
        ingredientChipAnimations[ingredient] = new Animated.Value(1);
      }
    });
    
    // Optional cleanup of removed ingredients
    // This could be removed if it causes performance issues
    Object.keys(ingredientChipAnimations).forEach(key => {
      if (!dislikedIngredients.includes(key)) {
        delete ingredientChipAnimations[key];
      }
    });
  }, [dislikedIngredients, ingredientChipAnimations]);

  const showTemporaryChefMessage = useCallback((message: string) => {
    setChefMessage(message);
    chefMessageAnim.setValue(0);
    Animated.sequence([
      Animated.timing(chefMessageAnim, { 
        toValue: 1, 
        duration: 300, 
        useNativeDriver: true 
      }),
      Animated.delay(2000),
      Animated.timing(chefMessageAnim, { 
        toValue: 0, 
        duration: 300, 
        useNativeDriver: true 
      }),
    ]).start(() => setChefMessage(null));
  }, [chefMessageAnim]);

  const handleAddIngredient = useCallback(() => {
    if (newIngredient.trim()) {
      onAddIngredient(newIngredient.trim());
      showTemporaryChefMessage(`Noted! No ${newIngredient.trim()}.`);
      setNewIngredient('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Add button bounce
      Animated.sequence([
        Animated.timing(addBtnScale, { 
          toValue: 1.2, 
          duration: 100, 
          useNativeDriver: true 
        }),
        Animated.timing(addBtnScale, { 
          toValue: 1, 
          duration: 100, 
          useNativeDriver: true 
        }),
      ]).start();
    }
  }, [newIngredient, onAddIngredient, showTemporaryChefMessage, addBtnScale]);

  const handleRemoveIngredient = useCallback((ingredient: string) => {
    const anim = ingredientChipAnimations[ingredient];
    if (!anim) return;
    
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true, 
    }).start(() => {
      onRemoveIngredient(ingredient);
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [ingredientChipAnimations, onRemoveIngredient]);

  // Memoize interpolations
  const chefMessageOpacity = chefMessageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const chefMessageTransform = chefMessageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ingredients to Avoid</Text>
      <Text style={styles.sectionSubtitle}>Tell us what you don't like!</Text>

      {chefMessage && (
        <Animated.View 
          style={[
            styles.chefMessageContainer,
            { opacity: chefMessageOpacity, transform: [{ translateY: chefMessageTransform }] }
          ]}
        >
          <Ionicons name={WINKING_CHEF_ICON as any} size={22} color={colors.success} />
          <Text style={styles.chefMessageText}>{chefMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.addIngredientContainer}>
        <TextInput
          style={styles.ingredientInput}
          placeholder="Add an ingredient…"
          placeholderTextColor={colors.textTertiary}
          value={newIngredient}
          onChangeText={setNewIngredient}
          onSubmitEditing={handleAddIngredient}
          returnKeyType="done"
        />
        <Animated.View style={{transform: [{scale: addBtnScale}]}}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddIngredient}
            >
                <Ionicons name="add-outline" size={28} color={colors.white} />
            </TouchableOpacity>
        </Animated.View>
      </View>

      {dislikedIngredients.length > 0 && (
        <View style={styles.ingredientsListContainer}>
          {dislikedIngredients.map((ingredient) => {
            const chipAnimValue = ingredientChipAnimations[ingredient] || new Animated.Value(1);
            return (
              <IngredientChip
                key={ingredient}
                ingredient={ingredient}
                animValue={chipAnimValue}
                onRemove={handleRemoveIngredient}
              />
            );
          })}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  chefMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(148, 231, 156, 0.15)', // Light green background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  chefMessageText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  addIngredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ingredientInput: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: colors.success,
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientsListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  ingredientChipText: {
    color: colors.white,
    fontSize: 14,
    marginRight: 6,
  },
  removeChipButton: {
    padding: 2,
  },
});

export default DislikedIngredientsSection;

// Developer Notes:
// - Background is transparent; parent MoreOptionsSection provides glassmorphic background.
// - Styling adjusted to orange-green palette with playful fonts.
// - Input field and add button styled to match AllergiesSection.
// - Disliked ingredients shown as orange chips with green text and a green 'x'.
// - Chef winks with a "Noted!" message on adding an ingredient.
// - Chip removal has a fade/shrink animation.
// - Font placeholders need to be replaced. 