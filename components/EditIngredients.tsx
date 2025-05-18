import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Keyboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Recipe } from '@/services/recipeService';
import { useRecipeStore } from '@/stores/recipeStore';
import colors from '@/constants/colors';

interface EditIngredientsProps {
  recipe: Recipe;
  visible: boolean;
  onClose: () => void;
  onUpdate?: (updatedRecipe: Recipe) => void;
}

export default function EditIngredients({
  recipe,
  visible,
  onClose,
  onUpdate,
}: EditIngredientsProps) {
  const router = useRouter();
  const { generateRecipe } = useRecipeStore();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // Initialize ingredients from recipe
  useEffect(() => {
    if (recipe && recipe.ingredients) {
      setIngredients([...recipe.ingredients]);
    }
  }, [recipe]);
  
  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      },
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      },
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Add a new ingredient
  const addIngredient = () => {
    if (newIngredient.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Split by commas if present
      const toAdd = newIngredient
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      
      setIngredients(prev => [...prev, ...toAdd]);
      setNewIngredient('');
    }
  };
  
  // Remove an ingredient
  const removeIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIngredients(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Clear all ingredients
  const clearAllIngredients = () => {
    if (ingredients.length === 0) return;
    
    Alert.alert(
      'Clear All Ingredients',
      'Are you sure you want to remove all ingredients?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setIngredients([]);
          },
        },
      ]
    );
  };
  
  // Regenerate recipe with updated ingredients
  const handleRegenerateRecipe = async () => {
    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }
    
    if (ingredients.length === recipe.ingredients.length &&
        ingredients.every(i => recipe.ingredients.includes(i))) {
      Alert.alert('No Changes', 'You haven\'t changed any ingredients. Please modify ingredients before regenerating.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsGenerating(true);
    
    try {
      const newRecipe = await generateRecipe(ingredients);
      
      if (newRecipe) {
        // If onUpdate is provided, call it with the new recipe
        if (onUpdate) {
          onUpdate(newRecipe);
        }
        
        // Close the modal
        onClose();
        
        // Navigate to the new recipe screen
        router.push('/recipe');
      } else {
        Alert.alert('Error', 'Failed to generate recipe. Please try again.');
      }
    } catch (error) {
      console.error('Error regenerating recipe:', error);
      Alert.alert('Error', 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Render ingredient item
  const renderIngredient = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.ingredientItem}>
      <Text style={styles.ingredientText}>{item}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeIngredient(index)}
        accessibilityLabel={`Remove ${item}`}
        accessibilityRole="button"
      >
        <Ionicons name="close-circle" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Ingredients</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Add, remove, or modify ingredients to regenerate this recipe
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newIngredient}
              onChangeText={setNewIngredient}
              placeholder="Add ingredient"
              placeholderTextColor={colors.textTertiary}
              returnKeyType="done"
              onSubmitEditing={addIngredient}
              autoCapitalize="none"
            />
            
            <TouchableOpacity
              style={[
                styles.addButton,
                !newIngredient.trim() && styles.disabledButton
              ]}
              onPress={addIngredient}
              disabled={!newIngredient.trim()}
              accessibilityLabel="Add ingredient"
              accessibilityRole="button"
            >
              <Ionicons 
                name="add" 
                size={20} 
                color={newIngredient.trim() ? 'white' : colors.textTertiary} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.ingredientsHeader}>
            <Text style={styles.ingredientsTitle}>
              Ingredients ({ingredients.length})
            </Text>
            
            {ingredients.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllIngredients}
                accessibilityLabel="Clear all ingredients"
                accessibilityRole="button"
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView 
            style={styles.ingredientsList}
            contentContainerStyle={styles.ingredientsContent}
            showsVerticalScrollIndicator={false}
          >
            <FlatList
              data={ingredients}
              renderItem={renderIngredient}
              keyExtractor={(item, index) => `ingredient-${index}`}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No ingredients added yet. Add some ingredients to get started.
                </Text>
              }
            />
          </ScrollView>
          
          {!isKeyboardVisible && (
            <TouchableOpacity
              style={[
                styles.generateButton,
                (ingredients.length === 0 || isGenerating) && styles.disabledButton
              ]}
              onPress={handleRegenerateRecipe}
              disabled={ingredients.length === 0 || isGenerating}
              accessibilityLabel="Regenerate recipe with new ingredients"
              accessibilityRole="button"
            >
              {isGenerating ? (
                <Text style={styles.generateButtonText}>Generating...</Text>
              ) : (
                <>
                  <Ionicons 
                    name="refresh" 
                    size={20} 
                    color="white" 
                    style={styles.generateButtonIcon} 
                  />
                  <Text style={styles.generateButtonText}>
                    Regenerate Recipe
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 16,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins-Regular',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.error,
    fontFamily: 'Poppins-Medium',
  },
  ingredientsList: {
    flex: 1,
    maxHeight: '60%',
  },
  ingredientsContent: {
    paddingBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins-Regular',
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-Regular',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  generateButtonIcon: {
    marginRight: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
}); 