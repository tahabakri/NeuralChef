import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
        <Text style={styles.label}>Cooking Progress</Text>
        <Text style={styles.stepCount}>
          {completedSteps} of {totalSteps} steps completed
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBarWrapper, animatedProgressStyle]}>
          <LinearGradient
            colors={[colors.accentGreenStart, colors.accentGreenEnd]} // Using Accent Green gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressBarGradient}
          />
          {/* Glow effect at the leading edge - updated to match green accent */}
          <View style={[styles.glowEffect, { shadowColor: colors.accentGreenEnd }]} />
          
          {/* Step count inside bar if progress > 20% */}
          {progress > 0.2 && (
            <View style={styles.inBarCountContainer}>
              <Text style={styles.inBarCount}>
                {completedSteps} of {totalSteps}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
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
    fontFamily: 'OpenSans-Regular', // Ensure OpenSans for body text
    color: colors.textSecondary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.backgroundAlt, // Light track color
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarWrapper: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  glowEffect: {
    position: 'absolute',
    right: -8,
    top: -4,
    bottom: -4,
    width: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    // shadowColor is now set dynamically in the component
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  inBarCountContainer: {
    position: 'absolute',
    right: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inBarCount: {
    ...typography.bodySmall,
    color: colors.white,
    fontFamily: 'OpenSans-Regular', // Ensure OpenSans for body text
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ProgressBar;
