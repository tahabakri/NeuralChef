import React, { useEffect, useRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  ViewStyle, 
  TextStyle, 
  View 
} from 'react-native';
import colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface PulseButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  isPulsing?: boolean;
}

export default function PulseButton({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  icon, 
  color = colors.primary,
  size = 'medium',
  isPulsing = false
}: PulseButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isPulsing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [isPulsing, pulseAnim]);

  const buttonStyles = [
    styles.button,
    size === 'small' && styles.smallButton,
    size === 'large' && styles.largeButton,
    { backgroundColor: color },
    style,
  ];
  
  const textStyles = [
    styles.text,
    size === 'small' && styles.smallText,
    size === 'large' && styles.largeText,
    textStyle,
  ];

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
      }}
    >
      <TouchableOpacity 
        style={buttonStyles} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
            color={colors.white} 
            style={styles.icon} 
          />
        )}
        <Text style={textStyles}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 40,
  },
  text: {
    color: colors.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  icon: {
    marginRight: 8,
  },
}); 