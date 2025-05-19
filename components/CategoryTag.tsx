import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import colors from '@/constants/colors';
import { Moon } from 'lucide-react-native';

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
  const isLateNightTag = label.toLowerCase().includes('late-night');
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.unselectedContainer,
        isLateNightTag && styles.lateNightContainer,
        isLateNightTag && selected && styles.selectedLateNightContainer,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`${label} category ${selected ? 'selected' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {isLateNightTag && (
        <Moon 
          size={14} 
          color={selected ? colors.white : colors.textSecondary} 
          style={styles.icon} 
        />
      )}
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.unselectedText,
          isLateNightTag && !selected && styles.lateNightText,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContainer: {
    backgroundColor: colors.primary,
  },
  unselectedContainer: {
    backgroundColor: colors.backgroundAlt,
  },
  lateNightContainer: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  selectedLateNightContainer: {
    backgroundColor: colors.secondary,
    borderWidth: 0,
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
  lateNightText: {
    color: colors.textSecondary,
  },
  icon: {
    marginRight: 6,
  }
}); 