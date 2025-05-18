import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import TextArea from './TextArea';
import VoiceInputModal from './VoiceInputModal';
import CameraInput from './CameraInput';

interface IngredientInputProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function IngredientInput({ onComplete, onClose }: IngredientInputProps) {
  const { ingredients, addIngredient, removeIngredient, clearIngredients } = useIngredientsStore();
  const [inputText, setInputText] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCameraInput, setShowCameraInput] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  
  // Monitor keyboard visibility
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboard(true);
    });
    
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboard(false);
    });
    
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Process text input into ingredients
  const handleAddFromText = () => {
    if (inputText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Split by commas and/or newlines
      const newIngredients = inputText
        .split(/[,\n]/)
        .map(i => i.trim())
        .filter(Boolean);
      
      // Add each ingredient
      newIngredients.forEach(ingredient => {
        addIngredient(ingredient);
      });
      
      // Clear the input text
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
      
      // Add each ingredient
      newIngredients.forEach(ingredient => {
        addIngredient(ingredient);
      });
    }
    
    // Close the voice modal
    setShowVoiceModal(false);
  };

  // Handle ingredients from camera
  const handleCameraInput = (recognizedIngredients: string[]) => {
    if (recognizedIngredients.length > 0) {
      recognizedIngredients.forEach(ingredient => {
        addIngredient(ingredient);
      });
    }
    
    // Close the camera input
    setShowCameraInput(false);
  };

  // Remove ingredient at index
  const handleRemoveIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeIngredient(index);
  };

  // Clear all ingredients
  const handleClearAll = () => {
    if (ingredients.length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      "Clear All Ingredients",
      "Are you sure you want to clear all ingredients?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearIngredients()
        }
      ]
    );
  };

  // Continue to recipe generation
  const handleContinue = () => {
    if (ingredients.length === 0) {
      Alert.alert(
        "No Ingredients",
        "Please add at least one ingredient to generate a recipe."
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  };

  // Render individual ingredient item
  const renderIngredient = ({ item, index }: { item: string, index: number }) => (
    <View style={styles.ingredientItem}>
      <Text style={styles.ingredientText}>{item}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveIngredient(index)}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="close-circle" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-outline" size={28} color={colors.text} />
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

          {/* Instructions */}
          <Text style={styles.instruction}>
            Enter ingredients you have separated by commas or each on a new line.
          </Text>

          {/* Input Methods Section */}
          <View style={styles.inputMethodsContainer}>
            {/* Text Input */}
            <TextArea
              value={inputText}
              onChangeText={setInputText}
              placeholder="Example: 1lb ground beef, onions, garlic..."
              onSubmit={handleAddFromText}
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
                onPress={() => setShowCameraInput(true)}
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
                    !inputText.trim() && styles.disabledButtonText
                  ]}
                >
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ingredients List */}
          <View style={styles.ingredientsListContainer}>
            <Text style={styles.ingredientsListTitle}>
              Your Ingredients {ingredients.length > 0 && `(${ingredients.length})`}
            </Text>
            
            <FlatList
              data={ingredients}
              renderItem={renderIngredient}
              keyExtractor={(item, index) => `${item}-${index}`}
              contentContainerStyle={styles.ingredientsList}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>
                  No ingredients added yet. Start by typing, speaking, or scanning ingredients.
                </Text>
              }
            />
          </View>

          {/* Continue Button */}
          {!keyboard && (
            <TouchableOpacity
              style={[
                styles.continueButton,
                ingredients.length === 0 && styles.disabledButton
              ]}
              onPress={handleContinue}
              disabled={ingredients.length === 0}
            >
              <Text style={styles.continueButtonText}>Generate Recipe</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={styles.continueButtonIcon} />
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>

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
            onComplete={handleCameraInput}
            onClose={() => setShowCameraInput(false)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.error,
    fontFamily: 'Poppins-Medium',
  },
  disabledText: {
    color: colors.textTertiary,
  },
  instruction: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  inputMethodsContainer: {
    marginBottom: 20,
  },
  inputMethodsButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  inputMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    width: '30%',
  },
  inputMethodButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  disabledButtonText: {
    color: colors.textTertiary,
  },
  ingredientsListContainer: {
    flex: 1,
    marginTop: 8,
  },
  ingredientsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  ingredientsList: {
    flexGrow: 1,
  },
  emptyListText: {
    fontSize: 14,
    color: colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-Regular',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ingredientText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  removeButton: {
    padding: 4,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    fontFamily: 'Poppins-SemiBold',
  },
  continueButtonIcon: {
    marginLeft: 8,
  },
}); 