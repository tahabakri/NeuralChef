import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '@/constants/colors';

interface CategoryTagProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function CategoryTag({
  label,
  onPress,
  selected = false,
  style,
  textStyle
}: CategoryTagProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.unselectedContainer,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
          textStyle
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedContainer: {
    backgroundColor: colors.primary,
  },
  unselectedContainer: {
    backgroundColor: colors.backgroundAlt,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  selectedText: {
    color: colors.white,
  },
  unselectedText: {
    color: colors.textSecondary,
  },
}); 