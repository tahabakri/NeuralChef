import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
}

export default function Card({ 
  children, 
  style, 
  variant = 'default',
  onPress
}: CardProps) {
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
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[styles.card, getVariantStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.card,
  },
  default: {
    backgroundColor: colors.card,
  },
  elevated: {
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});