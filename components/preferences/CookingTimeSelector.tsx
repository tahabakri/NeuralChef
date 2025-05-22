import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
// import colors from '@/constants/colors'; // Will use theme colors
import { cookingTimes } from './constants';
import { CookingTimeSelectorProps } from './types';

// Theme colors matching Home screen and other preference sections
const theme = {
  orange: '#FF8C00', // Brighter orange
  green: '#50C878', // Emerald green
  white: '#FFFFFF',
  glassBg: 'rgba(255, 255, 255, 0.2)', // Glassmorphic background
  borderColor: 'rgba(255, 255, 255, 0.3)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
};

// Chef icon states
const WINKING_CHEF_ICON = "happy-outline";
const DEFAULT_CHEF_ICON = "person-circle-outline";

const CookingTimeSelector: React.FC<CookingTimeSelectorProps> = ({
  selectedTime,
  onSelectTime,
}) => {
  const animatedScales = useRef<{[key: string]: Animated.Value}>(
    cookingTimes.reduce((acc, time) => ({ ...acc, [time.id]: new Animated.Value(1) }), {})
  ).current;

  const [chefIconName, setChefIconName] = React.useState(DEFAULT_CHEF_ICON);
  const chefIconScale = useRef(new Animated.Value(1)).current;

  const playChefWinkAnimation = () => {
    setChefIconName(WINKING_CHEF_ICON);
    chefIconScale.setValue(0.8); 
    Animated.spring(chefIconScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    // Reset icon after a delay
    setTimeout(() => setChefIconName(DEFAULT_CHEF_ICON), 800);
  };

  const handleSelectTime = (timeId: string) => {
    // Bounce animation for the card
    Animated.sequence([
      Animated.timing(animatedScales[timeId], {
        toValue: 1.1, 
        duration: 100, 
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(animatedScales[timeId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectTime(timeId);
    playChefWinkAnimation();
  };
  
  return (
    <View style={styles.section}>
      <Animated.View style={[styles.chefIconContainer, { transform: [{ scale: chefIconScale }] }]}>
        <Ionicons name={chefIconName as any} size={30} color={theme.orange} />
      </Animated.View>

      <Text style={styles.sectionTitle}>Lunch Cooking Time</Text>
      <Text style={styles.sectionSubtitle}>How quick for today?</Text>

      <View style={styles.timeOptionsContainer}>
        {cookingTimes.map((time) => {
          const isSelected = selectedTime === time.id;
          return (
            <Animated.View 
              key={time.id}
              style={{ transform: [{ scale: animatedScales[time.id] }] }}
            >
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  isSelected ? styles.selectedOption : styles.unselectedOption,
                ]}
                onPress={() => handleSelectTime(time.id)}
              >
                <Ionicons 
                  name="time-outline" // Using time-outline, can be changed to a more playful clock
                  size={22} 
                  color={isSelected ? theme.orange : theme.green} // Icon color change: orange when selected, green otherwise
                  style={styles.iconStyle}
                />
                <Text style={styles.timeOptionText}>
                  {time.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: theme.glassBg,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.borderColor,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative', 
  },
  chefIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.orange,
    marginBottom: 5,
    fontFamily: 'PlayfulFont-Bold', // Placeholder
  },
  sectionSubtitle: {
    fontSize: 16,
    color: theme.green,
    marginBottom: 15,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute items
    marginHorizontal: -5, // Offset for card margins
  },
  timeOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    margin: 5,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%', // Ensure two items per row with some spacing
  },
  unselectedOption: {
    backgroundColor: theme.green,
    borderColor: theme.orange,
  },
  selectedOption: {
    backgroundColor: theme.orange,
    borderColor: theme.green, // Green outline when selected
  },
  iconStyle: {
    marginRight: 8,
  },
  timeOptionText: {
    fontSize: 14,
    color: theme.white, 
    fontWeight: '600',
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
  },
  // selectedOptionText is not explicitly needed if text color is always white.
  // If selected text color needs to change, add selectedOptionText style here.
});

export default CookingTimeSelector;

// Developer notes:
// - Replace 'PlayfulFont-Bold', 'PlayfulFont-Regular', 'PlayfulFont-SemiBold' with actual font family names.
// - Ensure cookingTimes in constants.ts has (id, label).
// - Bounce animation and winking chef icon are implemented.
// - Clock icon color changes on selection.
