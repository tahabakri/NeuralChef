import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  barColor?: string; // Optional: to customize bar color, defaults to green
  height?: number; // Optional: to customize bar height
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  barColor = '#4CAF50', // Default green
  height = 8, // Default height
}: ProgressBarProps) {
  if (totalSteps <= 0) {
    return null; // Don't render if there are no steps
  }

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const clampedProgress = Math.min(Math.max(progress, 0), 100); // Ensure progress is between 0 and 100

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.progressText}>
          {currentStep}/{totalSteps} steps completed
        </Text>
        <Text style={styles.percentageText}>
          ({clampedProgress.toFixed(0)}%)
        </Text>
      </View>
      <View style={[styles.barBackground, { height }]}>
        <View
          style={[
            styles.barForeground,
            { 
              width: `${clampedProgress}%`, 
              backgroundColor: barColor,
              height: '100%',
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  percentageText: {
    ...typography.caption,
    color: colors.primary, // Or use barColor if dynamic color is preferred for text too
    fontWeight: 'bold',
  },
  barBackground: {
    backgroundColor: colors.border, // Light gray for the background of the bar
    borderRadius: 4, // Corresponds to half of default height for rounded ends
    overflow: 'hidden', // Ensures foreground bar respects border radius
  },
  barForeground: {
    borderRadius: 4, // Match background for consistency
  },
});
