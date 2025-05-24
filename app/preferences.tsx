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
  const cuisineTypes = usePreferenceSelector(state => state.cuisineTypes || []);
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
  const [localCuisines, setLocalCuisines] = useState<string[]>(cuisineTypes);
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
    setLocalCuisines(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
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

    if (confettiRef.current) {
      confettiRef.current.reset();
      confettiRef.current.play();
    }
    
    // Use selective update methods for better performance
    updateDietaryProfile(localDietaryProfile as DietaryProfile);
    updateAllergies([...commonSelectedAllergies, ...customAllergies]);
    updateDislikedIngredients(localDislikedIngredients);
    updateSpiceLevel(localSpiceLevel as SpiceLevel);
    updateCuisineTypes(localCuisines);
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
    updateCuisineTypes, localCuisines, 
    updateCookingTimeLimit, localCookingTime, 
    updateMaxCalories, localMaxCalories, 
    updatePortionSize, localPortionSize, 
    updateMicroPreferences, localMicroPreferences, 
    updateCookingGoals, localCookingGoals, 
    updateMedicalConditions, localPredefinedMedicalConditions, localCustomMedicalConditions, 
    router
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" backgroundColor={colors.backgroundGradientStart} />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={styles.gradientBackground}
        locations={[0, 1]}
      >
        {/* TODO: Subtle lunch icons overlay view here */}
        {/* <View style={styles.lunchIconsOverlay}> ... </View> */}

        <View style={styles.headerContainer}>
          <AnimatedHeaderChefIcon />
          <Text style={styles.headerTitle}>Hey Chef, Let's Set Your Preferences! 🍽️</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
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
            <CuisineTypeSelector selectedCuisines={localCuisines} onToggleCuisine={handleToggleCuisine} />
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

        <View style={styles.stickyButtonOuterContainer}>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.8} style={styles.saveButtonTouch}>
            <Animated.View style={[styles.saveButton, { transform: [{ scale: saveButtonScaleAnim }] }]}>
              <Ionicons name="checkmark-circle-outline" size={26} color={colors.white} style={styles.saveButtonIcon} />
              <Text style={styles.saveButtonText}>Save Preferences!</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <LottieView
          ref={confettiRef}
          source={CONFETTI_LOTTIE} 
          loop={false}
          autoPlay={false}
          style={styles.lottieConfetti}
          resizeMode="cover"
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGradientEnd, // Match bottom of gradient
  },
  gradientBackground: {
    flex: 1,
    // position: 'relative', // For absolute positioned overlays like lunch icons
  },
  // lunchIconsOverlay: { StyleSheet.absoluteFillObject, zIndex: -1, opacity: 0.1 /* Add lunch icons here */ },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10, // Adjust for status bar
    paddingBottom: 15,
    // backgroundColor: 'transparent', // Over gradient
  },
  headerChefIconImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flexShrink: 1,
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100, // Ensure space for sticky button not to overlap content
  },
  stickyButtonOuterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15, // Avoid system navigation
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: colors.backgroundGradientEnd, // Match screen bottom to blend
    // borderTopWidth: 1, // Optional: subtle separator
    // borderTopColor: 'rgba(0,0,0,0.05)',
  },
  saveButtonTouch: {
    // Allows shadow to be visible if button has shadow
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15, // Rounded like Home screen buttons
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    zIndex: 1000,
    pointerEvents: 'none',
  },
});
