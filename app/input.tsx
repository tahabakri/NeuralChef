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
  LayoutAnimation,
  UIManager,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import TextArea, { Tag } from '@/components/TextArea';
import VoiceInputModal from '@/components/VoiceInputModal';
import CameraInput from '@/components/CameraInput';
import ImageInputOptionsModal from '@/components/ImageInputOptionsModal';
import LottieIllustration from '@/components/LottieIllustration';
import IngredientPillList from '@/components/IngredientPillList';
import typography, { fontSize, fontWeight, lineHeight } from '@/constants/typography';
import IngredientDetectionConfirmation from '@/components/IngredientDetectionConfirmation';
import * as ImagePicker from 'expo-image-picker';
import { mockIngredientRecognition } from '@/utils/mockImageRecognition';

export default function InputScreen() {
  const params = useLocalSearchParams<{ mode: string }>();
  const [inputText, setInputText] = useState('');
  const [ingredients, setIngredients] = useState<Tag[]>([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageInputOptionsModal, setShowImageInputOptionsModal] = useState(false);
  const [applyUserPreferences, setApplyUserPreferences] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [galleryImageForConfirmation, setGalleryImageForConfirmation] = useState<{uri: string, ingredients: string[]} | null>(null);
  const [isProcessingGalleryImage, setIsProcessingGalleryImage] = useState(false);

  const commonPairings = ["olive oil", "onion", "garlic", "salt", "pepper"];

  const popularCombos = [
    { name: "Pasta Night", ingredients: ["pasta", "tomato sauce", "garlic", "basil"] },
    { name: "Quick Omelette", ingredients: ["eggs", "onion", "bell pepper", "cheese"] },
    { name: "Salad Base", ingredients: ["lettuce", "cucumber", "tomato", "olive oil"] },
  ];

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    if (ingredients.length >= 2 && ingredients.length <= 3) {
      const currentIngredientTexts = ingredients.map(ing => ing.text.toLowerCase());
      const suggestions = commonPairings.filter(
        (sugg: string) => !currentIngredientTexts.includes(sugg.toLowerCase()) && !inputText.toLowerCase().includes(sugg.toLowerCase())
      ).slice(0, 3);
      setSmartSuggestions(suggestions);
    } else {
      setSmartSuggestions([]);
    }
  }, [ingredients, inputText]);

  const addIngredientToList = (text: string) => {
    const newIngredient: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${text}`,
      text: text.trim(),
      isValid: true,
    };
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients(prev => {
      if (!prev.find(p => p.text.toLowerCase() === newIngredient.text.toLowerCase())) {
        return [...prev, newIngredient];
      }
      return prev;
    });
  };

  const handleRemoveIngredientPill = (tagId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleAddFromText = () => {
    if (inputText.trim()) {
      const newIngredientTexts = inputText
        .split(/[,\n]/)
        .map(i => i.trim())
        .filter(Boolean);
      
      newIngredientTexts.forEach(text => addIngredientToList(text));
      setInputText('');
    }
  };

  const handleAddPopularCombo = (comboIngredients: string[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    comboIngredients.forEach(text => addIngredientToList(text));
  };

  const handleAddSmartSuggestion = (suggestionText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addIngredientToList(suggestionText);
    setSmartSuggestions(prev => prev.filter(s => s !== suggestionText));
  };

  const handleVoiceInputFromModal = (recognizedText: string) => {
    if (recognizedText) {
      setInputText(prev => prev ? `${prev}${prev.endsWith(',') || prev.endsWith(' ') || prev.length === 0 ? '' : ', '}${recognizedText}` : recognizedText);
    }
    setShowVoiceModal(false);
  };

  const handleCameraInput = (recognizedIngredientTexts: string[]) => {
    if (recognizedIngredientTexts.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      recognizedIngredientTexts.forEach(text => addIngredientToList(text));
    }
    setShowCamera(false);
    setGalleryImageForConfirmation(null);
  };

  const handleClearAll = () => {
    if (ingredients.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients([]);
    setInputText('');
  };

  const handleGenerateRecipe = () => {
    if (ingredients.length === 0) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ingredientTexts = ingredients.map(tag => tag.text);
    router.push({
      pathname: '/generate',
      params: { 
        ingredients: JSON.stringify(ingredientTexts),
        applyUserPreferences: applyUserPreferences.toString(),
      }
    });
  };

  const handleChooseFromGallery = async () => {
    setShowImageInputOptionsModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need gallery access to pick an image.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setIsProcessingGalleryImage(true);
        setTimeout(() => {
          const detectedIngredients = mockIngredientRecognition(imageUri);
          setGalleryImageForConfirmation({ uri: imageUri, ingredients: detectedIngredients });
          setIsProcessingGalleryImage(false);
        }, 1500);
      } else {
        console.log('Image picking cancelled or no assets found.');
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Could not pick image from gallery.');
      setIsProcessingGalleryImage(false);
    }
  };
  
  const handleTakePicture = () => {
    setShowImageInputOptionsModal(false);
    setShowCamera(true);
  };
  
  const confirmIngredientsFromGallery = (confirmedIngredients: string[]) => {
    if (confirmedIngredients.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      confirmedIngredients.forEach(text => addIngredientToList(text));
    }
    setGalleryImageForConfirmation(null);
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
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Ingredients</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
              disabled={ingredients.length === 0}
              accessibilityLabel="Clear all ingredients"
              accessibilityRole="button"
            >
              <Ionicons 
                name="trash-outline" 
                size={20}
                color={ingredients.length === 0 ? colors.textTertiary : colors.accentOrange} 
              />
              <Text
                style={[
                  styles.clearButtonText,
                  { color: ingredients.length === 0 ? colors.textTertiary : colors.accentOrange }
                ]}
              >
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instruction Text */}
          <Text style={styles.instruction}>
            What ingredients do you have?
          </Text>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Empty State OR Ingredient Pills */}
            {ingredients.length > 0 ? (
              <IngredientPillList 
                ingredients={ingredients} 
                onRemoveIngredient={handleRemoveIngredientPill} 
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <LottieIllustration
                  type="empty-state"
                  style={styles.emptyStateAnimation}
                  autoPlay
                  loop
                  size={180}
                />
                <Text style={styles.emptyStateText}>
                  Add at least one ingredient to get started!
                </Text>
              </View>
            )}

            {/* 2. Main Text Input Area */}
            <View style={styles.textInputSection}>
              {ingredients.length === 0 && !inputText.trim() && (
                <Text style={styles.textAreaPlaceholder_statusLine}>
                  No ingredients added yet
                </Text>
              )}
              <TextArea
                value={inputText}
                onChangeText={setInputText}
                tags={[]}
                onAddTag={(tag) => addIngredientToList(tag.text)}
                onRemoveTag={handleRemoveIngredientPill}
                placeholder="Example: chicken, rice, bell peppers..."
                onSubmit={handleAddFromText}
                style={styles.textArea}
              />
            </View>

            {/* 3. Input Method Buttons */}
            <View style={styles.inputMethodButtonsContainer}>
              <TouchableOpacity
                style={styles.inputMethodButtonPill}
                onPress={() => setShowVoiceModal(true)}
              >
                <Ionicons name="mic-outline" size={20} color={colors.accentOrange} />
                <Text style={[styles.inputMethodButtonPillText, { color: colors.accentOrange }]}>Voice</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.inputMethodButtonPill}
                onPress={() => setShowImageInputOptionsModal(true)}
              >
                <Ionicons name="image-outline" size={20} color={colors.accentOrange} />
                <Text style={[styles.inputMethodButtonPillText, { color: colors.accentOrange }]}>Image</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.inputMethodButtonPill,
                  { backgroundColor: inputText.trim() ? colors.success : colors.backgroundDisabled }
                ]}
                onPress={handleAddFromText}
                disabled={!inputText.trim()}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={inputText.trim() ? colors.white : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.inputMethodButtonPillText,
                    { color: inputText.trim() ? colors.white : colors.textTertiary }
                  ]}
                >
                  Add
                </Text>
              </TouchableOpacity>
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

            {/* 4. Quick Suggestions Section */}
            <View style={styles.quickSuggestionsContainer}>
              <Text style={styles.quickSuggestionsTitle}>Quick Suggestions</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.quickSuggestionsScroll}
              >
                {popularCombos.map((combo) => (
                  <TouchableOpacity
                    key={combo.name}
                    style={styles.quickSuggestionButton}
                    onPress={() => handleAddPopularCombo(combo.ingredients)}
                  >
                    <Text style={styles.quickSuggestionText}>{combo.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* 5. Apply Dietary Preferences Toggle */}
          <View style={styles.preferencesToggleContainer}>
            <Text style={styles.preferencesToggleText}>Apply My Dietary Preferences</Text>
            <Switch
              trackColor={{ false: colors.backgroundDisabled, true: colors.accentOrangeLight }} 
              thumbColor={applyUserPreferences ? colors.accentOrange : colors.textTertiary}
              ios_backgroundColor={colors.backgroundDisabled}
              onValueChange={setApplyUserPreferences}
              value={applyUserPreferences}
            />
          </View>

          {/* Fixed Footer: Generate Recipe Button */}
          <View style={styles.generateButtonContainer}>
            <TouchableOpacity
              style={[
                styles.generateButton,
                ingredients.length === 0 && styles.disabledGenerateButton 
              ]}
              onPress={handleGenerateRecipe}
              disabled={ingredients.length === 0}
            >
              <Text style={[
                styles.generateButtonText,
                ingredients.length === 0 && styles.disabledGenerateButtonText
              ]}>
                Generate Recipe {ingredients.length > 0 ? `(${ingredients.length})` : ''}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={ingredients.length === 0 ? colors.textTertiary : colors.white} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Voice Input Modal */}
      <VoiceInputModal
        visible={showVoiceModal}
        onComplete={handleVoiceInputFromModal}
        onClose={() => setShowVoiceModal(false)}
        onInputReceived={handleVoiceInputFromModal}
      />

      {/* Camera Input as full overlay */}
      {showCamera && (
        <View style={styles.cameraContainer}>
          <CameraInput
            onIngredientsDetected={handleCameraInput}
            onClose={() => setShowCamera(false)}
          />
        </View>
      )}

      {/* Image Input Options Modal (New) */}
      {showImageInputOptionsModal && (
        <ImageInputOptionsModal
          visible={showImageInputOptionsModal}
          onClose={() => setShowImageInputOptionsModal(false)}
          onTakePicture={handleTakePicture}
          onChooseFromGallery={handleChooseFromGallery}
        />
      )}

      {/* Confirmation for Gallery Image (New) */}
      {galleryImageForConfirmation && (
        <IngredientDetectionConfirmation
          visible={!!galleryImageForConfirmation}
          onClose={() => setGalleryImageForConfirmation(null)}
          detectedIngredients={galleryImageForConfirmation.ingredients}
          onConfirm={confirmIngredientsFromGallery}
          isProcessing={isProcessingGalleryImage}
        />
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
    paddingHorizontal: 1,
    paddingTop: Platform.OS === 'android' ? 18 : 10,
    paddingBottom: 1,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTitle: {
    ...typography.heading2,
    color: colors.text,
  },
  backButton: {
    minWidth: 42, 
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.md,
    marginLeft: 1,
  },
  instruction: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: 1,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20, 
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  emptyStateAnimation: {
    width: 280,
    height: 280,
    marginBottom: 1,
  },
  emptyStateText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  textInputSection: {
    marginHorizontal: 12,
    marginBottom: 1,
  },
  textArea: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textAreaPlaceholder_statusLine: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  inputMethodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  inputMethodButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 48,
    flex: 1,
    marginHorizontal: 4,
  },
  inputMethodButtonPillText: {
    ...typography.button,
    marginLeft: 8,
  },
  smartSuggestionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  smartSuggestionsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  smartSuggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smartSuggestionButton: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smartSuggestionText: {
    ...typography.caption,
    color: colors.accentBlue,
  },
  quickSuggestionsContainer: {
    marginBottom: 24,
    paddingLeft: 16, 
  },
  quickSuggestionsTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  quickSuggestionsScroll: {
    paddingRight: 16, 
  },
  quickSuggestionButton: {
    backgroundColor: colors.accentBlueLight, 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 48, 
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSuggestionText: {
    ...typography.button,
    fontFamily: 'Poppins-Medium',
    color: colors.accentBlue,
  },
  preferencesToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card, 
  },
  preferencesToggleText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  generateButtonContainer: {
    padding: 12,
    backgroundColor: colors.white,
    marginTop: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: 48, 
    paddingVertical: 16,
  },
  disabledGenerateButton: {
    backgroundColor: colors.backgroundDisabled, 
  },
  generateButtonText: {
    ...typography.button,
    fontWeight: '600',
    color: colors.white, 
    marginRight: 8,
  },
  disabledGenerateButtonText: {
    color: colors.textTertiary, 
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: colors.black,
    padding: 12,
  },
});
