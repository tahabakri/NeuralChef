import React, { useRef, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { medicalConditions } from './constants';
import { MedicalConditionsSelectorProps } from './types';
import { MedicalCondition } from '@/stores/preferencesStore';
import colors from '@/constants/colors';

// Default chef icons for animation
const WINKING_CHEF_ICON = "happy-outline";
const DEFAULT_CHEF_ICON = "medkit-outline"; // Icon relevant to medical conditions

// TypeScript interfaces for memoized components
interface ConditionOptionProps {
  condition: { id: string; label: string };
  isSelected: boolean;
  onToggle: (conditionId: MedicalCondition) => void;
  scaleAnim: Animated.Value;
}

interface CustomConditionChipProps {
  condition: string;
  onRemove: (condition: string) => void;
}

// Memoized condition option component
const ConditionOption = memo<ConditionOptionProps>(({
  condition,
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
          styles.optionChip,
          isSelected ? styles.selectedOptionChip : styles.unselectedOptionChip,
        ]}
        onPress={() => onToggle(condition.id as MedicalCondition)}
      >
        <Text style={[
          styles.optionText,
          isSelected ? styles.selectedOptionText : styles.unselectedOptionText
        ]}>
          {condition.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Memoized custom condition chip component
const CustomConditionChip = memo<CustomConditionChipProps>(({
  condition,
  onRemove
}) => {
  return (
    <View style={styles.customConditionChip}>
      <Text style={styles.customConditionChipText}>{condition}</Text>
      <TouchableOpacity 
        onPress={() => onRemove(condition)} 
        style={styles.removeChipButton}
      >
        <Ionicons name="close-outline" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
});

const MedicalConditionsSelector = memo<MedicalConditionsSelectorProps>(({
  selectedPredefinedConditions,
  customMedicalConditions,
  onTogglePredefinedCondition,
  onAddCustomCondition,
  onRemoveCustomCondition,
}) => {
  const [newCondition, setNewCondition] = useState('');
  const [chefIconName, setChefIconName] = useState(DEFAULT_CHEF_ICON);
  const [chefMessage, setChefMessage] = useState<string | null>(null);
  const chefIconScale = useRef(new Animated.Value(1)).current;
  const addBtnScale = useRef(new Animated.Value(1)).current;
  const chefMessageAnim = useRef(new Animated.Value(0)).current;

  // Animation refs for condition cards - optimized with Object.fromEntries
  const conditionCardScaleAnims = useRef<{[key: string]: Animated.Value}>(
    Object.fromEntries(medicalConditions.map(condition => [condition.id, new Animated.Value(1)]))
  ).current;

  const playChefAnimation = useCallback((iconName: string = WINKING_CHEF_ICON, message?: string) => {
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
    if (newCondition.trim()) {
      Animated.sequence([
        Animated.timing(addBtnScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(addBtnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      
      onAddCustomCondition(newCondition.trim());
      playChefAnimation(WINKING_CHEF_ICON, "Noted! I'll be mindful of that.");
      setNewCondition('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [newCondition, onAddCustomCondition, addBtnScale, playChefAnimation]);

  const handleToggleCondition = useCallback((conditionId: MedicalCondition) => {
    // Bounce animation for the card
    Animated.sequence([
      Animated.timing(conditionCardScaleAnims[conditionId], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(conditionCardScaleAnims[conditionId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();

    onTogglePredefinedCondition(conditionId);
    playChefAnimation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [conditionCardScaleAnims, onTogglePredefinedCondition, playChefAnimation]);

  const chefMessageOpacity = chefMessageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const chefMessageTranslateY = chefMessageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  return (
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

      <Text style={styles.sectionTitle}>Health Considerations</Text>
      <Text style={styles.sectionSubtitle}>Any health-related dietary needs?</Text>

      <View style={styles.optionsContainer}>
        {medicalConditions.map((condition) => (
          <ConditionOption
            key={condition.id}
            condition={condition}
            isSelected={selectedPredefinedConditions.includes(condition.id as MedicalCondition)}
            onToggle={handleToggleCondition}
            scaleAnim={conditionCardScaleAnims[condition.id]}
          />
        ))}
      </View>

      {customMedicalConditions.length > 0 && (
        <View style={styles.customConditionsContainer}>
          {customMedicalConditions.map((condition, index) => (
            <CustomConditionChip
              key={`${condition}-${index}`}
              condition={condition}
              onRemove={onRemoveCustomCondition}
            />
          ))}
        </View>
      )}

      <View style={styles.addCustomContainer}>
        <TextInput
          style={styles.customConditionInput}
          placeholder="Add other health condition…"
          placeholderTextColor={colors.textSecondary}
          value={newCondition}
          onChangeText={setNewCondition}
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
  speechBubbleContainer: {
    position: 'absolute',
    top: 50,
    right: 15,
    alignItems: 'flex-end',
    zIndex: 20,
  },
  speechBubble: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  speechBubbleText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
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
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    margin: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOptionChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselectedOptionChip: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  unselectedOptionText: {
    color: colors.textPrimary,
  },
  customConditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginHorizontal: -3,
  },
  customConditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
    margin: 3,
  },
  customConditionChipText: {
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
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    paddingLeft: 10,
    height: 48,
  },
  customConditionInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  addButtonTouch: {
    // Wrapper for consistent touch area
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});

export default MedicalConditionsSelector; 