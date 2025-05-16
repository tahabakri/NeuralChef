import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Image } from 'expo-image';
import colors from '@/constants/colors';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  imageOverlay?: boolean;
  gradientColors?: string[];
  imageUri?: string;
  imageStyle?: StyleProp<ViewStyle>;
}

export default function Card({ 
  children, 
  style, 
  variant = 'default',
  onPress,
  imageOverlay = false,
  gradientColors = ['transparent', 'rgba(0,0,0,0.5)'],
  imageUri,
  imageStyle
}: CardProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 200 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
  };
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      default:
        return styles.default;
    }
  };
  
  const renderContent = () => {
    return (
      <>
        {imageUri && (
          <Image 
            source={{ uri: imageUri }} 
            style={[styles.cardImage, imageStyle]}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            recyclingKey={imageUri}
          />
        )}
        {children}
        {imageOverlay && (
          <LinearGradient 
            colors={gradientColors as any}
            style={styles.overlay}
            pointerEvents="none"
          />
        )}
      </>
    );
  };
  
  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity 
          style={[styles.card, getVariantStyle(), style]}
          onPress={onPress}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }
  
  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.card,
  },
  elevated: {
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
});