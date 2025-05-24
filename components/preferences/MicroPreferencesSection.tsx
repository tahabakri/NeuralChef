import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { microPreferences } from './constants'; // Ensure this has {id: string, label: string}
import { MicroPreferencesSectionProps, MicroPreference } from './types'; // Ensure MicroPreference matches type in store

const MicroPreferencesSection: React.FC<MicroPreferencesSectionProps> = ({
  selectedPreferences,
  onTogglePreference,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Fine-Tune Your Nutrition</Text>
      <Text style={styles.sectionSubtitle}>Any specific nutritional focus?</Text>

      <View style={styles.optionsContainer}>
        {microPreferences.map((preference) => {
          const isSelected = selectedPreferences.includes(preference.id as MicroPreference);
          return (
            <TouchableOpacity
              key={preference.id}
              style={[
                styles.optionChip,
                isSelected ? styles.selectedOptionChip : styles.unselectedOptionChip,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onTogglePreference(preference.id as MicroPreference);
              }}
            >
              <Text style={[
                styles.optionText,
                isSelected ? styles.selectedOptionText : styles.unselectedOptionText
              ]}>
                {preference.label}
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
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    margin: 4,
  },
  unselectedOptionChip: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
  },
  selectedOptionChip: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  unselectedOptionText: {
    color: colors.textSecondary,
  },
});

export default MicroPreferencesSection;

// Developer Notes:
// - Background is transparent.
// - Styling adjusted to orange-green palette with chip-like options.
// - Font placeholders need to be replaced.
// - Assumes microPreferences in constants.ts has {id: string, label: string}.
// - Type casting for `preference.id` to `MicroPreference` might be needed. 