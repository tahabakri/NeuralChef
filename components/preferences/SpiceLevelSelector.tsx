import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { spiceLevels } from './constants'; // Ensure this has id, label, and potentially iconName
import { SpiceLevelSelectorProps } from './types';

// Helper to map spice level ID to an icon name
const getSpiceIconName = (levelId: string): keyof typeof Ionicons.glyphMap => {
  switch (levelId) {
    case 'none': return 'snow-outline';
    case 'mild': return 'thermometer-outline'; // A bit generic, could be more thematic
    case 'medium': return 'flame-outline';
    case 'spicy': return 'flame';
    case 'extraSpicy': return 'bonfire-outline'; // Example for extra spicy
    default: return 'help-circle-outline';
  }
};

const SpiceLevelSelector: React.FC<SpiceLevelSelectorProps> = ({
  selectedLevel,
  onSelectLevel,
}) => {
  return (
    // The main <View> is now transparent as background is handled by MoreOptionsSection
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Spice Level</Text>
      <Text style={styles.sectionSubtitle}>How much heat can you handle?</Text>

      <View style={styles.optionsContainer}> 
        {spiceLevels.map((level) => {
          const isSelected = selectedLevel === level.id;
          const iconName = getSpiceIconName(level.id);
          const iconColor = isSelected ? colors.white : colors.textSecondary;

          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                isSelected ? styles.selectedOptionCard : styles.unselectedOptionCard,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSelectLevel(level.id as any); // Cast if SpiceLevelType is strict
              }}
            >
              <Ionicons name={iconName} size={20} color={iconColor} style={styles.iconStyle} />
              <Text style={[
                styles.optionText,
                isSelected ? styles.selectedOptionText : styles.unselectedOptionText
              ]}>
                {level.label}
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
    paddingVertical: 10, // Reduced vertical padding, horizontal is from parent
    // No margin/background/border/shadow here - handled by MoreOptionsSection contentContainer
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: colors.textSecondary,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    marginVertical: 5, // Spacing between options
  },
  unselectedOptionCard: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
  },
  selectedOptionCard: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  iconStyle: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  unselectedOptionText: {
    color: colors.textSecondary,
  },
  // No selectedOptionText needed if text color is always white on both green/orange BG
});

export default SpiceLevelSelector;

// Developer Notes:
// - Background is now transparent; parent MoreOptionsSection provides glassmorphic background.
// - Styling adjusted to orange-green palette.
// - Icons are now dynamically colored (orange when selected, green otherwise).
// - Assumed spiceLevels in constants.ts has {id: string, label: string}.
// - Font placeholders need to be replaced.
