import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define the spacing values if not imported from a constants file
const spacing = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 24,
  xl: 22,
};

interface PrimaryActionsProps {
  onAddIngredientsPress: () => void;
  onSurpriseMePress: () => void;
}

const PrimaryActions: React.FC<PrimaryActionsProps> = ({
  onAddIngredientsPress,
  onSurpriseMePress,
}) => {
  return (
    <View style={styles.container}>
      {/* Add Ingredients Button */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onAddIngredientsPress}
        accessibilityLabel="Add ingredients"
        accessibilityHint="Opens a modal to add ingredients"
      >
        <View style={styles.buttonContent}>
          <Ionicons name="add-outline" size={20} color={colors.text} />
          <Text style={styles.buttonText}>Add Ingredients</Text>
        </View>
      </TouchableOpacity>
      
      {/* Surprise Me Button */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onSurpriseMePress}
        accessibilityLabel="Surprise me with a lunch recipe"
        accessibilityHint="Generates a random lunch recipe suggestion"
      >
        <View style={styles.buttonContent}>
          <Ionicons name="sparkles-outline" size={20} color={colors.text} />
          <View style={styles.surpriseTextContainer}>
            <Text style={styles.buttonText}>Surprise Me</Text>
            <Text style={styles.surpriseSubtext}>with a Lunch Recipe</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FEF7F0', // Light peach/beige consistent with design
    borderRadius: 25, // Pill shape
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  surpriseTextContainer: {
    flexDirection: 'column',
    marginLeft: spacing.sm,
  },
  surpriseSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 12,
  },
});

export default PrimaryActions;
