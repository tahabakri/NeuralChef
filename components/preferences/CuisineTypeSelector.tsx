import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { cuisineTypes } from './constants';
import { CuisineTypeSelectorProps } from './types';

const CuisineTypeSelector: React.FC<CuisineTypeSelectorProps> = ({
  selectedCuisines,
  onToggleCuisine,
  customCuisines,
  onAddCustomCuisine,
  onRemoveCustomCuisine,
}) => {
  const [newCuisine, setNewCuisine] = useState('');

  const handleAddCuisine = useCallback(() => {
    const trimmedCuisine = newCuisine.trim();
    if (trimmedCuisine && !selectedCuisines.includes(trimmedCuisine.toLowerCase()) && !customCuisines.includes(trimmedCuisine)) {
      onAddCustomCuisine(trimmedCuisine);
      setNewCuisine('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [newCuisine, selectedCuisines, customCuisines, onAddCustomCuisine]);

  // Combine predefined and custom selected cuisines for display, ensuring no duplicates if a custom one matches a predefined one's ID
  const allSelectedCuisines = Array.from(new Set([...selectedCuisines, ...customCuisines]));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cuisine Preferences</Text>
      <Text style={styles.sectionSubtitle}>What flavors are you craving? Select or add your own.</Text>

      <View style={styles.optionsContainer}>
        {cuisineTypes.map((cuisine) => {
          const isSelected = selectedCuisines.includes(cuisine.id);
          return (
            <TouchableOpacity
              key={cuisine.id}
              style={[
                styles.optionChip,
                isSelected ? styles.selectedOptionChip : styles.unselectedOptionChip,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onToggleCuisine(cuisine.id);
              }}
            >
              <Text 
                style={[
                  styles.optionText,
                  isSelected ? styles.selectedOptionText : styles.unselectedOptionText
                ]}
              >
                {cuisine.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* Display custom cuisines as non-toggleable chips with a remove button */}
        {customCuisines.map((cuisine) => (
          <View key={cuisine} style={[styles.optionChip, styles.customSelectedChip]}>
            <Text style={[styles.optionText, styles.customSelectedChipText]}>{cuisine}</Text>
            <TouchableOpacity onPress={() => onRemoveCustomCuisine(cuisine)} style={styles.removeChipButton}>
              <Ionicons name="close-circle" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.addCuisineContainer}>
        <TextInput
          style={styles.cuisineInput}
          placeholder="Add a custom cuisine..."
          placeholderTextColor={colors.textTertiary}
          value={newCuisine}
          onChangeText={setNewCuisine}
          onSubmitEditing={handleAddCuisine}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddCuisine}>
          <Ionicons name="add-outline" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>
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
    color: colors.primary,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 15, // Space before the input field
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unselectedOptionChip: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
  },
  selectedOptionChip: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  customSelectedChip: {
    backgroundColor: colors.primary, // Different color for custom chips
    borderColor: colors.primaryDark, 
  },
  customSelectedChipText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5, // Space for remove icon on custom chips
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  unselectedOptionText: {
    color: colors.textSecondary,
  },
  removeChipButton: {
    marginLeft: 'auto',
    padding: 2,
  },
  addCuisineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Space above input field
  },
  cuisineInput: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.success,
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CuisineTypeSelector;

// Developer Notes:
// - Background is transparent.
// - Styling adjusted to orange-green palette with chip-like options.
// - Font placeholders need to be replaced.
// - Assumes cuisineTypes in constants.ts has {id: string, label: string}. 