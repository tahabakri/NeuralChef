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
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import { useRecipeStore, RecipeError } from '@/stores/recipeStore';
import { popularIngredients } from '@/constants/ingredients';
import OfflineBanner, { NetworkManager } from '@/components/OfflineBanner';
import ErrorState from '@/components/ErrorState';
import ErrorScreen from '@/components/ErrorScreen';
import { generateRecipe } from '@/services/recipeService';

// Import components for input methods
import IngredientInput from '@/components/IngredientInput';
import IngredientList from '@/components/IngredientList';
import VoiceInputModal from '@/components/VoiceInputModal';
import CameraInput from '@/components/CameraInput';
import TextArea from '@/components/TextArea';
import Input from '@/components/Input';

// Helper function for user-friendly error messages
function getUserFriendlyErrorMessage(error: RecipeError | null): string {
  if (!error) return '';
  
  switch (error.type) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'timeout':
      return 'The operation is taking longer than expected. Please try again later.';
    case 'generation':
      return 'We couldn\'t create a recipe with these ingredients. Please try different ingredients or try again later.';
    case 'validation':
      return 'Please check your ingredients and try again.';
    case 'unknown':
    default:
      return error.message || 'Something unexpected happened. Please try again.';
  }
}

// Create a custom ingredient list adapter component
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
  // Convert Ingredient objects to strings for the IngredientList component
  const ingredientStrings = ingredients.map(ing => ing.name);
  
  // Handle remove by passing the ID to the parent callback
  const handleRemove = (index: number) => {
    if (ingredients[index] && ingredients[index].id) {
      onRemove(ingredients[index].id);
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
        {ingredients.map((ingredient, index) => (
          <View key={`${ingredient.id || index}`} style={adapterStyles.ingredientItem}>
            <Text style={adapterStyles.ingredientText}>{ingredient.name}</Text>
            <TouchableOpacity
              style={adapterStyles.removeButton}
              onPress={() => handleRemove(index)}
            >
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCameraInput, setShowCameraInput] = useState(false);
  const [inputMethod, setInputMethod] = useState<'text' | 'camera' | 'voice'>('text');
  const [currentInput, setCurrentInput] = useState('');
  const [showNoIngredientsError, setShowNoIngredientsError] = useState(false);
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const [error, setError] = useState<RecipeError | null>(null);
  
  // Use the setHasNewRecipe method from the store
  const { setHasNewRecipe } = useRecipeStore();
  
  // Use the ingredients store correctly
  const { 
    ingredients, 
    addIngredient, 
    removeIngredient, 
    clearIngredients
  } = useIngredientsStore();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedButtonScale = useRef(new Animated.Value(1)).current;
  
  // Subscribe to network status changes
  useEffect(() => {
    const unsubscribe = NetworkManager.addListener(setIsOffline);
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Add ingredient to the list
  const handleAddIngredient = (text: string) => {
    // Skip if empty
    if (!text.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
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
    
    // Scroll to the bottom of the list
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  // Remove ingredient from the list
  const handleRemoveIngredient = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeIngredient(id);
  };
  
  // Clear all ingredients
  const handleClearIngredients = () => {
    if (ingredients.length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
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
          onPress: () => clearIngredients()
        }
      ]
    );
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
  
  // Generate a recipe
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
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      
      // Use the recipe generation service
      const generatedRecipe = await generateRecipe(ingredientNames);
      
      // Only proceed if we got a recipe
      if (generatedRecipe) {
        // Mark as having a new recipe
        setHasNewRecipe(true);
        
        // Navigate to the recipe screen
        router.push(`/recipe/${generatedRecipe.id || ''}`);
      }
    } catch (err) {
      console.error('Error generating recipe:', err);
      // Set error state
      setError({
        type: 'generation',
        message: 'Failed to generate recipe',
        details: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now()
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Retry ingredient detection after failure
  const handleRetryIngredientDetection = () => {
    setShowNoIngredientsError(false);
    setShowCameraInput(true);
  };
  
  // Retry recipe generation after failure
  const handleRetryGeneration = () => {
    router.replace('/input');
  };
  
  // If there's a recipe generation error, show the error screen
  if (error && !isGenerating) {
    return (
      <ErrorScreen 
        title="Recipe Generation Failed"
        message={getUserFriendlyErrorMessage(error)}
        onTryAgain={handleRetryGeneration}
        errorType={error.type}
      />
    );
  }
  
  // Show loading indicator while generating
  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {ingredients.length > 0 
            ? "Generating your recipe..." 
            : "Detecting ingredients..."}
        </Text>
      </View>
    );
  }
  
  const renderTextInput = () => (
    <View style={styles.textInputContainer}>
      <Input
        placeholder="Type an ingredient (e.g. chicken)"
        value={currentInput}
        onChangeText={setCurrentInput}
        onSubmitEditing={() => handleAddIngredient(currentInput)}
        returnKeyType="done"
        autoCapitalize="none"
        autoCorrect={false}
        containerStyle={styles.textInputField}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddIngredient(currentInput)}
        disabled={!currentInput.trim()}
      >
        <Ionicons 
          name="add" 
          size={24} 
          color={!currentInput.trim() ? colors.textLight : 'white'} 
        />
      </TouchableOpacity>
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
        <View style={styles.header}>
          <Text style={styles.title}>Input Ingredients</Text>
          <Text style={styles.subtitle}>
            Add ingredients to generate a custom recipe
          </Text>
        </View>
        
        {/* Input Methods Tabs */}
        <View style={styles.inputMethodTabs}>
          <TouchableOpacity 
            style={[
              styles.inputMethodTab, 
              inputMethod === 'text' && styles.activeInputMethodTab
            ]}
            onPress={() => setInputMethod('text')}
          >
            <Ionicons 
              name="create-outline" 
              size={22} 
              color={inputMethod === 'text' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.inputMethodText, 
                inputMethod === 'text' && styles.activeInputMethodText
              ]}
            >
              Type
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.inputMethodTab, 
              inputMethod === 'voice' && styles.activeInputMethodTab
            ]}
            onPress={() => {
              setInputMethod('voice');
              setShowVoiceModal(true);
            }}
          >
            <Ionicons 
              name="mic-outline" 
              size={22} 
              color={inputMethod === 'voice' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.inputMethodText, 
                inputMethod === 'voice' && styles.activeInputMethodText
              ]}
            >
              Voice
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.inputMethodTab, 
              inputMethod === 'camera' && styles.activeInputMethodTab
            ]}
            onPress={() => {
              setInputMethod('camera');
              setShowCameraInput(true);
            }}
          >
            <Ionicons 
              name="camera-outline" 
              size={22} 
              color={inputMethod === 'camera' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.inputMethodText, 
                inputMethod === 'camera' && styles.activeInputMethodText
              ]}
            >
              Camera
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Text Input Section */}
        {inputMethod === 'text' && renderTextInput()}
        
        {/* Ingredient List */}
        <View style={styles.ingredientListContainer}>
          {showNoIngredientsError ? (
            <ErrorState
              onRetry={handleRetryIngredientDetection}
            />
          ) : (
            <IngredientListAdapter
              ingredients={ingredients}
              onRemove={handleRemoveIngredient}
              onClearAll={handleClearIngredients}
              scrollViewRef={scrollViewRef}
            />
          )}
        </View>
        
        {/* Generate Recipe Button */}
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              (ingredients.length === 0 || isOffline) && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateRecipe}
            disabled={ingredients.length === 0 || isOffline}
          >
            <LinearGradient
              colors={['#FF8C61', '#F96E43']} // "Sunrise Orange" gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateButtonGradient}
            >
              <Text style={styles.generateButtonText}>
                {isOffline ? "Generation Disabled (Offline)" : "Generate Recipe"}
              </Text>
            </LinearGradient>
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
  header: {
    padding: 16,
    marginBottom: 8,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  inputMethodTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 4,
  },
  inputMethodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeInputMethodTab: {
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputMethodText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  activeInputMethodText: {
    color: colors.primary,
    fontWeight: '600',
  },
  textInputContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  textInputField: {
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 8,
  },
  ingredientListContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text,
    marginTop: 16,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});
