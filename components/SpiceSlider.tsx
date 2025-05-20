import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface SpiceSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const SpiceSlider = ({ value, onValueChange }: SpiceSliderProps) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleValueChange = (newValue: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalValue(newValue);
  };
  
  const handleSlidingComplete = (newValue: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onValueChange(newValue);
  };
  
  const getSpiceLevel = () => {
    if (localValue <= 0.25) return 'Mild';
    if (localValue <= 0.5) return 'Medium';
    if (localValue <= 0.75) return 'Spicy';
    return 'Extra Spicy';
  };
  
  const getSpiceIcons = () => {
    const level = Math.ceil(localValue * 4);
    return Array(level).fill(null).map((_, index) => (
      <Ionicons 
        key={index} 
        name="flame" 
        size={20} 
        color={getIconColor(index / 3)} 
        style={styles.spiceIcon}
      />
    ));
  };
  
  const getIconColor = (position: number) => {
    // Gradient from yellow to red
    if (position <= 0.25) return '#FFC107'; // Yellow
    if (position <= 0.5) return '#FF9800'; // Orange
    if (position <= 0.75) return '#FF5722'; // Deep Orange
    return '#F44336'; // Red
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.levelText}>{getSpiceLevel()}</Text>
        <View style={styles.iconsContainer}>
          {getSpiceIcons()}
        </View>
      </View>
      
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.25}
        value={localValue}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor={getIconColor(localValue)}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
      
      <View style={styles.markerContainer}>
        <Text style={styles.markerText}>Mild</Text>
        <Text style={styles.markerText}>Medium</Text>
        <Text style={styles.markerText}>Spicy</Text>
        <Text style={styles.markerText}>Extra</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '600',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spiceIcon: {
    marginLeft: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  markerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  markerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default SpiceSlider; 