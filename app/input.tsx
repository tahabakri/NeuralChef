import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Animated,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
// Comment out Speech import for now
// import * as Speech from 'expo-speech';
import colors from '@/constants/colors';
import { useRecipeStore } from '@/stores/recipeStore';
import { popularIngredients } from '@/constants/ingredients';

export default function InputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const { generateRecipe, setRecipe } = useRecipeStore();
  
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedButtonScale = useRef(new Animated.Value(1)).current;
  
  // Pre-fill ingredients if passed via params
  useEffect(() => {
    if (params.ingredients) {
      const paramIngredients = String(params.ingredients)
        .split(',')
        .map(i => i.trim())
        .filter(Boolean);
      
      setIngredients(paramIngredients);
    }
  }, [params.ingredients]);
  
  // Add ingredient to the list
  const addIngredient = (text: string) => {
    // Skip if empty
    if (!text.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Split and add multiple ingredients if text contains commas
    const newIngredients = text
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
    
    setIngredients(prev => [...prev, ...newIngredients]);
    setCurrentInput('');
    
    // Scroll to the bottom of the list
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  // Remove ingredient from the list
  const removeIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setIngredients(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Clear all ingredients
  const clearIngredients = () => {
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
          onPress: () => setIngredients([])
        }
      ]
    );
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
      
      // In a real app, this would call your API to generate a recipe
      const generatedRecipe = await generateRecipe(ingredients);
      
      // Only proceed if we got a recipe
      if (generatedRecipe) {
        // Store the generated recipe
        setRecipe(generatedRecipe);
        
        // Navigate to the recipe screen
        router.push('/recipe');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      Alert.alert(
        "Recipe Generation Failed",
        "There was an error generating your recipe. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Open camera to scan ingredients
  const openCamera = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        "Camera Permission Required",
        "We need camera permission to scan ingredients. Please enable it in your device settings."
      );
      return;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real app, this would send the image to an API for processing/recognition
        // For now, we'll just simulate recognizing a few ingredients
        
        // Simulate processing delay
        setIsGenerating(true);
        
        setTimeout(() => {
          // Sample recognized ingredients (would be from API in real app)
          const recognized = ['onion', 'tomato', 'chicken breast'];
          
          setIngredients(prev => {
            // Filter out duplicates
            const newIngredients = recognized.filter(
              ingredient => !prev.includes(ingredient)
            );
            return [...prev, ...newIngredients];
          });
          
          setIsGenerating(false);
          
          // Show feedback
          Alert.alert(
            "Ingredients Recognized",
            `Found ${recognized.length} ingredients in your image.`
          );
        }, 2000);
      }
    } catch (error) {
      console.error('Error using camera:', error);
      setIsGenerating(false);
    }
  };
  
  // Start voice recording
  const startVoiceRecording = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // In a real app, this would use a speech recognition API
    // For now, we'll simulate voice recognition
    
    setIsRecording(true);
    
    // Start visual feedback
    // Comment out Speech usage
    /*
    Speech.speak("I'm listening. What ingredients do you have?", {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
    });
    */
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      
      // Simulate recognized text
      const recognizedIngredients = [
        'chicken',
        'rice',
        'bell pepper',
        'onion'
      ];
      
      // Add recognized ingredients
      setIngredients(prev => {
        // Filter out duplicates
        const newIngredients = recognizedIngredients.filter(
          ingredient => !prev.includes(ingredient)
        );
        return [...prev, ...newIngredients];
      });
      
      // Show feedback
      setRecognizedText(`Recognized: ${recognizedIngredients.join(', ')}`);
      
      setTimeout(() => {
        setRecognizedText('');
      }, 3000);
    }, 3000);
  };
  
  // Add a suggestion ingredient
  const addSuggestion = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!ingredients.includes(suggestion)) {
      setIngredients(prev => [...prev, suggestion]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Enter Ingredients</Text>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearIngredients}
            accessibilityLabel="Clear all ingredients"
            accessibilityRole="button"
            disabled={ingredients.length === 0}
          >
            <Text 
              style={[
                styles.clearButtonText,
                ingredients.length === 0 && styles.disabledButtonText
              ]}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions */}
          <Text style={styles.instructionText}>
            What ingredients do you have? Add them one by one or separated by commas.
          </Text>
          
          {/* Ingredients List */}
          <View style={styles.ingredientsList}>
            {ingredients.map((ingredient, index) => (
              <View key={`${ingredient}-${index}`} style={styles.ingredientChip}>
                <Text style={styles.ingredientText}>{ingredient}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={`Remove ${ingredient}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* Voice Recognition Feedback */}
          {recognizedText && (
            <Text style={styles.recognizedText}>{recognizedText}</Text>
          )}
          
          {/* Popular Ingredients Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Common Ingredients</Text>
            <View style={styles.suggestionsList}>
              {popularIngredients.slice(0, 15).map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={[
                    styles.suggestionChip,
                    ingredients.includes(suggestion) && styles.selectedSuggestion
                  ]}
                  onPress={() => addSuggestion(suggestion)}
                  disabled={ingredients.includes(suggestion)}
                  accessibilityLabel={`Add ${suggestion}`}
                  accessibilityRole="button"
                >
                  <Text 
                    style={[
                      styles.suggestionText,
                      ingredients.includes(suggestion) && styles.selectedSuggestionText
                    ]}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Spacing for keyboard and bottom buttons */}
          <View style={{ height: 120 }} />
        </ScrollView>
        
        {/* Input and Action Buttons */}
        <View style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder="Type an ingredient..."
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={() => addIngredient(currentInput)}
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
            />
            
            <TouchableOpacity
              style={[
                styles.addButton,
                !currentInput.trim() && styles.disabledAddButton
              ]}
              onPress={() => addIngredient(currentInput)}
              disabled={!currentInput.trim()}
              accessibilityLabel="Add ingredient"
              accessibilityRole="button"
            >
              <Ionicons 
                name="add" 
                size={24} 
                color={currentInput.trim() ? colors.white : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={openCamera}
              disabled={isGenerating || isRecording}
              accessibilityLabel="Scan ingredients with camera"
              accessibilityRole="button"
            >
              <Ionicons name="camera-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                isRecording && styles.recordingButton
              ]}
              onPress={startVoiceRecording}
              disabled={isGenerating || isRecording}
              accessibilityLabel="Add ingredients by voice"
              accessibilityRole="button"
            >
              <Ionicons 
                name={isRecording ? "mic" : "mic-outline"} 
                size={22} 
                color={isRecording ? colors.white : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Generate Recipe Button */}
        <Animated.View 
          style={[
            styles.generateButtonContainer,
            { transform: [{ scale: animatedButtonScale }] }
          ]}
        >
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateRecipe}
            disabled={isGenerating || ingredients.length === 0}
            accessibilityLabel="Generate recipe"
            accessibilityRole="button"
          >
            {isGenerating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="restaurant-outline" size={20} color="white" style={styles.generateButtonIcon} />
                <Text style={styles.generateButtonText}>Generate Recipe</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButtonText: {
    color: colors.textTertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  removeButton: {
    marginLeft: 2,
  },
  recognizedText: {
    fontSize: 14,
    color: colors.success,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedSuggestion: {
    backgroundColor: `${colors.primary}20`, // 20% opacity
    borderColor: colors.primary,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedSuggestionText: {
    color: colors.primary,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    backgroundColor: colors.background,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledAddButton: {
    backgroundColor: colors.border,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
  generateButtonContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: colors.background,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
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
  },
});
