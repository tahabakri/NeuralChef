import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolateColor,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import Button from './Button';

interface PulseButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  gradientColors?: string[];
  pulseDuration?: number;
  pulseIntensity?: number;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const PulseButton = ({
  title,
  onPress,
  variant = 'gradient',
  style,
  textStyle,
  icon,
  gradientColors = ['#28A745', '#F4A261'],
  pulseDuration = 2000,
  pulseIntensity = 1.05,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint
}: PulseButtonProps) => {
  // Animation values
  const pulse = useSharedValue(0);
  const glow = useSharedValue(0);
  
  useEffect(() => {
    // Pulse animation
    pulse.value = withRepeat(
      withTiming(1, { 
        duration: pulseDuration,
        easing: Easing.inOut(Easing.ease)
      }),
      -1, // Infinite repeat
      true // Reverse
    );
    
    // Glow animation
    glow.value = withRepeat(
      withTiming(1, { 
        duration: pulseDuration / 2,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    );
  }, [pulseDuration]);
  
  // Animated styles
  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulse.value,
      [0, 1],
      [1, pulseIntensity],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale }]
    };
  });
  
  const shadowStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(
        glow.value,
        [0, 1],
        [0.2, 0.4],
        Extrapolate.CLAMP
      ),
      shadowRadius: interpolate(
        glow.value,
        [0, 1],
        [4, 8],
        Extrapolate.CLAMP
      ),
    };
  });
  
  return (
    <Reanimated.View style={[styles.container, pulseStyle, shadowStyle, style]}>
      <Button 
        title={title}
        onPress={onPress}
        variant={variant}
        textStyle={textStyle}
        icon={icon}
        fullWidth={fullWidth}
        accessibilityLabel={accessibilityLabel}
        style={styles.button}
      />
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderRadius: 12,
  },
  button: {
    // The button has its own styling
  }
});

export default PulseButton; 