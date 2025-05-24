import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { CalorieSelectorProps } from './types';
import { LinearGradient } from 'expo-linear-gradient';

const CalorieSelector: React.FC<CalorieSelectorProps> = ({
  maxCalories,
  onChangeCalories,
}) => {
  const [localCalories, setLocalCalories] = useState(maxCalories);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputScale = useRef(new Animated.Value(1)).current;
  const flameScale = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Simplified effect: only update localCalories if not focused
    // and if the prop value is different from current local value after validation.
    if (!isFocused) {
      let newLocalCal = maxCalories;
      if (maxCalories === '') {
        newLocalCal = ''; // Allow empty if prop is empty
      } else {
        const numericProp = parseInt(maxCalories);
        if (!isNaN(numericProp)) {
          const clamped = Math.max(200, Math.min(1200, numericProp));
          const rounded = Math.round(clamped / 50) * 50;
          newLocalCal = rounded.toString();
        } else {
          // If maxCalories is some other non-numeric string, default to 600
          // or keep it empty if that's the prop value
          newLocalCal = maxCalories === '' ? '' : '600'; 
        }
      }

      if (newLocalCal !== localCalories) {
        setLocalCalories(newLocalCal);
      }
    }
  }, [maxCalories, isFocused]); // Removed slider-related dependencies
  
  const handleInputFocus = () => {
    setIsFocused(true);
    Animated.spring(inputScale, { toValue: 1.05, friction: 7, useNativeDriver: true }).start();
    // Animate flame icon on focus for visual feedback
    Animated.sequence([
      Animated.timing(flameScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(flameScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };
  
  const handleInputBlur = () => {
    setIsFocused(false);
    Animated.spring(inputScale, { toValue: 1, friction: 7, useNativeDriver: true }).start();
    
    let finalStrValue;

    if (localCalories === '') {
      // If input is cleared, set to minimum valid value or as defined by requirements
      // For now, let's set to 200, but this could be an empty string too if desired.
      finalStrValue = '200'; 
    } else {
      const currentNum = parseInt(localCalories);
      if (isNaN(currentNum) || currentNum < 200) {
        finalStrValue = '200';
      } else if (currentNum > 1200) {
        finalStrValue = '1200';
      } else {
        finalStrValue = (Math.round(currentNum / 50) * 50).toString();
      }
    }
    
    setLocalCalories(finalStrValue);
    onChangeCalories(finalStrValue);
  };
  
  const handleTextChange = (text: string) => {
    setLocalCalories(text); // Update text input view immediately
    // Propagate raw (numeric or empty) text to parent for immediate feedback
    if (text === '' || /^\d*$/.test(text)) { 
      onChangeCalories(text); 
    }
  };
  
  const presets = [
    { label: 'Light', value: '400' },
    { label: 'Medium', value: '600' },
    { label: 'Hearty', value: '800' },
  ];
  
  const handlePresetPress = (value: string) => {
    setLocalCalories(value);
    onChangeCalories(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Animate flame icon when preset is pressed
    Animated.sequence([
      Animated.timing(flameScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(flameScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const displayCalories = localCalories;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Calorie Target</Text>
      <Text style={styles.sectionSubtitle}>Adjust your lunch calorie goal</Text>

      <View style={styles.presetContainer}>
        {presets.map((preset) => (
          <TouchableOpacity
            key={preset.value}
            style={[
              styles.presetButton,
              localCalories === preset.value && styles.activePresetButton
            ]}
            onPress={() => handlePresetPress(preset.value)}
          >
            <Text 
              style={[
                styles.presetText,
                localCalories === preset.value && styles.activePresetText
              ]}
            >
              {preset.label}
            </Text>
            <Text 
              style={[
                styles.presetValue,
                localCalories === preset.value && styles.activePresetText
              ]}
            >
              {preset.value} kcal
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.calorieDisplayContainer}>
        <Animated.View style={{ transform: [{ scale: flameScale }] }}>
          <LinearGradient
            colors={[colors.orangeAccentStart, colors.orangeAccentEnd]}
            style={styles.flameIconContainer}
          >
            <Ionicons name="flame-outline" size={24} color={colors.white} />
          </LinearGradient>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            { transform: [{ scale: inputScale }] }
          ]}
        >
          <TextInput
            style={styles.calorieInput}
            keyboardType="number-pad"
            value={displayCalories}
            onChangeText={handleTextChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            maxLength={4}
            placeholder="200 - 1200"
            placeholderTextColor={colors.textTertiary}
            textAlign="center"
          />
          <Text style={styles.calorieUnit}>kcal</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: colors.card,
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  presetButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    marginHorizontal: 5,
  },
  activePresetButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  presetValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activePresetText: {
    color: colors.white,
  },
  calorieDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Adjusted from 20 to provide space if slider was below
  },
  flameIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  inputContainerFocused: {
    borderColor: colors.success,
    backgroundColor: colors.white,
  },
  calorieInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
  },
  calorieUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 5,
  },
  // Slider and rangeLabels styles removed
});

export default CalorieSelector;

// Developer Notes:
// - Background is transparent.
// - Styling adjusted to orange-green palette and playful fonts.
// - Input validation and slider interaction improved.
// - Font placeholders need tobe replaced.
