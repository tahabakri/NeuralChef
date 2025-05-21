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

  // Check if we should show camera on start based on mode param
  useEffect(() => {
    if (params.mode === 'camera') {
      setShowCamera(true);
    }
  }, [params.mode]);

  // Process text input into ingredients
  const handleAddFromText = () => {
    if (inputText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Split by commas and/or newlines
      const newIngredients = inputText
        .split(/[,\n]/)
        .map(i => i.trim())
        .filter(Boolean);
      
      setIngredients(prev => [...prev, ...newIngredients]);
      setInputText('');
    }
  };

  // Handle ingredients from voice input
  const handleVoiceInput = (recognizedText: string) => {
    if (recognizedText) {
      // Split by commas and/or natural pauses
      const newIngredients = recognizedText
        .split(/[,.]/)
        .map(i => i.trim())
        .filter(Boolean);
      
      setIngredients(prev => [...prev, ...newIngredients]);
    }
    
    setShowVoiceModal(false);
  };

  // Handle ingredients from camera
  const handleCameraInput = (recognizedIngredients: string[]) => {
    if (recognizedIngredients.length > 0) {
      setIngredients(prev => [...prev, ...recognizedIngredients]);
    }
    
    setShowCamera(false);
  };

  // Remove ingredient at index
  const handleRemoveIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  // Clear all ingredients
  const handleClearAll = () => {
    if (ingredients.length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      params: { ingredients: JSON.stringify(ingredients) }
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
              <Text
                style={[
                  styles.clearButtonText,
                  ingredients.length === 0 && styles.disabledText
                ]}
              >
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Instructions */}
            <Text style={styles.instruction}>
              What ingredients do you have?
            </Text>

            {/* Ingredients List */}
            {ingredients.length > 0 && (
              <View style={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveIngredient(index)}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
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
                    name="add"
                    size={22}
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
          </ScrollView>

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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
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
    paddingBottom: 24,
  },
  ingredientsList: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  ingredientText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  removeButton: {
    padding: 4,
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
  generateButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
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
