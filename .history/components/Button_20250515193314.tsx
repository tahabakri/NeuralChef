import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
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
    } else if (!isPrimary) {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: '#E8F5E9',
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
    } else if (!isPrimary) {
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

  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyles(), style]}
      >
        <LinearGradient
          colors={['#4CAF50', '#34C759']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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
  },
  text: {
    fontWeight: '600',
    color: 'white',
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