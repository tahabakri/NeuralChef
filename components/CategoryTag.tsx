import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface CategoryTagProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const CategoryTag = ({ label, isSelected, onPress, disabled = false }: CategoryTagProps) => {
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text
        style={[
          styles.label,
          isSelected && styles.selectedLabel,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  selectedContainer: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.subtitle2,
    color: colors.text,
  },
  selectedLabel: {
    color: colors.white,
  },
});

export default CategoryTag; 