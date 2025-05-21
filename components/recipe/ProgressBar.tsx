import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
  completedSteps: number;
  totalSteps: number;
}

const ProgressBar = ({ progress, completedSteps, totalSteps }: ProgressBarProps) => {
  // Animated progress bar width
  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progress * 100}%`, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    };
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Progress</Text>
        <Text style={styles.stepCount}>
          {completedSteps} of {totalSteps} steps completed
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
  },
  stepCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.cardAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});

export default ProgressBar; 