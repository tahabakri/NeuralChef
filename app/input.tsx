import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Animated,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  TextInput,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import { useRecipeStore, RecipeError } from '@/stores/recipeStore'; // RecipeError is already imported here
import { RecipeErrorType } from '@/services/recipeService'; // Import RecipeErrorType
import { popularIngredients } from '@/constants/ingredients';
import OfflineBanner, { NetworkManager } from '@/components/OfflineBanner';
import ErrorState from '@/components/ErrorState';
import ErrorScreen from '@/components/ErrorScreen';

// Import components for input methods
import IngredientInput from '@/components/IngredientInput';
import IngredientList from '@/components/IngredientList';
import VoiceInputModal from '@/components/VoiceInputModal';
import CameraInput from '@/components/CameraInput';
import TextArea from '@/components/TextArea';
import Input from '@/components/Input';
import BackArrow from '@/components/BackArrow';

// Object mapping common ingredients to complementary ones
const complementaryIngredients: Record<string, string[]> = {
  'chicken': ['garlic', 'onion', 'thyme', 'lemon', 'rosemary'],
  'beef': ['onion', 'garlic', 'bay leaf', 'carrots', 'red wine'],
  'pork': ['apples', 'sage', 'garlic', 'onion', 'rosemary'],
  'fish': ['lemon', 'dill', 'parsley', 'garlic', 'white wine'],
  'pasta': ['tomatoes', 'basil', 'parmesan', 'olive oil', 'garlic'],
  'rice': ['soy sauce', 'ginger', 'green onions', 'eggs', 'peas'],
  'potatoes': ['rosemary', 'garlic', 'butter', 'thyme', 'olive oil'],
  'tomatoes': ['basil', 'olive oil', 'garlic', 'onion', 'mozzarella'],
  'mushrooms': ['thyme', 'garlic', 'butter', 'parsley', 'white wine'],
  'cheese': ['bread', 'crackers', 'grapes', 'apples', 'honey'],
};

// Popular ingredient combinations
const popularCombinations = [
  {
    name: 'Italian Basic',
    ingredients: ['pasta', 'tomatoes', 'garlic', 'basil', 'olive oil']
  },
  {
    name: 'Asian Stir Fry',
    ingredients: ['rice', 'soy sauce', 'ginger', 'garlic', 'green onions']
  },
  {
    name: 'Mexican Taco',
    ingredients: ['tortilla', 'ground beef', 'cumin', 'cilantro', 'onion', 'lime']
  },
  {
    name: 'Breakfast Classic',
    ingredients: ['eggs', 'bread', 'bacon', 'cheese', 'butter']
  },
];

// Helper function for user-friendly error messages
function getUserFriendlyErrorMessage(error: RecipeError | null): string {
  if (!error) return '';
  
  switch (error.type) {
    case RecipeErrorType.FETCH_ERROR: // Assuming 'network' maps to FETCH_ERROR
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    // case RecipeErrorType.TIMEOUT_ERROR: // Assuming 'timeout' maps to a new or existing type
    //   return 'The operation is taking longer than expected. Please try again later.';
    case RecipeErrorType.GENERATE_ERROR: // 'generation' maps to GENERATE_ERROR
      return 'We couldn\'t create a recipe with these ingredients. Please try different ingredients or try again later.';
    // case RecipeErrorType.VALIDATION_ERROR: // Assuming 'validation' maps to a new or existing type
    //  return 'Please check your ingredients and try again.';
    // case RecipeErrorType.UNKNOWN_ERROR: // Assuming 'unknown' maps to a new or existing type
    default: // Default case for any other RecipeErrorType or if error.message exists
      return error.message || 'Something unexpected happened. Please try again.';
  }
}

// Create a custom ingredient list adapter component with animations
const IngredientListAdapter = ({ 
  ingredients, 
  onRemove, 
  onClearAll, 
  scrollViewRef 
}: { 
  ingredients: any[], 
  onRemove: (id: string) => void, 
  onClearAll: () => void, 
  scrollViewRef: React.RefObject<ScrollView> 
}) => {
  // Animation values for each ingredient
  const [animValues, setAnimValues] = useState<{[key: string]: Animated.Value}>({});
  
  // Initialize animation values for new ingredients
  useEffect(() => {
    const newAnimValues = {...animValues};
    ingredients.forEach(ing => {
      if (!newAnimValues[ing.id]) {
        newAnimValues[ing.id] = new Animated.Value(0);
        // Start animation for new ingredient
        Animated.timing(newAnimValues[ing.id], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
    setAnimValues(newAnimValues);
  }, [ingredients]);
  
  // Handle remove by passing the ID to the parent callback with animation
  const handleRemove = (id: string, index: number) => {
    if (animValues[id]) {
      // Run exit animation
      Animated.timing(animValues[id], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onRemove(id);
      });
    } else {
      onRemove(id);
    }
  };
  
  if (ingredients.length === 0) {
    return (
      <View style={adapterStyles.emptyContainer}>
        <Text style={adapterStyles.emptyText}>
          Add ingredients to generate a recipe
        </Text>
      </View>
    );
  }
  
  return (
    <View style={adapterStyles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={adapterStyles.scrollView}
        contentContainerStyle={adapterStyles.scrollContent}
      >
        {ingredients.map((ingredient, index) => {
          const animStyle = {
            opacity: animValues[ingredient.id] || 1,
            transform: [{
              scale: animValues[ingredient.id] || 1
            }, {
              translateX: animValues[ingredient.id]?.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              }) || 0
            }]
          };
          
          return (
            <Animated.View 
              key={ingredient.id} 
              style={[adapterStyles.ingredientItem, animStyle]}
            >
              <Text style={adapterStyles.ingredientText}>{ingredient.name}</Text>
              <TouchableOpacity
                style={adapterStyles.removeButton}
                onPress={() => handleRemove(ingredient.id, index)}
              >
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
      
      {ingredients.length > 0 && (
        <TouchableOpacity
          style={adapterStyles.clearButton}
          onPress={onClearAll}
        >
          <Text style={adapterStyles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const adapterStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ingredientText: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
  },
  removeButton: {
    padding: 4,
  },
  clearButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  clearButtonText: {
    color: colors.error,
    ...typography.button,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    ...typography.body1,
    padding: 16,
  },
});

// Input Screen Component
function InputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCameraInput, setShowCameraInput] = useState(false);
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [showNoIngredientsError, setShowNoIngredientsError] = useState(false);
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const [error, setError] = useState<RecipeError | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Use the setHasNewRecipe and generateRecipe method from the store
  const { setHasNewRecipe, generateRecipe: generateRecipeFromStore } = useRecipeStore();
  
  // Use the ingredients store correctly
  const { 
    ingredients, 
    addIngredient, 
    removeIngredient, 
    clearIngredients
  } = useIngredientsStore();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedButtonScale = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  
  // Update progress bar animation
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: generationProgress,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [generationProgress]);

  useEffect(() => {
    if (params.mode === 'camera') {
      setShowCameraInput(true);
    }
  }, [params]);
  
  // Subscribe to network status changes
  useEffect(() => {
    const unsubscribe = NetworkManager.addListener(setIsOffline);
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Generate suggestions based on current input or ingredients
  useEffect(() => {
    if (currentInput.trim().length > 1) {
      // Filter popular ingredients based on current input
      const matchingSuggestions = popularIngredients
        .filter(ingredient => 
          ingredient.toLowerCase().includes(currentInput.toLowerCase()) &&
          !ingredients.some(ing => ing.name.toLowerCase() === ingredient.toLowerCase())
        )
        .slice(0, 5);
      
      setSuggestions(matchingSuggestions);
    } else if (ingredients.length > 0) {
      // Generate complementary suggestions based on current ingredients
      const lastIngredient = ingredients[ingredients.length - 1].name.toLowerCase();
      const complementarySuggestions = complementaryIngredients[lastIngredient] || [];
      
      // Filter out already added ingredients
      const filteredSuggestions = complementarySuggestions.filter(
        (suggestion: string) => !ingredients.some(ing => 
          ing.name.toLowerCase() === suggestion.toLowerCase()
        )
      );
      
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [currentInput, ingredients]);
  
  // Add ingredient to the list with enhanced haptic feedback
  const handleAddIngredient = (text: string) => {
    // Skip if empty
    if (!text.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Split and add multiple ingredients if text contains commas
    const newIngredients = text
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
    
    newIngredients.forEach(ingredient => addIngredient(ingredient));
    setCurrentInput('');
    
    // Hide no ingredients error if it was showing
    if (showNoIngredientsError) {
      setShowNoIngredientsError(false);
    }
    
    // Close keyboard after adding
    Keyboard.dismiss();
    
    // Scroll to the bottom of the list
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  // Remove ingredient from the list with enhanced haptic feedback
  const handleRemoveIngredient = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeIngredient(id);
  };
  
  // Clear all ingredients with strong haptic feedback
  const handleClearIngredients = () => {
    if (ingredients.length === 0) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    Alert.alert(
      "Clear Ingredients",
      "Are you sure you want to clear all ingredients?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearIngredients();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };
  
  // Select a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addIngredient(suggestion);
    setCurrentInput('');
    setSuggestions([]);
  };
  
  // Add popular combination
  const handleAddCombination = (combination: { name: string, ingredients: string[] }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    combination.ingredients.forEach(ingredient => {
      if (!ingredients.some(ing => ing.name.toLowerCase() === ingredient.toLowerCase())) {
        addIngredient(ingredient);
      }
    });
  };
  
  // Handle voice input results
  const handleVoiceInput = (recognizedText: string) => {
    setShowVoiceModal(false);
    
    if (recognizedText) {
      handleAddIngredient(recognizedText);
    }
  };
  
  // Handle camera input results
  const handleCameraInput = (detectedIngredients: string[]) => {
    if (detectedIngredients && detectedIngredients.length > 0) {
      detectedIngredients.forEach(ingredient => {
        addIngredient(ingredient);
      });
    }
  };
  
  // Generate a recipe with visual progress indicator
  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      Alert.alert(
        "No Ingredients",
        "Please add at least one ingredient to generate a recipe."
      );
      return;
    }
    
    // Prevent recipe generation when offline
    if (isOffline) {
      Alert.alert(
        "Offline Mode",
        "Recipe generation is disabled while offline. Please connect to the internet and try again."
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Keyboard.dismiss();
    setIsGenerating(true);
    
    try {
      // Animate the button when pressed
      Animated.sequence([
        Animated.timing(animatedButtonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Get the ingredient names from the ingredients array
      const ingredientNames = ingredients.map(ing => ing.name);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + 0.1;
          return newProgress > 0.9 ? 0.9 : newProgress;
        });
      }, 500);
      
      // Use the recipe generation service from the store
      // The store's generateRecipe expects just the ingredient names array
      await generateRecipeFromStore(ingredientNames);
      // The store updates selectedRecipe, so we'll use that.
      const storeState = useRecipeStore.getState();
      const generatedRecipe = storeState.selectedRecipe;
      
      // Clear the progress interval
      clearInterval(progressInterval);
      setGenerationProgress(1);
      
      // Only proceed if we got a recipe
      if (generatedRecipe) {
        // Successful generation haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Wait a moment to show the completed progress
        setTimeout(() => {
          // Mark as having a new recipe
          setHasNewRecipe(true);
          
          // Navigate to the recipe screen
          router.push(`/recipe/${generatedRecipe.id || ''}`);
        }, 300);
      }
    } catch (err) {
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      console.error('Error generating recipe:', err);
      // Set error state
      setError({
        type: RecipeErrorType.GENERATE_ERROR,
        message: 'Failed to generate recipe',
        // details: err instanceof Error ? err.message : 'Unknown error', // RecipeError doesn't have details/timestamp
        // timestamp: Date.now()
      });
    } finally {
      setGenerationProgress(0);
      setIsGenerating(false);
    }
  };
  
  // If there's a recipe generation error, show the error screen
  if (error && !isGenerating) {
    return (
      <ErrorScreen 
        title="Recipe Generation Failed"
        message={getUserFriendlyErrorMessage(error)}
        onTryAgain={() => router.replace('/input')}
        errorType={error.type}
      />
    );
  }
  
  // Show loading indicator with progress bar while generating
  if (isGenerating) {
    const progressWidth = progressAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    });
    
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[styles.progressBar, { width: progressWidth }]} 
          />
        </View>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          Generating your recipe...
        </Text>
        <Text style={styles.loadingSubtext}>
          Creating a delicious recipe with {ingredients.length} ingredients
        </Text>
      </View>
    );
  }
  
  // New compact input UI with suggestions and animations
  const renderCompactInputUI = () => (
    <View>
      {/* Top bar with back button and title */}
      <View style={styles.topBar}>
        <BackArrow />
        <Text style={styles.title}>Input Ingredients</Text>
      </View>
      
      {/* Subtitle */}
      <Text style={styles.subtitle}>Add ingredients to generate a custom recipe</Text>
      
      {/* Input Row with active state for type input */}
      <View style={styles.inputRow}>
        {showTypeInput ? (
          <View style={styles.activeTypeContainer}>
            <TextInput
              ref={inputRef}
              style={styles.typeInput}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder="Type ingredient and press enter"
              placeholderTextColor={colors.textTertiary}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => handleAddIngredient(currentInput)}
              autoFocus
            />
            {currentInput ? (
              <TouchableOpacity
                style={styles.typeAddButton}
                onPress={() => handleAddIngredient(currentInput)}
              >
                <Ionicons name="checkmark" size={22} color={colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.typeCloseButton}
                onPress={() => setShowTypeInput(false)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.typeInputContainer}
              onPress={() => {
                setShowTypeInput(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
            >
              <Ionicons name="create-outline" size={22} color={colors.text} />
              <Text style={styles.inputTypeText}>Type</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.inputMethodButton}
              onPress={() => setShowVoiceModal(true)}
            >
              <Ionicons name="mic" size={22} color={colors.primary} />
              <Text style={styles.inputMethodText}>Voice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.inputMethodButton}
              onPress={() => setShowCameraInput(true)}
            >
              <Ionicons name="camera" size={22} color={colors.text} />
              <Text style={styles.inputMethodText}>Camera</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {/* Suggestions */}
      {(suggestions.length > 0 && currentInput) ? (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`suggestion-${index}`}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : ingredients.length > 0 && suggestions.length > 0 ? (
        <View style={styles.complementaryContainer}>
          <Text style={styles.complementaryTitle}>Pairs well with:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`complement-${index}`}
                style={[styles.suggestionItem, styles.complementItem]}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : ingredients.length === 0 ? (
        <View style={styles.popularCombinationsContainer}>
          <Text style={styles.popularTitle}>Popular Combinations:</Text>
          {popularCombinations.map((combo, index) => (
            <TouchableOpacity
              key={`combo-${index}`}
              style={styles.combinationItem}
              onPress={() => handleAddCombination(combo)}
            >
              <Text style={styles.combinationName}>{combo.name}</Text>
              <Text style={styles.combinationIngredients}>
                {combo.ingredients.join(', ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      
      {/* Ingredient List */}
      {ingredients.length > 0 && (
        <View style={styles.ingredientListContainer}>
          <IngredientListAdapter
            ingredients={ingredients}
            onRemove={handleRemoveIngredient}
            onClearAll={handleClearIngredients}
            scrollViewRef={scrollViewRef}
          />
        </View>
      )}
    </View>
  );
  
  const animatedButtonStyle = {
    transform: [{ scale: animatedButtonScale }]
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Offline Banner */}
      <OfflineBanner />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        {/* New Compact UI */}
        {renderCompactInputUI()}
        
        {/* Empty space to push button to bottom if no ingredients */}
        {ingredients.length === 0 && <View style={styles.spacer} />}
        
        {/* Generate Recipe Button */}
        <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              ingredients.length === 0 && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateRecipe}
            disabled={ingredients.length === 0}
          >
            <Text style={styles.generateButtonText}>
              Generate Recipe
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Voice Input Modal */}
        {showVoiceModal && (
          <VoiceInputModal
            onComplete={handleVoiceInput}
            onClose={() => setShowVoiceModal(false)}
          />
        )}
        
        {/* Camera Input */}
        {showCameraInput && (
          <CameraInput
            onIngredientsDetected={handleCameraInput}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default InputScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginLeft: 16,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
    overflow: 'hidden',
  },
  typeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  activeTypeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    backgroundColor: colors.white,
  },
  typeInput: {
    flex: 1,
    height: 56,
    color: colors.text,
    ...typography.body1,
  },
  typeAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputTypeText: {
    ...typography.body2,
    color: colors.text,
    marginLeft: 8,
  },
  inputMethodButton: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inputMethodText: {
    ...typography.body2,
    color: colors.text,
    marginLeft: 4,
  },
  suggestionsContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  suggestionsContent: {
    paddingVertical: 8,
  },
  suggestionItem: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  complementItem: {
    backgroundColor: colors.infoLight,
  },
  suggestionText: {
    color: colors.text,
    ...typography.body2,
  },
  complementaryContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  complementaryTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  popularCombinationsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  popularTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  combinationItem: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  combinationName: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  combinationIngredients: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  ingredientListContainer: {
    paddingHorizontal: 16,
    maxHeight: 300,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyStateText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  generateButton: {
    backgroundColor: '#FFA69E', // Salmon/pink color matching the image
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: colors.white,
    ...typography.button,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  progressContainer: {
    width: '80%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text,
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
