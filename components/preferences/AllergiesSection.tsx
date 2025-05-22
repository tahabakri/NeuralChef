import React, { useState, useRef, useEffect } from 'react';
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

// Theme colors
const theme = {
  orange: '#FF8C00', // Brighter orange
  lightOrange: 'rgba(255, 155, 84, 0.1)', // orange with 10% opacity
  green: '#50C878', // Emerald green
  lightGreen: 'rgba(76, 175, 80, 0.1)', // green with 10% opacity
  white: '#FFFFFF',
  glassBg: 'rgba(255, 255, 255, 0.2)', // Glassmorphic background
  borderColor: 'rgba(255, 255, 255, 0.3)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  lightOrangeFill: 'rgba(255, 140, 0, 0.1)', // Light orange for input fill
};

// Chef icon states
const WINKING_CHEF_ICON = "happy-outline";
const FROWNING_CHEF_ICON = "sad-outline"; // Or any suitable frowning icon
const DEFAULT_CHEF_ICON = "person-circle-outline";

const AllergiesSection: React.FC<AllergiesSectionProps> = ({
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

  // Animation refs for allergy cards
  const allergyCardScaleAnims = useRef<{ [key: string]: Animated.Value }>(
    commonAllergies.reduce((acc, allergy) => ({ ...acc, [allergy.id]: new Animated.Value(1) }), {})
  ).current;

  const playChefAnimation = (iconName: string, message?: string) => {
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
  };

  const handleToggleAllergy = (id: string) => {
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
        <Ionicons name={chefIconName as any} size={30} color={theme.orange} />
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
          <Animated.View
            key={allergy.id}
            style={{ transform: [{ scale: allergyCardScaleAnims[allergy.id] }] }}
          >
            <TouchableOpacity
              style={[
                styles.allergyOption,
                selectedAllergies.includes(allergy.id) 
                  ? styles.selectedAllergyOption 
                  : styles.unselectedAllergyOption,
              ]}
              onPress={() => handleToggleAllergy(allergy.id)}
            >
              <Text style={styles.allergyOptionText}>{allergy.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {customAllergies.length > 0 && (
        <View style={styles.customAllergyListContainer}>
          {customAllergies.map((allergy, index) => (
            <View key={`${allergy}-${index}`} style={styles.customAllergyChip}>
              <Text style={styles.customAllergyChipText}>{allergy}</Text>
              <TouchableOpacity onPress={() => onRemoveCustomAllergy(allergy)} style={styles.removeChipButton}>
                <Ionicons name="close-outline" size={20} color={theme.green} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.addCustomContainer}>
        <TextInput
          style={styles.customAllergyInput}
          placeholder="Add an allergy…"
          placeholderTextColor={theme.orange} // Using orange for placeholder
          value={newAllergy}
          onChangeText={setNewAllergy}
          onSubmitEditing={handleAddCustom} // Allows submitting with keyboard "done"
          returnKeyType="done"
        />
        <Animated.View style={{ transform: [{scale: addBtnScale}]}}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCustom}
            >
                <Ionicons name="add-outline" size={28} color={theme.white} />
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
  speechBubbleContainer: {
    position: 'absolute',
    top: 50, // Adjust as needed, below the chef icon
    right: 15,
    alignItems: 'flex-end',
    zIndex: 20,
  },
  speechBubble: {
    backgroundColor: theme.green,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  speechBubbleText: {
    color: theme.white,
    fontSize: 14,
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 15,
    marginHorizontal: -4, // Offset for card margins
  },
  allergyOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    margin: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedAllergyOption: {
    backgroundColor: theme.green,
    borderColor: theme.orange,
  },
  selectedAllergyOption: {
    backgroundColor: theme.orange,
    borderColor: theme.green, // Green outline when selected
  },
  allergyOptionText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder
  },
  customAllergyListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    marginTop: 5, // Add some space if there are common allergies above
  },
  customAllergyChip: {
    backgroundColor: theme.orange,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    borderWidth: 1,
    borderColor: theme.green, // Green border for chip
  },
  customAllergyChipText: {
    color: theme.green, // Green text
    fontSize: 14,
    marginRight: 8,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  removeChipButton: {
    // Style for the 'x' button if needed, e.g., padding
  },
  addCustomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  customAllergyInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.green,
    backgroundColor: theme.lightOrangeFill, // Light orange fill
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10, // Adjust padding for platform
    fontSize: 16,
    color: theme.orange, // Text color when typing
    marginRight: 10,
    fontFamily: 'PlayfulFont-Regular', // Placeholder
  },
  addButton: {
    backgroundColor: theme.green,
    padding: 10,
    borderRadius: 10, // Rounded button
    borderWidth: 2,
    borderColor: theme.orange, // Orange outline
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default AllergiesSection;
