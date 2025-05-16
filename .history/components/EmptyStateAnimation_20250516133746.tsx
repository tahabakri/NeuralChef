import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieIllustration from './LottieIllustration';

interface EmptyStateAnimationProps {
  style?: object;
  size?: number;
}

const EmptyStateAnimation = ({ 
  style, 
  size = 180 
}: EmptyStateAnimationProps) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LottieIllustration
        type="empty-state"
        size={size}
        autoPlay={true}
        loop={true}
      />
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