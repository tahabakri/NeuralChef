import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cuisineTypes } from './constants';
import { CuisineTypeSelectorProps } from './types';

// Theme colors matching other preference sections
const theme = {
  orange: '#FF8C00',
  green: '#50C878',
  white: '#FFFFFF',
  // textDark: '#333333',
  // textLight: '#555555',
};

const CuisineTypeSelector: React.FC<CuisineTypeSelectorProps> = ({
  selectedCuisines,
  onToggleCuisine,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cuisine Preferences</Text>
      <Text style={styles.sectionSubtitle}>What flavors are you craving?</Text>

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
                style={styles.optionText}
              >
                {cuisine.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    // Transparent background, styling handled by MoreOptionsSection
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.orange,
    marginBottom: 3,
    fontFamily: 'PlayfulFont-Bold', // Placeholder
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.green,
    marginBottom: 12,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // Offset for chip margins
  },
  optionChip: {
    paddingHorizontal: 14, // More padding for a chip feel
    paddingVertical: 10,
    borderRadius: 20, // Fully rounded chips
    borderWidth: 2,
    margin: 4, // Spacing between chips
  },
  unselectedOptionChip: {
    backgroundColor: theme.green,
    borderColor: theme.orange,
  },
  selectedOptionChip: {
    backgroundColor: theme.orange,
    borderColor: theme.green,
  },
  optionText: {
    fontSize: 14,
    color: theme.white,
    fontWeight: '600',
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
  },
});

export default CuisineTypeSelector;

// Developer Notes:
// - Background is transparent.
// - Styling adjusted to orange-green palette with chip-like options.
// - Font placeholders need to be replaced.
// - Assumes cuisineTypes in constants.ts has {id: string, label: string}. 