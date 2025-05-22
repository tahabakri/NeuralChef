import React, { useRef, useState } from 'react';
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

const MedicalConditionsSelector: React.FC<MedicalConditionsSelectorProps> = ({
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

  // Animation refs for condition cards
  const conditionCardScaleAnims = useRef<{[key: string]: Animated.Value}>(
    medicalConditions.reduce((acc, condition) => ({ ...acc, [condition.id]: new Animated.Value(1) }), {})
  ).current;

  const playChefAnimation = (iconName: string = WINKING_CHEF_ICON, message?: string) => {
    setChefIconName(iconName);
    if (message) setChefMessage(message);
    
    chefIconScale.setValue(0.8); // Start smaller for a pop effect
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
        Animated.delay(2000), // Hold message
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
  };

  const handleAddCustom = () => {
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
  };

  const handleToggleCondition = (conditionId: MedicalCondition) => {
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
    playChefAnimation(); // Default wink
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
        <Ionicons name={chefIconName as any} size={30} color={colors.secondary} />
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
        {medicalConditions.map((condition) => {
          const isSelected = selectedPredefinedConditions.includes(condition.id as MedicalCondition);
          return (
            <Animated.View
              key={condition.id}
              style={{ transform: [{ scale: conditionCardScaleAnims[condition.id] }] }}
            >
              <TouchableOpacity
                style={[
                  styles.optionChip,
                  isSelected ? styles.selectedOptionChip : styles.unselectedOptionChip,
                ]}
                onPress={() => handleToggleCondition(condition.id as MedicalCondition)}
              >
                <Text style={styles.optionText}>{condition.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {customMedicalConditions.length > 0 && (
        <View style={styles.customConditionsContainer}>
          {customMedicalConditions.map((condition, index) => (
            <View key={`${condition}-${index}`} style={styles.customConditionChip}>
              <Text style={styles.customConditionChipText}>{condition}</Text>
              <TouchableOpacity 
                onPress={() => onRemoveCustomCondition(condition)} 
                style={styles.removeChipButton}
              >
                <Ionicons name="close-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.addCustomContainer}>
        <TextInput
          style={styles.customConditionInput}
          placeholder="Add other health condition…"
          placeholderTextColor={colors.secondary}
          value={newCondition}
          onChangeText={setNewCondition}
          onSubmitEditing={handleAddCustom}
          returnKeyType="done"
        />
        <Animated.View style={{ transform: [{scale: addBtnScale}]}}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCustom}
          >
            <Ionicons name="add-outline" size={28} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
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
  speechBubbleContainer: {
    position: 'absolute',
    top: 50,
    right: 15,
    alignItems: 'flex-end',
    zIndex: 20,
  },
  speechBubble: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  speechBubbleText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 5,
    fontFamily: 'PlayfulFont-Bold', // Placeholder
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 15,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4, // Offset for chip margins
    marginBottom: 15,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15, // Rounded cards
    margin: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90, // Minimum width for smaller text options
  },
  unselectedOptionChip: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  selectedOptionChip: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
  },
  customConditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    marginTop: 5,
  },
  customConditionChip: {
    backgroundColor: colors.secondary,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  customConditionChipText: {
    color: colors.primary,
    fontSize: 14,
    marginRight: 8,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  removeChipButton: {
    // Potentially add padding for easier tap target
  },
  addCustomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  customConditionInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: colors.secondary,
    marginRight: 10,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default MedicalConditionsSelector; 