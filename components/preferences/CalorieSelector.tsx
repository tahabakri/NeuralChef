import React from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
// import colors from '@/constants/colors'; // Removed
import { CalorieSelectorProps } from './types';

// Theme colors matching other preference sections
const theme = {
  orange: '#FF8C00',
  green: '#50C878',
  white: '#FFFFFF',
  textDark: '#333333',
  textLight: '#777777', // Lighter gray for less prominent text
  inputBorderColor: '#DDDDDD', // A light border for input
  sliderMaxTrack: '#E0E0E0', // Lighter track for slider
};

const CalorieSelector: React.FC<CalorieSelectorProps> = ({
  maxCalories,
  onChangeCalories,
}) => {
  const handleSliderChange = (value: number) => {
    const rounded = Math.round(value / 50) * 50;
    onChangeCalories(rounded.toString());
  };

  const numericMaxCalories = parseInt(maxCalories);
  const displayCalories = isNaN(numericMaxCalories) ? "0" : maxCalories;
  const sliderValue = isNaN(numericMaxCalories) ? 600 : numericMaxCalories; // Default to 600 if NaN

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Calorie Target</Text>
      <Text style={styles.sectionSubtitle}>Adjust your lunch calorie goal</Text>

      <View style={styles.calorieDisplayContainer}>
        <Ionicons name="flame-outline" size={28} color={theme.orange} />
        <TextInput
          style={styles.calorieInput}
          keyboardType="number-pad"
          value={displayCalories}
          onChangeText={(text) => {
            // Allow empty input for clearing, otherwise validate range
            if (text === '') {
              onChangeCalories(''); // Allow user to clear input
            } else {
              const value = parseInt(text);
              if (!isNaN(value) && value >= 200 && value <= 1200) {
                onChangeCalories(value.toString());
              } else if (!isNaN(value) && value > 1200) {
                onChangeCalories('1200'); // Cap at max
              } else if (text.length <= 4 && !isNaN(value)){
                // Allow typing numbers that are temporarily out of range (e.g. "1") but will become valid
                onChangeCalories(text);
              }
            }
          }}
          onBlur={() => { // Ensure value is within range or default on blur
            const currentVal = parseInt(maxCalories);
            if (isNaN(currentVal) || currentVal < 200) onChangeCalories('200');
            if (currentVal > 1200) onChangeCalories('1200');
          }}
          maxLength={4}
          placeholder="600" // Playful placeholder
          placeholderTextColor={theme.textLight}
        />
        <Text style={styles.calorieUnit}>kcal</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={200}
        maximumValue={1200}
        step={50}
        value={sliderValue < 200 ? 200 : sliderValue > 1200 ? 1200 : sliderValue} // Clamp value for slider
        onValueChange={handleSliderChange}
        minimumTrackTintColor={theme.green} // Green for the filled part
        maximumTrackTintColor={theme.sliderMaxTrack} // Lighter gray for the unfilled part
        thumbTintColor={theme.orange} // Orange thumb
        accessibilityLabel="Calorie goal slider"
        // accessibilityHint="Slide to adjust your calorie goal per meal"
        // accessibilityValue={{ min: 200, max: 1200, now: sliderValue }}
      />

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabelText}>200 kcal</Text>
        <Text style={styles.rangeLabelText}>1200 kcal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.orange,
    marginBottom: 3,
    fontFamily: 'PlayfulFont-Bold', // Placeholder
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.green,
    marginBottom: 20, // More space before the input/slider
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  calorieDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 20, // Add some padding
  },
  calorieInput: {
    fontSize: Platform.OS === 'ios' ? 34 : 30, // Larger font for display
    fontWeight: 'bold',
    color: theme.orange, // Orange text for calories
    textAlign: 'center',
    minWidth: 90, // Ensure enough space for 4 digits
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 5,
    marginHorizontal: 8,
    // Basic border, can be enhanced
    // borderWidth: 1,
    // borderColor: theme.inputBorderColor,
    // borderRadius: 8,
    fontFamily: 'PlayfulFont-Bold', // Placeholder
  },
  calorieUnit: {
    fontSize: 16,
    color: theme.textLight,
    fontWeight: '500',
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  slider: {
    width: '100%', // Slider takes full width of its container
    height: 40,    // Standard height for slider
    marginBottom: 5, // Space before labels
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'ios' ? 5 : 10, // Align with slider ends
  },
  rangeLabelText: {
    color: theme.textLight,
    fontSize: 13,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
});

export default CalorieSelector;

// Developer Notes:
// - Background is transparent.
// - Styling adjusted to orange-green palette and playful fonts.
// - Input validation and slider interaction improved.
// - Font placeholders need tobe replaced.
