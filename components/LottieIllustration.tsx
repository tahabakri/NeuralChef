import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

export type LottieType = 
  | 'empty-state'
  | 'recipe-success'
  | 'shopping-list'
  | 'welcome'
  | 'error'
  | 'cooking'
  | 'magic-wand'
  | 'sun' // Added sun type
  | 'moon'; // Added moon type

interface LottieIllustrationProps {
  type: LottieType;
  size?: number;
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
}

const LottieIllustration = ({ 
  type,
  size = 180,
  style,
  autoPlay = true,
  loop = true,
  speed = 1
}: LottieIllustrationProps) => {
  
  const getLottieSource = (): any => {
    switch (type) {
      case 'empty-state':
        return require('../assets/animations/empty-state.json');
      case 'recipe-success':
        return require('../assets/animations/recipe-success.json');
      case 'shopping-list':
        return require('../assets/animations/shopping-list.json');
      case 'welcome':
        return require('../assets/animations/welcome.json');
      case 'error':
        return require('../assets/animations/error.json');
      case 'cooking':
        return require('../assets/animations/cooking.json');
      case 'magic-wand':
        return require('../assets/animations/magic-wand.json');
      case 'sun':
        return require('../assets/animations/sun.json'); // Added sun animation
      case 'moon':
        return require('../assets/animations/moon.json'); // Added moon animation (assuming file exists)
      default:
        return require('../assets/animations/empty-state.json');
    }
  };

  const lottieSource = useMemo(() => getLottieSource(), [type]);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LottieView
        source={lottieSource}
        style={styles.lottie}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  }
});

export default LottieIllustration;
