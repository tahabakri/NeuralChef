import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';

interface CheckboxProps {
  checked: boolean;
  size?: number;
  checkColor?: string;
  boxColor?: string;
  style?: any;
}

export default function Checkbox({
  checked,
  size = 24,
  checkColor = colors.white,
  boxColor = colors.primary,
  style,
}: CheckboxProps) {
  // Animation for the check mark
  const [scaleValue] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: checked ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
      useNativeDriver: true,
    }).start();
  }, [checked, scaleValue]);
  
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: checked ? boxColor : 'transparent',
          borderColor: checked ? boxColor : colors.border,
        },
        style,
      ]}
    >
      {checked && (
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
          }}
        >
          <Ionicons
            name="checkmark"
            size={size * 0.7}
            color={checkColor}
            style={styles.checkIcon}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    marginTop: 1, // Fine-tune alignment of check mark
  },
}); 