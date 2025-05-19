import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  GestureResponderEvent
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

type BackArrowProps = {
  onClick?: (event: GestureResponderEvent) => void;
  color?: string;
};

export default function BackArrow({ onClick, color = colors.text }: BackArrowProps) {
  const handlePress = (e: GestureResponderEvent) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (onClick) {
      onClick(e);
    } else {
      router.back();
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      accessibilityLabel="Go back"
      accessibilityRole="button"
      accessibilityHint="Navigates to the previous screen"
    >
      <Ionicons 
        name="chevron-back" 
        size={24} 
        color={color} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
