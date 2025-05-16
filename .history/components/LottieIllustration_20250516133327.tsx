import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

export type LottieType = 
  | 'empty-state'
  | 'recipe-success'
  | 'shopping-list'
  | 'welcome'
  | 'error';

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
      default:
        return require('../assets/animations/empty-state.json');
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LottieView
        source={getLottieSource()}
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