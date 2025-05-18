import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import gradients, { GradientConfig, withOpacity } from '@/constants/gradients';
import typography from '@/constants/typography';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  gradient?: keyof typeof gradients | GradientConfig;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  rounded?: boolean;
  outline?: boolean;
}

/**
 * A customizable button component with gradient background
 */
export default function GradientButton({
  title,
  onPress,
  gradient = 'sunriseOrange',
  size = 'medium',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  style,
  textStyle,
  rounded = false,
  outline = false,
  ...rest
}: GradientButtonProps) {
  // Get the gradient configuration
  const gradientConfig = typeof gradient === 'string' 
    ? gradients[gradient] 
    : gradient;

  // Apply opacity if disabled
  const finalGradient = disabled 
    ? withOpacity(gradientConfig, 0.6) 
    : gradientConfig;

  // Get size-specific styles
  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: rounded ? 16 : 8,
      fontSize: 14,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: rounded ? 20 : 10,
      fontSize: 16,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: rounded ? 24 : 12,
      fontSize: 18,
    },
  };
  
  const selectedSize = sizeStyles[size];

  // Create gradient border for outline mode
  const outlineStyle = outline ? {
    padding: 1,
    backgroundColor: 'transparent',
  } : {};

  // Inner content container for outline mode
  const innerContainer = outline ? {
    backgroundColor: 'white',
    borderRadius: selectedSize.borderRadius - 1,
    padding: selectedSize.paddingVertical,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row' as const,
  } : {};

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonWrapper,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}
    >
      <LinearGradient
        colors={finalGradient.colors}
        start={finalGradient.direction.start}
        end={finalGradient.direction.end}
        style={[
          styles.gradient,
          {
            paddingVertical: selectedSize.paddingVertical,
            paddingHorizontal: selectedSize.paddingHorizontal,
            borderRadius: selectedSize.borderRadius,
          },
          fullWidth && styles.fullWidth,
          outlineStyle,
        ]}
      >
        {outline ? (
          <LinearGradient
            colors={['white', 'white']}
            style={[innerContainer, fullWidth && styles.fullWidth]}
          >
            {renderButtonContent()}
          </LinearGradient>
        ) : (
          renderButtonContent()
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  function renderButtonContent() {
    return (
      <>
        {iconLeft && !loading && <>{iconLeft}</>}
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={outline ? finalGradient.colors[0] : 'white'} 
          />
        ) : (
          <Text
            style={[
              styles.text,
              { fontSize: selectedSize.fontSize },
              outline && { color: finalGradient.colors[0] },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
        {iconRight && !loading && <>{iconRight}</>}
      </>
    );
  }
}

const styles = StyleSheet.create({
  buttonWrapper: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontFamily: typography.button.fontFamily,
    textAlign: 'center',
    marginHorizontal: 8,
  },
}); 