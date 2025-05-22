import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
// import colors from '@/constants/colors'; // Removed
import { cookingGoals } from './constants'; // Ensure this has {id: string, label: string}
import { CookingGoalsSectionProps, CookingGoal } from './types'; // Ensure CookingGoal matches type in store if applicable

// Theme colors matching other preference sections
const theme = {
  orange: '#FF8C00',
  green: '#50C878',
  white: '#FFFFFF',
};

const CookingGoalsSection: React.FC<CookingGoalsSectionProps> = ({
  selectedGoals,
  onToggleGoal,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Cooking Aspirations</Text>
      <Text style={styles.sectionSubtitle}>What are your goals in the kitchen?</Text>

      <View style={styles.optionsContainer}>
        {cookingGoals.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id as CookingGoal); // Cast if selectedGoals is strictly CookingGoal[]
          return (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.optionChip,
                isSelected ? styles.selectedOptionChip : styles.unselectedOptionChip,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onToggleGoal(goal.id as CookingGoal); // Cast if onToggleGoal expects CookingGoal type
              }}
            >
              <Text style={styles.optionText}>
                {goal.label}
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

export default CookingGoalsSection;

// Developer Notes:
// - Background is transparent.
// - Styling adjusted to orange-green palette with chip-like options.
// - Font placeholders need to be replaced.
// - Assumes cookingGoals in constants.ts has {id: string, label: string}.
// - Type casting for `goal.id` to `CookingGoal` might be needed based on actual types. 