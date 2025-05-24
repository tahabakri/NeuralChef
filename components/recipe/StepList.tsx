import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import TimerButton from './TimerButton'; // Assuming this is components/recipe/TimerButton.tsx
import ImageStep from '../ImageStep'; // Assuming this is components/ImageStep.tsx

interface Step {
  description: string;
  imageUrl?: string;
  time?: number; // Time in minutes
  altText?: string; // For ImageStep
}

interface StepListProps {
  steps: Step[];
  completedSteps: number[];
  onToggleStep: (index: number) => void;
  // onRegenerateImage?: (index: number) => void; // Optional: if image regeneration is per step
}

const StepList = ({ steps, completedSteps, onToggleStep }: StepListProps) => {
  if (!steps || steps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No instructions available</Text>
      </View>
    );
  }

  const activeStepIndex = steps.findIndex((_, i) => !completedSteps.includes(i));

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isActive = index === activeStepIndex;

        return (
          <View key={`step-${index}`} style={styles.stepItemContainer}>
            <View style={styles.stepRow}>
              <TouchableOpacity
                style={styles.checkboxAndNumberContainer}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onToggleStep(index);
                }}
                accessibilityLabel={`Step ${index + 1}, ${step.description}. Status: ${isCompleted ? 'Completed' : isActive ? 'Current step' : 'Pending'}`}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.stepIndicator,
                    isCompleted && styles.completedIndicator,
                    isActive && styles.activeIndicator,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  ) : (
                    <Text style={[
                      styles.stepIndicatorText,
                      isActive && styles.activeIndicatorText
                    ]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepDescription,
                    isCompleted && styles.completedDescription,
                    isActive && styles.activeDescription,
                  ]}
                >
                  {step.description}
                </Text>
              </View>
            </View>

            {/* Content below the step text (image, timer) */}
            {(step.imageUrl || (step.time && step.time > 0)) && (
              <View style={styles.stepExtrasContainer}>
                {step.imageUrl && (
                  <View style={styles.imageWrapper}>
                    <ImageStep
                      imageUrl={step.imageUrl}
                      altText={step.altText || `Image for step ${index + 1}`}
                      isCompleted={isCompleted}
                      // onRegenerateImage={onRegenerateImage ? () => onRegenerateImage(index) : undefined}
                    />
                  </View>
                )}

                {step.time && step.time > 0 && (
                  <View style={styles.timerWrapper}>
                    <TimerButton minutes={step.time} />
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  stepItemContainer: {
    marginBottom: spacing.lg,
    paddingLeft: spacing.sm, // Give a bit of left padding for the whole item
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align checkbox to top of text
  },
  checkboxAndNumberContainer: {
    marginRight: spacing.md,
    alignItems: 'center',
    paddingTop: 2, // Fine-tune vertical alignment with text
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIndicator: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  activeIndicator: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  stepIndicatorText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textSecondary,
  },
  activeIndicatorText: {
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    ...typography.bodyMedium,
    fontFamily: 'OpenSans-Regular',
    color: colors.text,
    lineHeight: 23,
  },
  completedDescription: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  activeDescription: {
    fontFamily: 'OpenSans-SemiBold',
    color: colors.primary,
  },
  stepExtrasContainer: {
    // This container will hold image and timer, aligned with step text
    marginLeft: 28 + spacing.md, // (indicator width + margin)
    marginTop: spacing.sm,
  },
  imageWrapper: {
    marginBottom: spacing.md,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden', // Ensures ImageStep respects border radius
  },
  timerWrapper: {
    alignSelf: 'flex-start', // Make timer pill not take full width
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    fontFamily: 'OpenSans-Regular',
    color: colors.textSecondary,
  },
});

export default StepList;
