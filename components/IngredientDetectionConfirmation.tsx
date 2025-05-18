import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Check, X, Edit2, Plus, Trash2, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import colors from '@/constants/colors';
import { validateIngredient } from '@/constants/ingredients';

interface IngredientDetectionConfirmationProps {
  visible: boolean;
  onClose: () => void;
  detectedIngredients: string[];
  onConfirm: (ingredients: string[]) => void;
  isProcessing?: boolean;
}

export default function IngredientDetectionConfirmation({
  visible,
  onClose,
  detectedIngredients,
  onConfirm,
  isProcessing = false
}: IngredientDetectionConfirmationProps) {
  // State for editable ingredients
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [invalidIngredients, setInvalidIngredients] = useState<Record<number, string>>({});
  
  // Update ingredients when detectedIngredients changes
  useEffect(() => {
    setIngredients(detectedIngredients);
    setEditingIndex(null);
    setEditingValue('');
    setNewIngredient('');
    setInvalidIngredients({});
  }, [detectedIngredients]);
  
  // Start editing an ingredient
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(ingredients[index]);
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Save edited ingredient
  const saveEdit = () => {
    if (editingIndex === null) return;
    
    // Validate the ingredient
    const trimmedValue = editingValue.trim();
    if (trimmedValue === '') {
      // If empty, remove the ingredient
      removeIngredient(editingIndex);
    } else {
      // Validate the ingredient
      const validationResult = validateIngredient(trimmedValue);
      
      if (validationResult === true) {
        // Update the ingredient
        const newIngredients = [...ingredients];
        newIngredients[editingIndex] = trimmedValue;
        setIngredients(newIngredients);
        
        // Clear invalid status if it was previously invalid
        if (invalidIngredients[editingIndex]) {
          const newInvalidIngredients = { ...invalidIngredients };
          delete newInvalidIngredients[editingIndex];
          setInvalidIngredients(newInvalidIngredients);
        }
      } else {
        // Mark as invalid
        setInvalidIngredients({
          ...invalidIngredients,
          [editingIndex]: typeof validationResult === 'string' ? validationResult : 'Invalid ingredient'
        });
      }
    }
    
    // Reset editing state
    setEditingIndex(null);
    setEditingValue('');
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Remove an ingredient
  const removeIngredient = (index: number) => {
    // Remove the ingredient
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
    
    // Remove from invalid ingredients if present
    if (invalidIngredients[index]) {
      const newInvalidIngredients = { ...invalidIngredients };
      delete newInvalidIngredients[index];
      
      // Adjust keys for remaining invalid ingredients
      const updatedInvalidIngredients: Record<number, string> = {};
      Object.entries(newInvalidIngredients).forEach(([key, value]) => {
        const numKey = parseInt(key);
        if (numKey > index) {
          updatedInvalidIngredients[numKey - 1] = value;
        } else {
          updatedInvalidIngredients[numKey] = value;
        }
      });
      
      setInvalidIngredients(updatedInvalidIngredients);
    }
    
    // Reset editing state if removing the one being edited
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue('');
    } else if (editingIndex !== null && editingIndex > index) {
      // Adjust editingIndex if removing an ingredient before it
      setEditingIndex(editingIndex - 1);
    }
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Add a new ingredient
  const addNewIngredient = () => {
    const trimmedValue = newIngredient.trim();
    if (trimmedValue === '') return;
    
    // Validate the ingredient
    const validationResult = validateIngredient(trimmedValue);
    
    if (validationResult === true) {
      // Add the ingredient if it doesn't already exist
      if (!ingredients.includes(trimmedValue)) {
        setIngredients([...ingredients, trimmedValue]);
        setNewIngredient('');
        
        // Provide haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        // Already exists
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } else {
      // Invalid ingredient
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };
  
  // Confirm and submit the ingredients
  const confirmIngredients = () => {
    // Filter out any invalid ingredients
    const validIngredients = ingredients.filter((_, index) => !invalidIngredients[index]);
    onConfirm(validIngredients);
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Check if there are any valid ingredients to confirm
  const hasValidIngredients = ingredients.some((_, index) => !invalidIngredients[index]);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Detected Ingredients</Text>
          <Text style={styles.subtitle}>
            Review and edit the detected ingredients before adding them to your recipe
          </Text>
          
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>
                Analyzing image...
              </Text>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              {/* Ingredients list */}
              <ScrollView style={styles.ingredientsList}>
                {ingredients.length === 0 ? (
                  <Text style={styles.noIngredientsText}>
                    No ingredients detected
                  </Text>
                ) : (
                  ingredients.map((ingredient, index) => (
                    <View 
                      key={index}
                      style={[
                        styles.ingredientItem,
                        invalidIngredients[index] && styles.invalidIngredient
                      ]}
                    >
                      {editingIndex === index ? (
                        // Editing mode
                        <View style={styles.editContainer}>
                          <TextInput
                            style={styles.editInput}
                            value={editingValue}
                            onChangeText={setEditingValue}
                            autoFocus
                            selectTextOnFocus
                          />
                          <View style={styles.editActions}>
                            <TouchableOpacity
                              style={styles.editButton}
                              onPress={saveEdit}
                            >
                              <Check size={20} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.editButton}
                              onPress={cancelEdit}
                            >
                              <X size={20} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        // Display mode
                        <View style={styles.displayContainer}>
                          <Text style={styles.ingredientText}>
                            {ingredient}
                          </Text>
                          
                          {invalidIngredients[index] && (
                            <View style={styles.errorContainer}>
                              <AlertTriangle size={14} color={colors.error} />
                              <Text style={styles.errorText}>
                                {invalidIngredients[index]}
                              </Text>
                            </View>
                          )}
                          
                          <View style={styles.actions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => startEditing(index)}
                            >
                              <Edit2 size={16} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => removeIngredient(index)}
                            >
                              <Trash2 size={16} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
              
              {/* Add new ingredient */}
              <View style={styles.addContainer}>
                <TextInput
                  style={styles.addInput}
                  value={newIngredient}
                  onChangeText={setNewIngredient}
                  placeholder="Add another ingredient..."
                  placeholderTextColor={colors.textTertiary}
                  returnKeyType="done"
                  onSubmitEditing={addNewIngredient}
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !newIngredient.trim() && styles.addButtonDisabled
                  ]}
                  onPress={addNewIngredient}
                  disabled={!newIngredient.trim()}
                >
                  <Plus size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
              
              {/* Confirm button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!hasValidIngredients || ingredients.length === 0) && styles.confirmButtonDisabled
                ]}
                onPress={confirmIngredients}
                disabled={!hasValidIngredients || ingredients.length === 0}
              >
                <Text style={styles.confirmButtonText}>Confirm Ingredients</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  contentContainer: {
    flex: 1,
  },
  ingredientsList: {
    maxHeight: 250,
    marginBottom: 16,
  },
  noIngredientsText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  ingredientItem: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  invalidIngredient: {
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  displayContainer: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  editButton: {
    padding: 8,
    marginLeft: 4,
  },
  processingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  addContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 