import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';

interface CardContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat';
}

export default function CardContainer({
  children,
  style,
  variant = 'flat'
}: CardContainerProps) {
  return (
    <View style={[
      styles.container,
      variant === 'elevated' && styles.elevated,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  elevated: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});
