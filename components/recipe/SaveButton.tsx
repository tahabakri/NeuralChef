import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing
} from 'react-native-reanimated';
import colors from '@/constants/colors';

interface SaveButtonProps {
  saved: boolean;
  onPress: () => void;
  light?: boolean; // For light/dark background
}

const SaveButton = ({ saved, onPress, light = false }: SaveButtonProps) => {
  // Animation value
  const scale = useSharedValue(1);
  
  // Animate when pressed
  const animatePress = () => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.2, { damping: 4, stiffness: 300 }),
      withTiming(1, { duration: 200 })
    );
  };
  
  // Button animation style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  // Press handler with animation
  const handlePress = () => {
    animatePress();
    onPress();
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={saved ? "Remove from saved recipes" : "Save recipe"}
        accessibilityRole="button"
      >
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={light ? colors.white : colors.primary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SaveButton; 