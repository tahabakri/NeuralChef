import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  LayoutAnimation,
  UIManager,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import TextArea from '@/components/TextArea';
import VoiceInputModal from '@/components/VoiceInputModal';
import CameraInput from '@/components/CameraInput';

export default function InputScreen() {
  const params = useLocalSearchParams<{ mode: string }>();
  const [inputText, setInputText] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [applyUserPreferences, setApplyUserPreferences] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  const commonPairings = ["olive oil", "onion", "garlic", "salt", "pepper"];

  const popularCombos = [
    { name: "Pasta Night", ingredients: ["pasta", "tomato sauce", "garlic", "basil"] },
    { name: "Quick Omelette", ingredients: ["eggs", "onion", "bell pepper", "cheese"] },
    { name: "Salad Base", ingredients: ["lettuce", "cucumber", "tomato", "olive oil"] },
  ];

  // Enable LayoutAnimation for Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  // Check if we should show camera on start based on mode param
  useEffect(() => {
    if (params.mode === 'camera') {
      setShowCamera(true);
    }
  }, [params.mode]);

  // Update smart suggestions based on current ingredients
  useEffect(() => {
    if (ingredients.length >= 2 && ingredients.length <= 3) {
      const suggestions = commonPairings.filter(
        (sugg) => !ingredients.includes(sugg) && !inputText.toLowerCase().includes(sugg)
      ).slice(0, 3); // Show up to 3 suggestions
      setSmartSuggestions(suggestions);
    } else {
      setSmartSuggestions([]);
    }
  }, [ingredients, inputText]);

  // Process text input into ingredients
  const handleAddFromText = () => {
    if (inputText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      const newIngredients = inputText
        .split(/[,\n]/)
        .map(i => i.trim())
        .filter(Boolean);
      
      setIngredients(prev => {
        const uniqueNewIngredients = newIngredients.filter(ing => !prev.includes(ing));
        return [...prev, ...uniqueNewIngredients];
      });
      setInputText('');
    }
  };

  const handleAddPopularCombo = (comboIngredients: string[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients(prev => {
      const uniqueNewIngredients = comboIngredients.filter(ing => !prev.includes(ing));
      return [...prev, ...uniqueNewIngredients];
    });
  };

  const handleAddSmartSuggestion = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients(prev => {
      if (!prev.includes(suggestion)) {
        return [...prev, suggestion];
      }
      return prev;
    });
    // Optionally, clear the suggestion or update the list
    setSmartSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  // Handle ingredients from voice input
  const handleVoiceInput = (recognizedText: string) => {
    if (recognizedText) {
      // Auto-fill the input box with spoken text for review and editing
      setInputText(prev => prev ? `${prev}${prev.endsWith(',') || prev.endsWith(' ') || prev.length === 0 ? '' : ', '}${recognizedText}` : recognizedText);
    }
    setShowVoiceModal(false);
  };

  // Handle ingredients from camera
  const handleCameraInput = (recognizedIngredients: string[]) => {
    if (recognizedIngredients.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIngredients(prev => [...prev, ...recognizedIngredients.filter(ing => !prev.includes(ing))]); // Avoid duplicates
    }
    setShowCamera(false);
  };

  // Remove ingredient at index
  const handleRemoveIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  // Clear all ingredients
  const handleClearAll = () => {
    if (ingredients.length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients([]);
  };

  // Generate recipe with current ingredients
  const handleGenerateRecipe = () => {
    if (ingredients.length === 0) {
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/generate',
      params: { 
        ingredients: JSON.stringify(ingredients),
        applyUserPreferences: applyUserPreferences.toString(),
      }
    });
  };

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Ingredients</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
              disabled={ingredients.length === 0}
            >
              <Ionicons 
                name="trash-outline" 
                size={20} 
                color={ingredients.length === 0 ? colors.textTertiary : colors.primary} 
              />
              <Text
                style={[
                  styles.clearButtonText,
                  { marginLeft: 5 }, 
                  ingredients.length === 0 && styles.disabledText
                ]}
              >
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Instructions */}
            <Text style={styles.instruction}>
              What ingredients do you have?
            </Text>

            {/* Ingredients List or Empty State */}
            {ingredients.length > 0 ? (
              <View style={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                  <View key={`${ingredient}-${index}`} style={styles.ingredientItem}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveIngredient(index)}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Image 
                  source={require('@/assets/images/empty-basket.png')} 
                  style={styles.emptyStateImage} 
                />
                <Text style={styles.emptyStateText}>
                  Add at least one ingredient to get started!
                </Text>
              </View>
            )}

            {/* Input Methods */}
            <View style={styles.inputMethodsContainer}>
              {/* Text Input */}
              <TextArea
                value={inputText}
                onChangeText={setInputText}
                placeholder="Example: chicken, rice, bell peppers..."
                onSubmit={handleAddFromText}
                style={styles.textArea}
                onAddTag={() => {}} // Added dummy prop
                onRemoveTag={() => {}} // Added dummy prop
                tags={[]} // Added dummy prop
              />
              
              {/* Input Method Buttons */}
              <View style={styles.inputMethodsButtonRow}>
                <TouchableOpacity
                  style={styles.inputMethodButton}
                  onPress={() => setShowVoiceModal(true)}
                >
                  <Ionicons name="mic-outline" size={22} color={colors.primary} />
                  <Text style={styles.inputMethodButtonText}>Voice</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.inputMethodButton}
                  onPress={() => setShowCamera(true)}
                >
                  <Ionicons name="camera-outline" size={22} color={colors.primary} />
                  <Text style={styles.inputMethodButtonText}>Camera</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.inputMethodButton,
                    styles.addButton,
                    !inputText.trim() && styles.disabledButton
                  ]}
                  onPress={handleAddFromText}
                  disabled={!inputText.trim()}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={inputText.trim() ? colors.white : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.inputMethodButtonText,
                      styles.addButtonText,
                      !inputText.trim() && styles.disabledText
                    ]}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && (
              <View style={styles.smartSuggestionsContainer}>
                <Text style={styles.smartSuggestionsTitle}>You might also want to add:</Text>
                <View style={styles.smartSuggestionsList}>
                  {smartSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion}
                      style={styles.smartSuggestionButton}
                      onPress={() => handleAddSmartSuggestion(suggestion)}
                    >
                      <Text style={styles.smartSuggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Combinations */}
            <View style={styles.popularCombosContainer}>
              <Text style={styles.popularCombosTitle}>Quick Suggestions</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularCombosScroll}>
                {popularCombos.map((combo) => (
                  <TouchableOpacity
                    key={combo.name}
                    style={styles.popularComboButton}
                    onPress={() => handleAddPopularCombo(combo.ingredients)}
                  >
                    <Text style={styles.popularComboText}>{combo.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

          </ScrollView>

          {/* Preferences Toggle */}
          <View style={styles.preferencesToggleContainer}>
            <Text style={styles.preferencesToggleText}>Apply My Dietary Preferences</Text>
            <Switch
              trackColor={{ false: colors.backgroundDisabled, true: colors.primaryLight }}
              thumbColor={applyUserPreferences ? colors.primary : colors.textTertiary}
              ios_backgroundColor={colors.backgroundDisabled}
              onValueChange={setApplyUserPreferences}
              value={applyUserPreferences}
            />
          </View>

          {/* Generate Button */}
          <View style={styles.generateButtonContainer}>
            <TouchableOpacity
              style={[
                styles.generateButton,
                ingredients.length === 0 && styles.disabledButton
              ]}
              onPress={handleGenerateRecipe}
              disabled={ingredients.length === 0}
            >
              <Text style={styles.generateButtonText}>
                Generate Recipe {ingredients.length > 0 ? `(${ingredients.length})` : ''}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Voice Input Modal */}
      {showVoiceModal && (
        <VoiceInputModal
          visible={showVoiceModal}
          onComplete={handleVoiceInput}
          onClose={() => setShowVoiceModal(false)}
        />
      )}

      {/* Camera Input */}
      {showCamera && (
        <View style={styles.cameraContainer}>
          <CameraInput
            onIngredientsDetected={handleCameraInput}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.text,
  },
  backButton: {
    // Ensure consistent sizing for tap targets
    minWidth: 40, 
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding:8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.primary,
  },
  instruction: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24, // Ensure space for generate button
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight, // Use a muted primary for pills
    borderRadius: 16, // Pill shape
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.primary, // Text color that contrasts with primaryMuted
    marginRight: 6, // Space before the remove icon
  },
  removeButton: {
    padding: 2, // Smaller padding for icon within pill
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  emptyStateImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyStateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  inputMethodsContainer: {
    marginHorizontal: 16,
  },
  textArea: {
    marginBottom: 12,
  },
  inputMethodsButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
  },
  inputMethodButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
  },
  addButton: {
    backgroundColor: colors.primary,
    marginRight: 0,
  },
  addButtonText: {
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.backgroundDisabled,
  },
  disabledText: {
    color: colors.textTertiary,
  },
  smartSuggestionsContainer: {
    marginHorizontal: 16,
    marginTop: 8, // Add some space above if it appears
    marginBottom: 16,
  },
  smartSuggestionsTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  smartSuggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smartSuggestionButton: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  smartSuggestionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: colors.accentBlue,
  },
  popularCombosContainer: {
    marginVertical: 16,
    paddingLeft: 16, // For consistent padding with other sections
  },
  popularCombosTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  popularCombosScroll: {
    paddingRight: 16, // Ensure last item has padding
  },
  popularComboButton: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularComboText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: colors.secondaryDark,
  },
  preferencesToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.card, // Or another suitable background
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  preferencesToggleText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: colors.textPrimary,
  },
  generateButtonContainer: {
    padding: 16,
    // borderTopWidth: 1, // Removed as preferences toggle now has top border
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  generateButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.white,
    marginRight: 8,
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
