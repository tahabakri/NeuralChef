import React, { ReactNode, memo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Platform, ImageStyle, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  imageOverlay?: boolean;
  gradientColors?: string[];
  imageUri?: string;
  imageStyle?: StyleProp<ImageStyle>;
  title?: string;
  subtitle?: string;
}

const Card = ({ 
  children, 
  style, 
  variant = 'default',
  onPress,
  imageOverlay = false,
  gradientColors = ['transparent', 'rgba(0,0,0,0.5)'],
  imageUri,
  imageStyle,
  title,
  subtitle
}: CardProps) => {
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
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUri }} 
              style={[styles.cardImage, imageStyle]}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              recyclingKey={imageUri}
              cachePolicy="memory-disk"
              priority={onPress ? "normal" : "low"}
              contentPosition="center"
            />
            {imageOverlay && (
              <LinearGradient 
                colors={gradientColors as any}
                style={styles.overlay}
                pointerEvents="none"
              />
            )}
          </View>
        )}
        
        {(title || subtitle) && (
          <View style={styles.headerContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
        
        <View style={styles.contentContainer}>
          {children}
        </View>
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
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
    marginVertical: 8,
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
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 16,
  },
  title: {
    ...typography.title3,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

export default memo(Card);