import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
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
  accessibilityLabel,
}: ButtonProps) => {
  
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGradient = variant === 'gradient';
  const isSuccess = variant === 'success';
  
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
        borderColor: colors.primary,
      };
    } else if (isSuccess) {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: colors.success,
      };
    } else if (!isPrimary && !isGradient) {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: colors.primaryLight,
      };
    }

    // Apply shadow for gradient, primary and success buttons
    if ((isPrimary || isGradient || isSuccess) && !disabled) {
      buttonStyle = {
        ...buttonStyle,
        ...styles.buttonShadow,
        // Add extra shadow for gradient buttons
        ...(isGradient && styles.gradientButtonShadow),
        // Add success button shadow
        ...(isSuccess && styles.successButtonShadow)
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
        color: colors.primary,
      };
    } else if (!isPrimary && !isGradient && !isSuccess) {
      textStyleObj = {
        ...textStyleObj,
        color: colors.primary,
      };
    }
    
    return textStyleObj;
  };
  
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
        </>
      )}
    </>
  );

  // Use gradient for both primary and gradient variant buttons
  if ((isPrimary || isGradient) && !disabled) {
    const gradientColors = isGradient 
      ? [colors.secondary, colors.secondaryDark] as const 
      : [colors.primary, colors.primaryDark] as const;
      
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyles(), style]}
        accessibilityLabel={accessibilityLabel}
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
  
  // Use gradient for success buttons too
  if (isSuccess && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyles(), style]}
        accessibilityLabel={accessibilityLabel}
      >
        <LinearGradient
          colors={[colors.success, '#2d8a4f']} // Darker success color
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
      accessibilityLabel={accessibilityLabel}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: colors.primary,
  },
  gradient: {
    borderRadius: spacing.borderRadius.lg,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: spacing.xs / 2, // 2px padding for smoother gradient edges
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientButtonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  successButtonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  text: {
    ...typography.button,
    color: colors.white,
    // Add subtle text shadow for better contrast on gradient buttons
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  smallButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 36,
  },
  mediumButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    height: 48,
  },
  largeButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    height: 56,
  },
  smallText: {
    fontSize: typography.bodySmall.fontSize,
  },
  mediumText: {
    fontSize: typography.bodyMedium.fontSize,
  },
  largeText: {
    fontSize: typography.bodyLarge.fontSize,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;