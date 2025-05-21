import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define spacing values if not imported from a constants file
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    pill: 48,
  },
};

interface WeeklyCookingGoalProps {
  goal: number;
  completedCount: number;
  motivationalText: string;
  onEditGoalPress: () => void;
  onMarkMealCookedPress: () => void;
}

const WeeklyCookingGoal: React.FC<WeeklyCookingGoalProps> = ({
  goal,
  completedCount,
  motivationalText,
  onEditGoalPress,
  onMarkMealCookedPress
}) => {
  // Calculate progress percentage
  const progressPercentage = (completedCount / goal) * 100;
  
  // Determine if the goal is completed
  const isGoalCompleted = completedCount >= goal;

  return (
    <View style={styles.container}>
      {/* Header View with title and edit icon */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Weekly Cooking Goal</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={onEditGoalPress}
          accessibilityLabel="Edit weekly cooking goal"
          accessibilityRole="button"
        >
          <Ionicons name="pencil-outline" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Goal Text */}
      <Text style={styles.goalText}>
        Cook {goal} meals this week
      </Text>

      {/* Progress Bar Container */}
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${Math.min(progressPercentage, 100)}%` }]}
        />
      </View>

      {/* Status Text */}
      <Text style={styles.statusText}>
        {completedCount}/{goal} meals cooked
      </Text>

      {/* Mark Meal Cooked Button */}
      <TouchableOpacity 
        style={[
          styles.markMealButton,
          isGoalCompleted && styles.disabledButton
        ]}
        onPress={onMarkMealCookedPress}
        disabled={isGoalCompleted}
        accessibilityLabel="Mark meal as cooked"
        accessibilityRole="button"
        accessibilityState={{ disabled: isGoalCompleted }}
      >
        <Text style={[
          styles.markMealButtonText,
          isGoalCompleted && styles.disabledButtonText
        ]}>
          ✔️ Mark Meal Cooked
        </Text>
      </TouchableOpacity>

      {/* Motivational Text */}
      <Text style={styles.motivationalText}>
        {motivationalText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title3,
    color: colors.text,
  },
  editButton: {
    padding: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  goalText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  markMealButton: {
    backgroundColor: colors.secondary,
    borderRadius: spacing.borderRadius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  markMealButtonText: {
    ...typography.button,
    color: colors.white,
  },
  motivationalText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: colors.backgroundDisabled,
  },
  disabledButtonText: {
    color: colors.textDisabled,
  },
});

export default WeeklyCookingGoal; 