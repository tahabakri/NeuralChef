import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
// import colors from '@/constants/colors'; // Will use theme colors
import { portionSizes } from './constants';
import { PortionSizeSelectorProps, PortionSizeType } from './types';

// Theme colors
const theme = {
  orange: '#FF8C00',
  green: '#50C878',
  white: '#FFFFFF',
  glassBg: 'rgba(255, 255, 255, 0.2)',
  borderColor: 'rgba(255, 255, 255, 0.3)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
};

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

  // Helper to get the right icon for portion size
  const getPortionIconName = (sizeId: string): keyof typeof Ionicons.glyphMap => {
    const portion = portionSizes.find(p => p.id === sizeId);
    return portion?.iconName || 'help-circle-outline'; // Default icon if not found
  };

  return (
    <View style={styles.section}>
      <Animated.View style={[styles.chefIconContainer, { transform: [{ scale: chefIconScale }] }]}>
        <Ionicons name={chefIconName as any} size={30} color={theme.orange} />
      </Animated.View>

      <Text style={styles.sectionTitle}>Lunch Portion Size</Text>
      <Text style={styles.sectionSubtitle}>Who're you cooking for?</Text>

      <View style={styles.portionOptionsContainer}>
        {portionSizes.map((size) => {
          const isSelected = selectedSize === size.id;
          const iconName = getPortionIconName(size.id);
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
                <Ionicons 
                  name={iconName} 
                  size={22} 
                  color={isSelected ? theme.orange : theme.green} // Icon color: orange when selected, green otherwise
                  style={styles.iconStyle}
                />
                <Text style={styles.portionOptionText}>
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
  portionOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  portionOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    margin: 5,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%', 
  },
  unselectedOption: {
    backgroundColor: theme.green,
    borderColor: theme.orange,
  },
  selectedOption: {
    backgroundColor: theme.orange,
    borderColor: theme.green,
  },
  iconStyle: {
    marginRight: 8,
  },
  portionOptionText: {
    fontSize: 14,
    color: theme.white,
    fontWeight: '600',
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
  },
});

export default PortionSizeSelector;
