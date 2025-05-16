import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay,
  Easing 
} from 'react-native-reanimated';

interface EmptyStateAnimationProps {
  style?: object;
  size?: number;
}

const EmptyStateAnimation = ({ 
  style, 
  size = 180 
}: EmptyStateAnimationProps) => {
  // Animation values
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Set up animations
  useEffect(() => {
    // Floating animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
    
    // Subtle rotation animation (adds visual interest)
    rotation.value = withRepeat(
      withSequence(
        withTiming(-0.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Initial appear animation
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }), // Start smaller
      withDelay(
        150, 
        withTiming(1.1, { 
          duration: 300, 
          easing: Easing.out(Easing.back(2)) 
        })
      ),
      withTiming(1, { duration: 200 })
    );
  }, []);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotation.value}rad` },
        { scale: scale.value }
      ]
    };
  });
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Reanimated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={require('@/assets/images/empty-plate.png')}
          style={styles.image}
          contentFit="contain"
        />
        {/* Colored outline effect */}
        <View style={styles.colorAccent} />
      </Reanimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  colorAccent: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#34C759',
    opacity: 0.6,
  }
});

export default EmptyStateAnimation; 