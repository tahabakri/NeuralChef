import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { SvgXml } from 'react-native-svg';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay,
  Easing 
} from 'react-native-reanimated';

// SVG illustrations
import { 
  EMPTY_STATE, 
  RECIPE_SUCCESS, 
  SHOPPING_LIST, 
  ONBOARDING_WELCOME, 
  ERROR_STATE 
} from '../assets/illustrations';

export type IllustrationType = 
  | 'empty-state'
  | 'recipe-success'
  | 'shopping-list'
  | 'onboarding-welcome'
  | 'error-state'
  | 'fallback';

interface CustomIllustrationProps {
  type: IllustrationType;
  size?: number;
  style?: ViewStyle;
  animationEnabled?: boolean;
  color?: string;
}

const CustomIllustration = ({ 
  type = 'fallback', 
  size = 180,
  style, 
  animationEnabled = true,
  color
}: CustomIllustrationProps) => {
  // Animation values
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Set up animations (only if enabled)
  useEffect(() => {
    if (!animationEnabled) return;

    // Floating animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
    
    // Subtle rotation animation
    rotation.value = withRepeat(
      withSequence(
        withTiming(-0.04, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.04, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Initial appear animation
    scale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withDelay(
        150, 
        withTiming(1.08, { 
          duration: 300, 
          easing: Easing.out(Easing.back(2)) 
        })
      ),
      withTiming(1, { duration: 200 })
    );
  }, [animationEnabled]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: animationEnabled ? translateY.value : 0 },
        { rotate: `${animationEnabled ? rotation.value : 0}rad` },
        { scale: animationEnabled ? scale.value : 1 }
      ]
    };
  });

  // Get SVG content based on type
  const getSvgContent = () => {
    switch (type) {
      case 'empty-state':
        return EMPTY_STATE;
      case 'recipe-success':
        return RECIPE_SUCCESS;
      case 'shopping-list':
        return SHOPPING_LIST;
      case 'onboarding-welcome':
        return ONBOARDING_WELCOME;
      case 'error-state':
        return ERROR_STATE;
      case 'fallback':
      default:
        // Use a fallback image from assets
        return null;
    }
  };

  const svgContent = getSvgContent();
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Reanimated.View style={[styles.imageContainer, animatedStyle]}>
        {svgContent ? (
          <SvgXml 
            xml={svgContent} 
            width={size} 
            height={size} 
            color={color}
          />
        ) : (
          <Image
            source={require('@/assets/images/empty-plate.png')}
            style={styles.image}
            contentFit="contain"
          />
        )}
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
  }
});

export default CustomIllustration; 