import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
// import colors from '@/constants/colors'; // Removed, using new theme
import { spiceLevels } from './constants'; // Ensure this has id, label, and potentially iconName
import { SpiceLevelSelectorProps } from './types';

// Theme colors matching other preference sections
const theme = {
  orange: '#FF8C00',
  green: '#50C878',
  white: '#FFFFFF',
  // glassBg: 'rgba(255, 255, 255, 0.2)', // Not needed here, parent provides background
  // borderColor: 'rgba(255, 255, 255, 0.3)', // Not needed here
  // shadowColor: 'rgba(0, 0, 0, 0.1)', // Not needed here
  textDark: '#333333', // For general text if needed
  textLight: '#555555', // For subtitles or less prominent text
};

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
          const iconColor = isSelected ? theme.orange : theme.green;

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
              <Text style={styles.optionText}>{level.label}</Text>
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
    fontSize: 18, // Adjusted size for sub-section
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
    // Using flex-wrap and row direction for options if they should be side-by-side
    // If they are full-width buttons, this can be simpler (column direction)
    // For this example, let's assume full-width option cards (like list items)
    flexDirection: 'column', 
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    marginVertical: 5, // Spacing between options
  },
  unselectedOptionCard: {
    backgroundColor: theme.green,
    borderColor: theme.orange,
  },
  selectedOptionCard: {
    backgroundColor: theme.orange,
    borderColor: theme.green,
  },
  iconStyle: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 15,
    color: theme.white,
    fontWeight: '600',
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
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
