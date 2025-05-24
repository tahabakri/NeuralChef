import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import gradients from '@/constants/gradients';

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
  onChefsPickPress: () => void;
  ingredientsDetected?: boolean;
  hasNewAIRecipes?: boolean;
}

const PrimaryActions: React.FC<PrimaryActionsProps> = ({
  onAddIngredientsPress,
  onChefsPickPress,
  ingredientsDetected = false,
  hasNewAIRecipes = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Add Ingredients Button */}
      <TouchableOpacity 
        style={styles.actionButtonWrapper}
        onPress={onAddIngredientsPress}
        accessibilityLabel="Add ingredients"
        accessibilityHint="Opens a modal to add ingredients"
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8DC2FF', '#4A9DFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionButton}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="add-outline" size={22} color="white" style={styles.iconStyle} />
            <Text style={styles.addIngredientsButtonText}>+ Add Ingredients</Text>
            {ingredientsDetected && (
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Chef's Pick Button (renamed from Surprise Me) */}
      <TouchableOpacity 
        style={styles.actionButtonWrapper}
        onPress={onChefsPickPress}
        accessibilityLabel="Get AI chef's pick recommendation"
        accessibilityHint="AI generates a personalized lunch recipe suggestion"
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#F8985C', '#F17A3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionButton}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="sparkles" size={20} color="white" style={styles.iconStyle} />
            <View style={styles.chefPickTextContainer}>
              <Text style={styles.chefPickMainText}>Chef's Pick</Text>
              <Text style={styles.chefPickSubtext}>AI Suggestion</Text>
            </View>
            {hasNewAIRecipes && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
          </View>
        </LinearGradient>
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
  actionButtonWrapper: {
    flex: 1,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  actionButton: {
    borderRadius: 25,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconStyle: {
    marginRight: spacing.sm, // Add some space between icon and text
  },
  addIngredientsButtonText: {
    ...typography.button,
    fontFamily: 'Poppins-SemiBold', // Assuming Poppins is set up
    color: 'white',
    // marginLeft: spacing.sm, // iconStyle handles margin
  },
  chefPickTextContainer: {
    flexDirection: 'column',
    // marginLeft: spacing.sm, // iconStyle handles margin
    alignItems: 'center', // Center text lines if they have different widths
  },
  chefPickMainText: {
    ...typography.button,
    fontFamily: 'Poppins-SemiBold', // Assuming Poppins is set up
    color: 'white',
  },
  chefPickSubtext: {
    ...typography.caption,
    fontFamily: 'Poppins-Regular', // Assuming Poppins is set up
    color: 'rgba(255, 255, 255, 0.85)', // Lighter white
    textAlign: 'center',
    marginTop: 2, // Small space between the two lines
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
});

export default PrimaryActions;
