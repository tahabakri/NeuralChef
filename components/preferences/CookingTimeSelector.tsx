import React, { useRef, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { cookingTimes } from './constants';
import { CookingTimeSelectorProps } from './types';

// Chef icon states
const WINKING_CHEF_ICON = "happy-outline";
const DEFAULT_CHEF_ICON = "person-circle-outline";

// TypeScript interface for memoized components
interface TimeOptionProps {
  time: { id: string; label: string };
  isSelected: boolean;
  animatedScale: Animated.Value;
  onSelect: (timeId: string) => void;
}

// Memoized time option component
const TimeOption = memo<TimeOptionProps>(({
  time,
  isSelected,
  animatedScale,
  onSelect
}) => {
  const handlePress = useCallback(() => {
    onSelect(time.id);
  }, [time.id, onSelect]);

  return (
    <Animated.View 
      style={{ transform: [{ scale: animatedScale }] }}
    >
      <TouchableOpacity
        style={[
          styles.timeOption,
          isSelected ? styles.selectedOption : styles.unselectedOption,
        ]}
        onPress={handlePress}
      >
        <Text style={[
          styles.timeOptionText,
          isSelected ? styles.selectedOptionText : styles.unselectedOptionText
        ]}>
          {time.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const CookingTimeSelector = memo<CookingTimeSelectorProps>(({
  selectedTime,
  onSelectTime,
}) => {
  // Optimize animation creation with Object.fromEntries
  const animatedScales = useRef<{[key: string]: Animated.Value}>(
    Object.fromEntries(cookingTimes.map(time => [time.id, new Animated.Value(1)]))
  ).current;

  const [chefIconName, setChefIconName] = useState(DEFAULT_CHEF_ICON);
  const chefIconScale = useRef(new Animated.Value(1)).current;

  const playChefWinkAnimation = useCallback(() => {
    setChefIconName(WINKING_CHEF_ICON);
    chefIconScale.setValue(0.8); 
    Animated.spring(chefIconScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    // Reset icon after a delay
    setTimeout(() => setChefIconName(DEFAULT_CHEF_ICON), 800);
  }, [chefIconScale]);

  const handleSelectTime = useCallback((timeId: string) => {
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
  }, [animatedScales, onSelectTime, playChefWinkAnimation]);
  
  return (
    <View style={styles.section}>
      <Animated.View style={[styles.chefIconContainer, { transform: [{ scale: chefIconScale }] }]}>
        <Ionicons name={chefIconName as any} size={30} color={colors.primary} />
      </Animated.View>

      <Text style={styles.sectionTitle}>Lunch Cooking Time</Text>
      <Text style={styles.sectionSubtitle}>How quick for today?</Text>

      <View style={styles.timeOptionsContainer}>
        {cookingTimes.map((time) => (
          <TimeOption
            key={time.id}
            time={time}
            isSelected={selectedTime === time.id}
            animatedScale={animatedScales[time.id]}
            onSelect={handleSelectTime}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginBottom: 20,
    backgroundColor: 'transparent',
    borderRadius: 15,
    position: 'relative',
  },
  chefIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
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
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    margin: 4,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
  },
  unselectedOption: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  unselectedOptionText: {
    color: colors.white,
  },
});

export default CookingTimeSelector;

// Developer notes:
// - Replace 'PlayfulFont-Bold', 'PlayfulFont-Regular', 'PlayfulFont-SemiBold' with actual font family names.
// - Ensure cookingTimes in constants.ts has (id, label).
// - Bounce animation and winking chef icon are implemented.
// - Clock icon color changes on selection.
