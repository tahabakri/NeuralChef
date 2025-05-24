import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Alert, // Kept for now, can be replaced by more visual feedback
  Platform,
  Image, // For placeholder chef icon
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore: ignore type errors in LottieView library
import LottieView from 'lottie-react-native'; // For confetti and other animations

import {
  usePreferencesStore,
  usePreferenceSelector,
  DietaryProfile, // This is the type from the store, equivalent to DietaryProfileId
  SpiceLevel,     // Equivalent to SpiceLevelId
  PortionSize,    // Equivalent to PortionSizeId
  MicroPreference,
  CookingGoal,
  MedicalCondition, // Added MedicalCondition
} from '@/stores/preferencesStore';

// Import the specific string literal union types for props
import {
  DietaryProfileType,
  SpiceLevelType,
  PortionSizeType,
} from '@/components/preferences/types';

import {
  DietaryProfileSelector,
  AllergiesSection,
  DislikedIngredientsSection,
  SpiceLevelSelector,
  CuisineTypeSelector,
  CookingTimeSelector,
  CalorieSelector,
  PortionSizeSelector,
  MicroPreferencesSection,
  CookingGoalsSection,
  MoreOptionsSection, // Import the new MoreOptionsSection
  MedicalConditionsSelector, // Added MedicalConditionsSelector
} from '@/components/preferences';

// Import app colors and gradients
import colors from '@/constants/colors';
import gradients, { directions } from '@/constants/gradients';
// Assuming cuisineTypes from constants might be useful for distinguishing predefined from custom
import { cuisineTypes as predefinedCuisineTypesConstant } from '@/components/preferences/constants';

const CONFETTI_LOTTIE = require('@/assets/animations/confetti.json'); // Placeholder path

// Memoized Winking Chef Icon for Header
const AnimatedHeaderChefIcon = React.memo(() => {
  return (
    <Image
      source={require('@/assets/images/winking-chef.png')}
      style={styles.headerChefIconImage}
    />
  );
});


export default function PreferencesScreen() {
  const router = useRouter();
  
  // Use selective state selectors for better performance
  const dietaryProfile = usePreferenceSelector(state => state.dietaryProfile);
  const allergies = usePreferenceSelector(state => state.allergies || []);
  const dislikedIngredients = usePreferenceSelector(state => state.dislikedIngredients || []);
  const spiceLevel = usePreferenceSelector(state => state.spiceLevel);
  // cuisineTypes from store will hold BOTH predefined IDs and custom string names
  const storedCuisineTypes = usePreferenceSelector(state => state.cuisineTypes || []);
  const cookingTimeLimit = usePreferenceSelector(state => state.cookingTimeLimit || 0);
  const maxCalories = usePreferenceSelector(state => state.maxCalories || 0);
  const portionSize = usePreferenceSelector(state => state.portionSize);
  const microPreferences = usePreferenceSelector(state => state.microPreferences || []);
  const cookingGoals = usePreferenceSelector(state => state.cookingGoals || []);
  const medicalConditions = usePreferenceSelector(state => state.medicalConditions || []);
  
  // Get selective update functions
  const updateDietaryProfile = usePreferencesStore(state => state.updateDietaryProfile);
  const updateAllergies = usePreferencesStore(state => state.updateAllergies);
  const updateDislikedIngredients = usePreferencesStore(state => state.updateDislikedIngredients);
  const updateSpiceLevel = usePreferencesStore(state => state.updateSpiceLevel);
  const updateCuisineTypes = usePreferencesStore(state => state.updateCuisineTypes);
  const updateCookingTimeLimit = usePreferencesStore(state => state.updateCookingTimeLimit);
  const updateMaxCalories = usePreferencesStore(state => state.updateMaxCalories);
  const updatePortionSize = usePreferencesStore(state => state.updatePortionSize);
  const updateMicroPreferences = usePreferencesStore(state => state.updateMicroPreferences);
  const updateCookingGoals = usePreferencesStore(state => state.updateCookingGoals);
  const updateMedicalConditions = usePreferencesStore(state => state.updateMedicalConditions);
  
  // Predefined medical conditions list
  const predefinedMedicalConditionsList: MedicalCondition[] = ['Diabetes', 'Hypertension', 'Celiac Disease', 'High Cholesterol', 'IBS'];
  
  // Local component state for UI interactions
  const [localDietaryProfile, setLocalDietaryProfile] = useState<DietaryProfileType>(dietaryProfile);
  const [localAllergies, setLocalAllergies] = useState<string[]>(allergies);
  const [customAllergies, setCustomAllergies] = useState<string[]>([]);
  // Common allergies calculation
  const commonSelectedAllergies = localAllergies.filter(a => !customAllergies.includes(a));

  const [localDislikedIngredients, setLocalDislikedIngredients] = useState<string[]>(dislikedIngredients);
  const [localSpiceLevel, setLocalSpiceLevel] = useState<SpiceLevelType>(spiceLevel);
  
  // Separate state for predefined cuisine IDs and custom cuisine strings
  const [localCuisines, setLocalCuisines] = useState<string[]>(() => 
    storedCuisineTypes.filter(c => predefinedCuisineTypesConstant.some(pc => pc.id === c))
  );
  const [localCustomCuisines, setLocalCustomCuisines] = useState<string[]>(() => 
    storedCuisineTypes.filter(c => !predefinedCuisineTypesConstant.some(pc => pc.id === c))
  );

  const [localCookingTime, setLocalCookingTime] = useState<string>(String(cookingTimeLimit));
  const [localMaxCalories, setLocalMaxCalories] = useState<string>(String(maxCalories));
  const [localPortionSize, setLocalPortionSize] = useState<PortionSizeType>(portionSize);
  const [localMicroPreferences, setLocalMicroPreferences] = useState<MicroPreference[]>(microPreferences);
  const [localCookingGoals, setLocalCookingGoals] = useState<CookingGoal[]>(cookingGoals);
  
  const [localPredefinedMedicalConditions, setLocalPredefinedMedicalConditions] = useState<MedicalCondition[]>(
    (medicalConditions || [])
      .filter((condition): condition is MedicalCondition => 
        predefinedMedicalConditionsList.includes(condition as any)
      )
  );
  
  const [localCustomMedicalConditions, setLocalCustomMedicalConditions] = useState<string[]>(
    (medicalConditions || [])
      .filter(condition => 
        !predefinedMedicalConditionsList.includes(condition as any)
      ) as string[]
  );

  // Animation refs
  const saveButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef<LottieView>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Memoized handlers for better performance
  const handleToggleAllergy = useCallback((id: string) => {
    setLocalAllergies(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  }, []);

  const handleAddCustomAllergy = useCallback((allergy: string) => {
    const trimmedAllergy = allergy.trim();
    if (trimmedAllergy && !customAllergies.includes(trimmedAllergy) && !localAllergies.includes(trimmedAllergy)) {
      setCustomAllergies(prev => [...prev, trimmedAllergy]);
      setLocalAllergies(prev => [...prev, trimmedAllergy]);
    }
  }, [customAllergies, localAllergies]);

  const handleRemoveCustomAllergy = useCallback((allergy: string) => {
    setCustomAllergies(prev => prev.filter(item => item !== allergy));
    setLocalAllergies(prev => prev.filter(item => item !== allergy));
  }, []);

  const handleAddDislikedIngredient = useCallback((ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !localDislikedIngredients.includes(trimmed)) {
      setLocalDislikedIngredients(prev => [...prev, trimmed]);
    }
  }, [localDislikedIngredients]);

  const handleRemoveDislikedIngredient = useCallback((ingredient: string) => {
    setLocalDislikedIngredients(prev => prev.filter(item => item !== ingredient));
  }, []);

  const handleToggleCuisine = useCallback((id: string) => {
    setLocalCuisines(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  }, []);

  const handleAddCustomCuisine = useCallback((cuisine: string) => {
    if (cuisine.trim() && !localCustomCuisines.includes(cuisine.trim())) {
      setLocalCustomCuisines(prev => [...prev, cuisine.trim()]);
    }
  }, [localCustomCuisines]);

  const handleRemoveCustomCuisine = useCallback((cuisine: string) => {
    setLocalCustomCuisines(prev => prev.filter(item => item !== cuisine));
  }, []);

  const handleToggleMicroPreference = useCallback((id: MicroPreference) => {
    setLocalMicroPreferences(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  }, []);

  const handleToggleCookingGoal = useCallback((id: CookingGoal) => {
    setLocalCookingGoals(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  }, []);

  const handleTogglePredefinedMedicalCondition = useCallback((condition: MedicalCondition) => {
    setLocalPredefinedMedicalConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(item => item !== condition) 
        : [...prev, condition]
    );
  }, []);

  const handleAddCustomMedicalCondition = useCallback((condition: string) => {
    if (condition.trim() && !localCustomMedicalConditions.includes(condition.trim())) {
      setLocalCustomMedicalConditions(prev => [...prev, condition.trim()]);
    }
  }, [localCustomMedicalConditions]);

  const handleRemoveCustomMedicalCondition = useCallback((condition: string) => {
    setLocalCustomMedicalConditions(prev => prev.filter(item => item !== condition));
  }, []);

  const handleSave = useCallback(() => {
    Animated.sequence([
      Animated.timing(saveButtonScaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(saveButtonScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setShowConfetti(true);
    
    // Use selective update methods for better performance
    updateDietaryProfile(localDietaryProfile as DietaryProfile);
    updateAllergies([...commonSelectedAllergies, ...customAllergies]);
    updateDislikedIngredients(localDislikedIngredients);
    updateSpiceLevel(localSpiceLevel as SpiceLevel);
    // Combine predefined and custom cuisines for saving
    updateCuisineTypes([...localCuisines, ...localCustomCuisines]);
    updateCookingTimeLimit(Number(localCookingTime) || 0);
    updateMaxCalories(Number(localMaxCalories) || 0);
    updatePortionSize(localPortionSize as PortionSize);
    updateMicroPreferences(localMicroPreferences);
    updateCookingGoals(localCookingGoals);
    updateMedicalConditions([
      ...localPredefinedMedicalConditions,
      ...localCustomMedicalConditions
    ] as MedicalCondition[]);
    
    Alert.alert('Preferences Saved!', 'Your lunch preferences are all set!', [{ text: 'Awesome!', onPress: () => router.back() }]);
  }, [
    saveButtonScaleAnim, updateDietaryProfile, localDietaryProfile, 
    updateAllergies, commonSelectedAllergies, customAllergies, 
    updateDislikedIngredients, localDislikedIngredients, 
    updateSpiceLevel, localSpiceLevel, 
    updateCuisineTypes, localCuisines, localCustomCuisines,
    updateCookingTimeLimit, localCookingTime, 
    updateMaxCalories, localMaxCalories, 
    updatePortionSize, localPortionSize, 
    updateMicroPreferences, localMicroPreferences, 
    updateCookingGoals, localCookingGoals, 
    updateMedicalConditions, localPredefinedMedicalConditions, localCustomMedicalConditions, 
    router, setShowConfetti
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={colors.orangeAccentStart} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Header with gradient */}
        <LinearGradient
          colors={[colors.orangeAccentStart, colors.orangeAccentEnd]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContainer}>
            <AnimatedHeaderChefIcon />
            <Text style={styles.headerTitle}>Hey Chef, Let's Set Your Preferences! 🍽️</Text>
          </View>
        </LinearGradient>

        {/* Main content area */}
        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <DietaryProfileSelector selectedProfile={localDietaryProfile} onSelectProfile={setLocalDietaryProfile} />
            <AllergiesSection
              selectedAllergies={commonSelectedAllergies}
              customAllergies={customAllergies}
              onToggleAllergy={handleToggleAllergy}
              onAddCustomAllergy={handleAddCustomAllergy}
              onRemoveCustomAllergy={handleRemoveCustomAllergy}
            />
            <MedicalConditionsSelector
              selectedPredefinedConditions={localPredefinedMedicalConditions}
              customMedicalConditions={localCustomMedicalConditions}
              onTogglePredefinedCondition={handleTogglePredefinedMedicalCondition}
              onAddCustomCondition={handleAddCustomMedicalCondition}
              onRemoveCustomCondition={handleRemoveCustomMedicalCondition}
            />
            <CookingTimeSelector selectedTime={localCookingTime} onSelectTime={setLocalCookingTime} />
            <PortionSizeSelector selectedSize={localPortionSize} onSelectSize={setLocalPortionSize} />

            <MoreOptionsSection title="More Lunch Options">
              <SpiceLevelSelector selectedLevel={localSpiceLevel} onSelectLevel={setLocalSpiceLevel} />
              <CuisineTypeSelector
                selectedCuisines={localCuisines}
                onToggleCuisine={handleToggleCuisine}
                customCuisines={localCustomCuisines}
                onAddCustomCuisine={handleAddCustomCuisine}
                onRemoveCustomCuisine={handleRemoveCustomCuisine}
              />
              <CalorieSelector maxCalories={localMaxCalories} onChangeCalories={setLocalMaxCalories} />
              <MicroPreferencesSection selectedPreferences={localMicroPreferences} onTogglePreference={handleToggleMicroPreference} />
              <CookingGoalsSection selectedGoals={localCookingGoals} onToggleGoal={handleToggleCookingGoal} />
              <DislikedIngredientsSection
                dislikedIngredients={localDislikedIngredients}
                onAddIngredient={handleAddDislikedIngredient}
                onRemoveIngredient={handleRemoveDislikedIngredient}
              />
            </MoreOptionsSection>
          </ScrollView>

          {/* Save button at bottom */}
          <View style={styles.stickyButtonOuterContainer}>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.8} style={styles.saveButtonTouch}>
              <LinearGradient
                colors={[colors.accentGreenStart, colors.accentGreenEnd]}
                style={[styles.saveButton]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Animated.View style={{ transform: [{ scale: saveButtonScaleAnim }] }}>
                  <View style={styles.saveButtonInner}>
                    <Ionicons name="checkmark-circle-outline" size={26} color={colors.white} style={styles.saveButtonIcon} />
                    <Text style={styles.saveButtonText}>Save Preferences!</Text>
                  </View>
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Confetti overlay - only shown when needed */}
        {showConfetti && (
          <LottieView
            ref={confettiRef as any}
            source={CONFETTI_LOTTIE as any}
            loop={false}
            autoPlay={true}
            style={styles.lottieConfetti}
            resizeMode="cover"
            onAnimationFinish={() => {
              setShowConfetti(false);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerChefIconImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    flexShrink: 1,
    marginLeft: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 100,
  },
  stickyButtonOuterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  saveButtonTouch: {
    width: '100%',
  },
  saveButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  lottieConfetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
