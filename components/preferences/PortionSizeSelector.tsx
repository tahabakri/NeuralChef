import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { portionSizes } from './constants';
import { PortionSizeSelectorProps, PortionSizeType } from './types';

// Chef icon states
const WINKING_CHEF_ICON = "happy-outline";
const DEFAULT_CHEF_ICON = "person-circle-outline";

const PortionSizeSelector: React.FC<PortionSizeSelectorProps> = ({
  selectedSize,
  onSelectSize,
}) => {
  const animatedScales = useRef<{[key: string]: Animated.Value}>(
    portionSizes.reduce((acc, size) => ({ ...acc, [size.id]: new Animated.Value(1) }), {})
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
    setTimeout(() => setChefIconName(DEFAULT_CHEF_ICON), 800);
  };

  const handleSelectSize = (sizeId: string) => {
    Animated.sequence([
      Animated.timing(animatedScales[sizeId], {
        toValue: 1.1, 
        duration: 100, 
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(animatedScales[sizeId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectSize(sizeId as PortionSizeType);
    playChefWinkAnimation();
  };

  return (
    <View style={styles.section}>
      <Animated.View style={[styles.chefIconContainer, { transform: [{ scale: chefIconScale }] }]}>
        <Ionicons name={chefIconName as any} size={30} color={colors.primary} />
      </Animated.View>

      <Text style={styles.sectionTitle}>Lunch Portion Size</Text>
      <Text style={styles.sectionSubtitle}>Who're you cooking for?</Text>

      <View style={styles.portionOptionsContainer}>
        {portionSizes.map((size) => {
          const isSelected = selectedSize === size.id;
          return (
            <Animated.View
              key={size.id}
              style={{ transform: [{ scale: animatedScales[size.id] }] }}
            >
              <TouchableOpacity
                style={[
                  styles.portionOption,
                  isSelected ? styles.selectedOption : styles.unselectedOption,
                ]}
                onPress={() => handleSelectSize(size.id)}
              >
                <Text style={[
                  styles.portionOptionText,
                  isSelected ? styles.selectedOptionText : styles.unselectedOptionText
                ]}>
                  {size.label}
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
  portionOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
  },
  portionOption: {
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
  portionOptionText: {
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

export default PortionSizeSelector;
