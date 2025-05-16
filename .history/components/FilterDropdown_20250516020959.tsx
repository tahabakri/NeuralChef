import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import colors from '@/constants/colors';
import { DietaryPreference } from '@/stores/preferencesStore';

const PREFERENCE_LABELS: Record<DietaryPreference, string> = {
  'all': 'All Recipes',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'keto': 'Keto',
  'paleo': 'Paleo',
  'low-carb': 'Low-Carb',
};

interface FilterDropdownProps {
  selectedValue: DietaryPreference;
  onValueChange: (value: DietaryPreference) => void;
  label?: string;
}

export default function FilterDropdown({
  selectedValue,
  onValueChange,
  label = 'Dietary Preference',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!isOpen) {
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOpen(false);
      });
    }
  };

  const handleSelectOption = (value: DietaryPreference) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onValueChange(value);
    toggleDropdown();
  };

  const animatedStyle = {
    transform: [
      {
        scale: scaleAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
    opacity: opacityAnimation,
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={toggleDropdown}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Open dietary preferences dropdown"
        accessibilityHint="Double tap to select a dietary preference"
      >
        <Text style={styles.selectedText}>
          {PREFERENCE_LABELS[selectedValue]}
        </Text>
        <ChevronDown
          size={18}
          color={colors.text}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleDropdown}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleDropdown}
        >
          <Animated.View style={[styles.modalContainer, animatedStyle]}>
            <BlurView intensity={Platform.OS === 'ios' ? 60 : 40} style={styles.blurView}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Dietary Preferences</Text>
                <ScrollView style={styles.optionsList}>
                  {Object.entries(PREFERENCE_LABELS).map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.optionItem,
                        value === selectedValue && styles.selectedOption,
                      ]}
                      onPress={() => handleSelectOption(value as DietaryPreference)}
                      accessibilityState={{ selected: value === selectedValue }}
                      accessibilityRole="menuitem"
                      accessibilityLabel={label}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          value === selectedValue && styles.selectedOptionText,
                        ]}
                      >
                        {label}
                      </Text>
                      {value === selectedValue && (
                        <Check size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleDropdown}
                  accessibilityRole="button"
                  accessibilityLabel="Close menu"
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dropdownButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 340,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurView: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  modalContent: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.96)',
    paddingVertical: 24,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  selectedOption: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: colors.primary,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 