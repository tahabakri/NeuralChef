import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Platform,
  Image, // For placeholder chef icon if needed
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { commonAllergies } from './constants';
import { AllergiesSectionProps } from './types';
import colors from '@/constants/colors'; // Import global colors
import { LinearGradient } from 'expo-linear-gradient';

// Chef icon states
const WINKING_CHEF_ICON = "happy-outline";
const FROWNING_CHEF_ICON = "sad-outline"; // Or any suitable frowning icon
const DEFAULT_CHEF_ICON = "person-circle-outline";

// TypeScript interfaces for memoized components
interface AllergyOptionProps {
  allergy: { id: string; label: string };
  isSelected: boolean;
  onToggle: (id: string) => void;
  scaleAnim: Animated.Value;
}

interface CustomAllergyChipProps {
  allergy: string;
  onRemove: (allergy: string) => void;
}

// Memoized allergy option
const AllergyOption = memo<AllergyOptionProps>(({ 
  allergy,
  isSelected,
  onToggle,
  scaleAnim
}) => {
  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <TouchableOpacity
        style={[
          styles.allergyOption,
          isSelected 
            ? styles.selectedAllergyOption 
            : styles.unselectedAllergyOption,
        ]}
        onPress={() => onToggle(allergy.id)}
      >
        <Text style={[
          styles.allergyOptionText,
          isSelected
            ? styles.selectedOptionText 
            : styles.unselectedOptionText,
        ]}>{allergy.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Memoized custom allergy chip
const CustomAllergyChip = memo<CustomAllergyChipProps>(({ 
  allergy, 
  onRemove 
}) => {
  return (
    <View style={styles.customAllergyChip}>
      <Text style={styles.customAllergyChipText}>{allergy}</Text>
      <TouchableOpacity onPress={() => onRemove(allergy)} style={styles.removeChipButton}>
        <Ionicons name="close-outline" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
});

const AllergiesSection = memo<AllergiesSectionProps>(({
  selectedAllergies,
  customAllergies,
  onToggleAllergy,
  onAddCustomAllergy,
  onRemoveCustomAllergy,
}) => {
  const [newAllergy, setNewAllergy] = useState('');
  const [chefIconName, setChefIconName] = React.useState(DEFAULT_CHEF_ICON);
  const [chefMessage, setChefMessage] = useState<string | null>(null);
  const chefIconScale = useRef(new Animated.Value(1)).current;
  const addBtnScale = useRef(new Animated.Value(1)).current;
  const chefMessageAnim = useRef(new Animated.Value(0)).current;

  // Animation refs for allergy cards - memoized object
  const allergyCardScaleAnims = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(commonAllergies.map(allergy => [allergy.id, new Animated.Value(1)]))
  ).current;

  const playChefAnimation = useCallback((iconName: string, message?: string) => {
    setChefIconName(iconName);
    if (message) setChefMessage(message);

    chefIconScale.setValue(0.8);
    Animated.spring(chefIconScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    if (message) {
      chefMessageAnim.setValue(0);
      Animated.sequence([
        Animated.timing(chefMessageAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(chefMessageAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => setChefMessage(null));
    }

    // Reset icon after a delay if not showing a message
    if (!message) {
        setTimeout(() => setChefIconName(DEFAULT_CHEF_ICON), 800);
    }
  }, [chefIconScale, chefMessageAnim]);

  const handleAddCustom = useCallback(() => {
    if (newAllergy.trim()) {
      Animated.sequence([
        Animated.timing(addBtnScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(addBtnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      
      onAddCustomAllergy(newAllergy);
      playChefAnimation(WINKING_CHEF_ICON, "Noted!");
      setNewAllergy('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [newAllergy, onAddCustomAllergy, addBtnScale, playChefAnimation]);

  const handleToggleAllergy = useCallback((id: string) => {
    // Bounce animation for the card
    Animated.sequence([
      Animated.timing(allergyCardScaleAnims[id], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(allergyCardScaleAnims[id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();

    onToggleAllergy(id);
    playChefAnimation(FROWNING_CHEF_ICON);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [allergyCardScaleAnims, onToggleAllergy, playChefAnimation]);

  const chefMessageOpacity = chefMessageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const chefMessageTranslateY = chefMessageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  return (
    <LinearGradient
      colors={['rgba(255, 102, 102, 0.15)', 'rgba(255, 255, 255, 0.8)']}
      style={styles.gradientContainer}
    >
      <View style={styles.section}>
        <Animated.View style={[styles.chefIconContainer, { transform: [{ scale: chefIconScale }] }]}>
          <Ionicons name={chefIconName as any} size={30} color={colors.primary} />
        </Animated.View>

        {chefMessage && (
          <Animated.View 
            style={[
              styles.speechBubbleContainer,
              { opacity: chefMessageOpacity, transform: [{ translateY: chefMessageTranslateY }] }
            ]}
          >
            <View style={styles.speechBubble}>
              <Text style={styles.speechBubbleText}>{chefMessage}</Text>
            </View>
          </Animated.View>
        )}

        <Text style={styles.sectionTitle}>Allergies to Avoid</Text>
        <Text style={styles.sectionSubtitle}>Keep lunch safe!</Text>

        <View style={styles.optionsContainer}>
          {commonAllergies.map((allergy) => (
            <AllergyOption
              key={allergy.id}
              allergy={allergy}
              isSelected={selectedAllergies.includes(allergy.id)}
              onToggle={handleToggleAllergy}
              scaleAnim={allergyCardScaleAnims[allergy.id]}
            />
          ))}
        </View>

        {customAllergies.length > 0 && (
          <View style={styles.customAllergyListContainer}>
            {customAllergies.map((allergy, index) => (
              <CustomAllergyChip
                key={`${allergy}-${index}`}
                allergy={allergy}
                onRemove={onRemoveCustomAllergy}
              />
            ))}
          </View>
        )}

        <View style={styles.addCustomContainer}>
          <TextInput
            style={styles.customAllergyInput}
            placeholder="Add an allergy…"
            placeholderTextColor={colors.textSecondary} 
            value={newAllergy}
            onChangeText={setNewAllergy}
            onSubmitEditing={handleAddCustom}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={handleAddCustom} style={styles.addButtonTouch}>
            <Animated.View style={[styles.addButton, { transform: [{ scale: addBtnScale }] }]}>
              <Ionicons name="add-outline" size={24} color={colors.white} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  section: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
    borderRadius: 15,
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  chefIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  speechBubbleContainer: {
    position: 'absolute',
    top: 10,
    right: 50,
    zIndex: 11,
  },
  speechBubble: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  speechBubbleText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: colors.textSecondary,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
  },
  allergyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    borderWidth: 1.5,
  },
  selectedAllergyOption: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  unselectedAllergyOption: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
  },
  allergyOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  unselectedOptionText: {
    color: colors.textSecondary,
  },
  customAllergyListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    marginHorizontal: -4,
  },
  customAllergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  customAllergyChipText: {
    color: colors.white,
    fontSize: 14,
    marginRight: 5,
  },
  removeChipButton: {
    padding: 2,
  },
  addCustomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  customAllergyInput: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 10,
  },
  addButtonTouch: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addButton: {
    backgroundColor: colors.success,
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AllergiesSection;
