import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
// import colors from '@/constants/colors'; // Removed
import { microPreferences } from './constants'; // Ensure this has {id: string, label: string}
import { MicroPreferencesSectionProps, MicroPreference } from './types'; // Ensure MicroPreference matches type in store

// Theme colors matching other preference sections
const theme = {
  orange: '#FF8C00',
  green: '#50C878',
  white: '#FFFFFF',
};

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
              <Text style={styles.optionText}>
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
    paddingHorizontal: 14,
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

export default MicroPreferencesSection;

// Developer Notes:
// - Background is transparent.
// - Styling adjusted to orange-green palette with chip-like options.
// - Font placeholders need to be replaced.
// - Assumes microPreferences in constants.ts has {id: string, label: string}.
// - Type casting for `preference.id` to `MicroPreference` might be needed. 