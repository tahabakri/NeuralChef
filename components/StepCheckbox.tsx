import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';

interface StepCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function StepCheckbox({
  checked,
  onToggle,
  size = 24,
  style,
  disabled = false,
}: StepCheckboxProps) {
  // Create animated values for the checkbox
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const opacityValue = React.useRef(new Animated.Value(checked ? 1 : 0)).current;
  
  // Update opacity animation when checked status changes
  React.useEffect(() => {
    Animated.timing(opacityValue, {
      toValue: checked ? 1 : 0,
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [checked, opacityValue]);
  
  // Animate the scale when pressed
  const animateScale = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.85,
        duration: 100,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Handle checkbox press
  const handlePress = () => {
    if (disabled) return;
    
    animateScale();
    onToggle();
  };
  
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      onPress={handlePress}
      style={[styles.container, style]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={checked ? "Mark as incomplete" : "Mark as complete"}
    >
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: checked ? 0 : 2,
            transform: [{ scale: scaleValue }],
            backgroundColor: checked ? colors.primary : 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Animated.View style={{ opacity: opacityValue }}>
          <Ionicons name="checkmark" size={size * 0.7} color="white" />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4, // Extra padding for easier touch
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.primary,
  },
}); 