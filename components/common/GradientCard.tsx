import React from 'react';
import { 
  View, 
  StyleSheet, 
  StyleProp, 
  ViewStyle,
  Pressable,
  PressableProps,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import gradients, { GradientConfig } from '@/constants/gradients';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  Easing
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GradientCardProps extends PressableProps {
  children: React.ReactNode;
  gradient?: keyof typeof gradients | GradientConfig;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  elevation?: number;
  pressable?: boolean;
  roundness?: 'none' | 'small' | 'medium' | 'large';
  activeScale?: number;
}

/**
 * A customizable card component with gradient background
 */
export default function GradientCard({
  children,
  gradient = 'softPeach',
  style,
  contentStyle,
  elevation = 2,
  pressable = true,
  roundness = 'medium',
  activeScale = 0.98,
  ...rest
}: GradientCardProps) {
  const scale = useSharedValue(1);
  
  // Get the gradient configuration
  const gradientConfig = typeof gradient === 'string' 
    ? gradients[gradient] 
    : gradient;

  // Map roundness to border radius values
  const borderRadiusMap = {
    none: 0,
    small: 8,
    medium: 12,
    large: 16,
  };
  
  const borderRadius = borderRadiusMap[roundness];

  // Animation styles for press feedback
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  // Handle press animations
  const handlePressIn = () => {
    if (pressable) {
      scale.value = withTiming(activeScale, {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  // Create shadow styles based on elevation
  const shadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowOpacity: 0.1,
      shadowRadius: elevation * 1.5,
    },
    android: {
      elevation: elevation,
    },
  });

  // Render a pressable card or just a view
  const CardComponent = pressable ? AnimatedPressable : View;
  const cardProps = pressable ? {
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    ...rest,
  } : {};

  return (
    <CardComponent
      style={[
        styles.container,
        shadowStyle,
        pressable && animatedStyle,
        style,
      ]}
      {...cardProps}
    >
      <LinearGradient
        colors={gradientConfig.colors}
        start={gradientConfig.direction.start}
        end={gradientConfig.direction.end}
        style={[
          styles.gradient,
          { borderRadius },
        ]}
      >
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </LinearGradient>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  gradient: {
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
}); 