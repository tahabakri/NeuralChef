import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  disabled?: boolean;
}

const Checkbox = ({ checked, onToggle, size = 24, disabled = false }: CheckboxProps) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      style={[
        styles.container,
        { 
          width: size, 
          height: size,
          borderRadius: size / 2,
          opacity: disabled ? 0.5 : 1 
        },
        checked && styles.checked
      ]}
      activeOpacity={0.7}
    >
      {checked && (
        <Ionicons name="checkmark" size={size * 0.7} color={colors.white} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default Checkbox; 