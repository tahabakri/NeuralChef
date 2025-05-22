import React, { useState, useRef, useEffect } from 'react';
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
// import colors from '@/constants/colors'; // Removed
import { DislikedIngredientsSectionProps } from './types';

// Theme colors matching other preference sections
const theme = {
  orange: '#FF8C00',
  green: '#50C878',
  white: '#FFFFFF',
  textLight: '#777777',
  lightOrangeFill: 'rgba(255, 140, 0, 0.1)', // For input background
  // glassBg: 'rgba(255, 255, 255, 0.2)', // Not needed here, parent provides background
  // borderColor: 'rgba(255, 255, 255, 0.3)',
  // shadowColor: 'rgba(0, 0, 0, 0.1)',
};

// Chef icon states for this section (can be expanded)
const WINKING_CHEF_ICON = "happy-outline"; // For successful add
// const FROWNING_CHEF_ICON = "sad-outline"; // Could be used for removal or other interactions

const DislikedIngredientsSection: React.FC<DislikedIngredientsSectionProps> = ({
  dislikedIngredients,
  onAddIngredient,
  onRemoveIngredient,
}) => {
  const [newIngredient, setNewIngredient] = useState('');
  const [chefMessage, setChefMessage] = useState<string | null>(null);
  const chefMessageAnim = useRef(new Animated.Value(0)).current;
  const addBtnScale = useRef(new Animated.Value(1)).current;

  // Animation for individual ingredient chips (e.g., for removal)
  const ingredientChipAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    dislikedIngredients.forEach(ingredient => {
      if (!ingredientChipAnimations[ingredient]) {
        ingredientChipAnimations[ingredient] = new Animated.Value(1);
      }
    });
    // Clean up removed ingredients from animations ref if necessary
    Object.keys(ingredientChipAnimations).forEach(key => {
      if (!dislikedIngredients.includes(key)) {
        delete ingredientChipAnimations[key];
      }
    });
  }, [dislikedIngredients, ingredientChipAnimations]);

  const showTemporaryChefMessage = (message: string) => {
    setChefMessage(message);
    chefMessageAnim.setValue(0);
    Animated.sequence([
      Animated.timing(chefMessageAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(chefMessageAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setChefMessage(null));
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      onAddIngredient(newIngredient.trim());
      showTemporaryChefMessage(`Noted! No ${newIngredient.trim()}.`); // Chef message
      setNewIngredient('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Add button bounce
      Animated.sequence([
        Animated.timing(addBtnScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(addBtnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    const anim = ingredientChipAnimations[ingredient] || new Animated.Value(1); // Fallback just in case
    Animated.timing(anim, {
      toValue: 0, // Fade out and shrink
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true, 
    }).start(() => {
      onRemoveIngredient(ingredient);
      // No need to reset anim.setValue(1) here as it will be re-created/managed by useEffect or chip is gone
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const chefMessageOpacity = chefMessageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const chefMessageTransform = chefMessageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0], // Slight upward movement
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
          <Ionicons name={WINKING_CHEF_ICON as any} size={22} color={theme.green} />
          <Text style={styles.chefMessageText}>{chefMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.addIngredientContainer}>
        <TextInput
          style={styles.ingredientInput}
          placeholder="Add an ingredient…"
          placeholderTextColor={theme.textLight} // Playful font to be handled by global styles
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
                <Ionicons name="add-outline" size={28} color={theme.white} />
            </TouchableOpacity>
        </Animated.View>
      </View>

      {dislikedIngredients.length > 0 && (
        <View style={styles.ingredientsListContainer}>
          {dislikedIngredients.map((ingredient) => {
            const chipAnimValue = ingredientChipAnimations[ingredient] || new Animated.Value(1);
            return (
              <Animated.View 
                key={ingredient} 
                style={[
                  styles.ingredientChip,
                  { 
                    opacity: chipAnimValue, 
                    transform: [{ scale: chipAnimValue }] 
                  }
                ]}
              >
                <Text style={styles.ingredientChipText}>{ingredient}</Text>
                <TouchableOpacity
                  style={styles.removeChipButton}
                  onPress={() => handleRemoveIngredient(ingredient)}
                >
                  <Ionicons name="close-outline" size={20} color={theme.green} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.orange,
    marginBottom: 3,
    fontFamily: 'PlayfulFont-Bold', // Placeholder
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.green,
    marginBottom: 15,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  chefMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)', // Light green subtle background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  chefMessageText: {
    marginLeft: 8,
    color: theme.green,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
  },
  addIngredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Space before the list of ingredients
  },
  ingredientInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.green,
    backgroundColor: theme.lightOrangeFill,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: theme.orange,
    marginRight: 10,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  addButton: {
    backgroundColor: theme.green,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientsListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // To offset chip margin
  },
  ingredientChip: {
    backgroundColor: theme.orange, // Orange chips
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    borderWidth: 1, // Thin border for chips
    borderColor: theme.green, // Green border
  },
  ingredientChipText: {
    color: theme.green, // Green text on orange chip
    fontSize: 14,
    marginRight: 8,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  removeChipButton: {
    // Potentially add padding for easier tap target
    // padding: 2,
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