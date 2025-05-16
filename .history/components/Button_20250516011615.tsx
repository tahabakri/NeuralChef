import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}: ButtonProps) => {
  
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGradient = variant === 'gradient';
  
  const getButtonStyles = (): ViewStyle => {
    let buttonStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && styles.disabled),
    };
    
    if (isOutline) {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#34C759',
      };
    } else if (!isPrimary && !isGradient) {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: '#E8F5E9',
      };
    }

    // Apply shadow for gradient and primary buttons
    if ((isPrimary || isGradient) && !disabled) {
      buttonStyle = {
        ...buttonStyle,
        ...styles.buttonShadow,
        // Add extra shadow for gradient buttons
        ...(isGradient && styles.gradientButtonShadow)
      };
    }
    
    return buttonStyle;
  };
  
  const getTextStyles = (): TextStyle => {
    let textStyleObj: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };
    
    if (isOutline) {
      textStyleObj = {
        ...textStyleObj,
        color: '#34C759',
      };
    } else if (!isPrimary && !isGradient) {
      textStyleObj = {
        ...textStyleObj,
        color: '#34C759',
      };
    }
    
    return textStyleObj;
  };
  
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={isOutline ? '#34C759' : 'white'} />
      ) : (
        <>
          {icon && icon}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
        </>
      )}
    </>
  );

  // Use gradient for both primary and gradient variant buttons
  if ((isPrimary || isGradient) && !disabled) {
    const gradientColors = isGradient 
      ? ['#FF6B3C', '#FF9800'] as const 
      : ['#34C759', '#28A745'] as const; // Subtle green gradient for primary buttons
      
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyles(), style]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyles(), style]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#34C759',
  },
  gradient: {
    borderRadius: 12,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 1, // Add padding for smoother gradient edges
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, // Increased from 0.15 to 0.2 as requested
        shadowRadius: 4, // Changed to 4 as requested
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientButtonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#FF7043',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  text: {
    fontWeight: '600',
    color: 'white',
    // Add subtle text shadow for better contrast on gradient buttons
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    height: 56,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;