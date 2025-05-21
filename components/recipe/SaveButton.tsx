import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
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
  // Animation values
  const scale = useSharedValue(1);
  const colorFlash = useSharedValue(0);
  
  // Animate when state changes
  useEffect(() => {
    colorFlash.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
  }, [saved]);
  
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
  
  // Color flash animation style
  const flashAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = saved 
      ? `rgba(76, 175, 80, ${colorFlash.value})` // Green flash when saved
      : `rgba(255, 167, 38, ${colorFlash.value})`; // Orange flash when unsaved
    
    return {
      backgroundColor,
      opacity: colorFlash.value * 0.6,
    };
  });
  
  // Press handler with animation
  const handlePress = () => {
    animatePress();
    colorFlash.value = 1;
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
        <View style={[styles.buttonInner, light && styles.circleBackground]}>
          <Animated.View style={[styles.flashEffect, flashAnimatedStyle]} />
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={light ? colors.white : colors.primary}
          />
        </View>
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
  },
  buttonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circleBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  flashEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
  }
});

export default SaveButton; 