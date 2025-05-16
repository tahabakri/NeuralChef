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
  Switch,
  TextInput,
} from 'react-native';
import { ChevronDown, Check, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import Slider from '@react-native-community/slider';
import colors from '@/constants/colors';
import { 
  DietaryPreference, 
  SpiceLevel, 
  PortionSize, 
  MicroPreference 
} from '@/stores/preferencesStore';
import { Tooltip } from '@/components/Tooltip';

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

const SPICE_LEVEL_LABELS: Record<SpiceLevel, string> = {
  'none': 'No Spice',
  'mild': 'Mild',
  'medium': 'Medium',
  'spicy': 'Spicy',
  'extra-spicy': 'Extra Spicy',
};

const PORTION_SIZE_LABELS: Record<PortionSize, string> = {
  'single': 'Single (1 person)',
  'couple': 'Couple (2 people)',
  'family': 'Family (4-6 people)',
  'large-group': 'Large Group (7+ people)',
};

const MICRO_PREFERENCE_LABELS: Record<MicroPreference, string> = {
  'low-sodium': 'Low Sodium (<1500mg per serving)',
  'high-protein': 'High Protein (>25g per serving)',
  'low-sugar': 'Low Sugar (<5g added sugar)',
  'high-fiber': 'High Fiber (>5g per serving)',
  'low-fat': 'Low Fat (<10g per serving)',
  'heart-healthy': 'Heart Healthy',
  'diabetic-friendly': 'Diabetic Friendly',
};

type DropdownType = 'dietary' | 'spice' | 'portion' | 'calories' | 'time' | 'micro';

interface FilterDropdownProps {
  type: DropdownType;
  label: string;
  tooltip?: string;
  selectedDietaryValue?: DietaryPreference;
  selectedSpiceValue?: SpiceLevel;
  selectedPortionSize?: PortionSize;
  maxCalories?: number;
  cookingTimeLimit?: number;
  selectedMicroPreferences?: MicroPreference[];
  onDietaryChange?: (value: DietaryPreference) => void;
  onSpiceLevelChange?: (value: SpiceLevel) => void;
  onPortionSizeChange?: (value: PortionSize) => void;
  onMaxCaloriesChange?: (value: number) => void;
  onCookingTimeLimitChange?: (value: number) => void;
  onMicroPreferencesChange?: (values: MicroPreference[]) => void;
}

export default function FilterDropdown({
  type,
  label,
  tooltip,
  selectedDietaryValue = 'all',
  selectedSpiceValue = 'medium',
  selectedPortionSize = 'couple',
  maxCalories = 0,
  cookingTimeLimit = 0,
  selectedMicroPreferences = [],
  onDietaryChange,
  onSpiceLevelChange,
  onPortionSizeChange,
  onMaxCaloriesChange,
  onCookingTimeLimitChange,
  onMicroPreferencesChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const [caloriesInput, setCaloriesInput] = useState(maxCalories > 0 ? maxCalories.toString() : '');
  const [timeInput, setTimeInput] = useState(cookingTimeLimit > 0 ? cookingTimeLimit.toString() : '');

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

  const handleSelectOption = (value: DietaryPreference | SpiceLevel | PortionSize) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (type === 'dietary' && onDietaryChange) {
      onDietaryChange(value as DietaryPreference);
    } else if (type === 'spice' && onSpiceLevelChange) {
      onSpiceLevelChange(value as SpiceLevel);
    } else if (type === 'portion' && onPortionSizeChange) {
      onPortionSizeChange(value as PortionSize);
    }
    
    toggleDropdown();
  };

  const handleToggleMicroPreference = (preference: MicroPreference) => {
    if (!onMicroPreferencesChange) return;
    
    const newPreferences = [...selectedMicroPreferences];
    const index = newPreferences.indexOf(preference);
    
    if (index >= 0) {
      newPreferences.splice(index, 1);
    } else {
      newPreferences.push(preference);
    }
    
    onMicroPreferencesChange(newPreferences);
  };

  const handleCaloriesSubmit = () => {
    if (onMaxCaloriesChange) {
      const value = parseInt(caloriesInput, 10) || 0;
      onMaxCaloriesChange(value);
    }
    toggleDropdown();
  };

  const handleTimeSubmit = () => {
    if (onCookingTimeLimitChange) {
      const value = parseInt(timeInput, 10) || 0;
      onCookingTimeLimitChange(value);
    }
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

  const getDisplayValue = () => {
    switch (type) {
      case 'dietary':
        return PREFERENCE_LABELS[selectedDietaryValue];
      case 'spice':
        return SPICE_LEVEL_LABELS[selectedSpiceValue];
      case 'portion':
        return PORTION_SIZE_LABELS[selectedPortionSize];
      case 'calories':
        return maxCalories > 0 ? `Max ${maxCalories} cal` : 'No Limit';
      case 'time':
        return cookingTimeLimit > 0 ? `Max ${cookingTimeLimit} min` : 'No Limit';
      case 'micro':
        return selectedMicroPreferences.length > 0 
          ? `${selectedMicroPreferences.length} selected`
          : 'None';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {tooltip && (
          <Tooltip content={tooltip}>
            <Info size={16} color={colors.textSecondary} style={styles.infoIcon} />
          </Tooltip>
        )}
      </View>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={toggleDropdown}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Open ${label.toLowerCase()} dropdown`}
        accessibilityHint={`Double tap to select ${label.toLowerCase()}`}
      >
        <Text style={styles.selectedText}>
          {getDisplayValue()}
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
                <Text style={styles.modalTitle}>{label}</Text>
                
                {type === 'dietary' && (
                  <ScrollView style={styles.optionsList}>
                    {Object.entries(PREFERENCE_LABELS).map(([value, label]) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.optionItem,
                          value === selectedDietaryValue && styles.selectedOption,
                        ]}
                        onPress={() => handleSelectOption(value as DietaryPreference)}
                        accessibilityState={{ selected: value === selectedDietaryValue }}
                        accessibilityRole="menuitem"
                        accessibilityLabel={label}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            value === selectedDietaryValue && styles.selectedOptionText,
                          ]}
                        >
                          {label}
                        </Text>
                        {value === selectedDietaryValue && (
                          <Check size={18} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                
                {type === 'spice' && (
                  <ScrollView style={styles.optionsList}>
                    {Object.entries(SPICE_LEVEL_LABELS).map(([value, label]) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.optionItem,
                          value === selectedSpiceValue && styles.selectedOption,
                        ]}
                        onPress={() => handleSelectOption(value as SpiceLevel)}
                        accessibilityState={{ selected: value === selectedSpiceValue }}
                        accessibilityRole="menuitem"
                        accessibilityLabel={label}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            value === selectedSpiceValue && styles.selectedOptionText,
                          ]}
                        >
                          {label}
                        </Text>
                        {value === selectedSpiceValue && (
                          <Check size={18} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                
                {type === 'portion' && (
                  <ScrollView style={styles.optionsList}>
                    {Object.entries(PORTION_SIZE_LABELS).map(([value, label]) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.optionItem,
                          value === selectedPortionSize && styles.selectedOption,
                        ]}
                        onPress={() => handleSelectOption(value as PortionSize)}
                        accessibilityState={{ selected: value === selectedPortionSize }}
                        accessibilityRole="menuitem"
                        accessibilityLabel={label}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            value === selectedPortionSize && styles.selectedOptionText,
                          ]}
                        >
                          {label}
                        </Text>
                        {value === selectedPortionSize && (
                          <Check size={18} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                
                {type === 'calories' && (
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Max calories per serving:</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={styles.numberInput}
                        keyboardType="numeric"
                        value={caloriesInput}
                        onChangeText={setCaloriesInput}
                        placeholder="Enter calories"
                      />
                      <Text style={styles.unitText}>calories</Text>
                    </View>
                    <Text style={styles.helperText}>
                      Enter 0 for no calorie restriction
                    </Text>
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={handleCaloriesSubmit}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {type === 'time' && (
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Max cooking time:</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={styles.numberInput}
                        keyboardType="numeric"
                        value={timeInput}
                        onChangeText={setTimeInput}
                        placeholder="Enter minutes"
                      />
                      <Text style={styles.unitText}>minutes</Text>
                    </View>
                    <Text style={styles.helperText}>
                      Enter 0 for no time restriction
                    </Text>
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={handleTimeSubmit}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {type === 'micro' && (
                  <View style={styles.checkboxContainer}>
                    {Object.entries(MICRO_PREFERENCE_LABELS).map(([value, label]) => (
                      <TouchableOpacity
                        key={value}
                        style={styles.checkboxRow}
                        onPress={() => handleToggleMicroPreference(value as MicroPreference)}
                      >
                        <View style={[
                          styles.checkbox, 
                          selectedMicroPreferences.includes(value as MicroPreference) && styles.checkboxSelected
                        ]}>
                          {selectedMicroPreferences.includes(value as MicroPreference) && (
                            <Check size={14} color="white" />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={toggleDropdown}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {type !== 'calories' && type !== 'time' && type !== 'micro' && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={toggleDropdown}
                    accessibilityRole="button"
                    accessibilityLabel="Close menu"
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                )}
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
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  infoIcon: {
    marginLeft: 6,
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
    padding: 12,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  sliderContainer: {
    paddingHorizontal: 24,
  },
  sliderLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginRight: 8,
    backgroundColor: colors.background,
  },
  unitText: {
    fontSize: 16,
    color: colors.text,
    width: 70,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  checkboxContainer: {
    paddingHorizontal: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
}); 