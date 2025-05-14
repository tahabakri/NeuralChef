import React from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  StyleProp, 
  ViewStyle,
  TextStyle,
  TextInputProps
} from 'react-native';
import colors from '@/constants/colors';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  height?: number;
}

export default function TextArea({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  height = 120,
  ...props
}: TextAreaProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          { height },
          error ? styles.inputError : undefined,
          inputStyle
        ]}
        multiline
        textAlignVertical="top"
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});