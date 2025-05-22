import React, { useState, useRef, useEffect } from 'react';
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

// Animated Winking Chef Icon for Header
const AnimatedHeaderChefIcon: React.FC = () => {
  return (
    <Image
      source={require('@/assets/images/winking-chef.png')}
      style={styles.headerChefIconImage}
    />
  );
};


export default function PreferencesScreen() {
  const router = useRouter();
  const prefs = usePreferencesStore(state => state);
  const updatePreferences = usePreferencesStore(state => state.updatePreferences);

  // Local component state, initialized from the store
  // For customAllergies, if the store doesn't have it, initialize as empty array or handle appropriately.
  // Assuming customAllergies are not part of the persisted store state based on errors.
  const initialCustomAllergies = Array.isArray(prefs.allergies) ? prefs.allergies.filter(a => {
    // A simple heuristic: if an allergy is not in a predefined list, it might be custom.
    // This depends on how commonAllergies are defined and if they are accessible here.
    // For now, let's assume the store's `allergies` array contains ALL allergies (common + custom).
    // The UI then needs to differentiate them if needed.
    // The prompt implies `AllergiesSection` handles `selectedAllergies` and `customAllergies` separately for its UI.
    // Let's stick to the previous logic of filtering them out if they were stored separately,
    // but since `prefs.customAllergies` doesn't exist, we'll manage customAllergies purely locally.
    return false; // Placeholder, will be managed locally.
  }) : [];

  const [dietaryProfile, setDietaryProfile] = useState<DietaryProfileType>(prefs.dietaryProfile);
  // Initialize `allergies` with those from store that are NOT in local `customAllergies` state.
  // This logic is a bit circular if `customAllergies` itself isn't persisted.
  // Let's simplify: `allergies` from store are all allergies. `customAllergies` is for UI interaction.
  const [allStoredAllergies, setAllStoredAllergies] = useState<string[]>(prefs.allergies || []);
  const [customAllergies, setCustomAllergies] = useState<string[]>([]); // Purely local for UI
  // `selectedAllergies` for the component will be `allStoredAllergies` minus `customAllergies`
  const commonSelectedAllergies = allStoredAllergies.filter(a => !customAllergies.includes(a));

  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>(prefs.dislikedIngredients);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevelType>(prefs.spiceLevel);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(prefs.cuisineTypes);
  const [cookingTime, setCookingTime] = useState<string>(String(prefs.cookingTimeLimit));
  const [maxCalories, setMaxCalories] = useState<string>(String(prefs.maxCalories));
  const [portionSize, setPortionSize] = useState<PortionSizeType>(prefs.portionSize);
  const [microPreferences, setMicroPreferences] = useState<MicroPreference[]>(prefs.microPreferences);
  const [cookingGoals, setCookingGoals] = useState<CookingGoal[]>(prefs.cookingGoals);
  
  // Define predefined medical conditions for consistent filtering
  const predefinedMedicalConditionsList: MedicalCondition[] = ['Diabetes', 'Hypertension', 'Celiac Disease', 'High Cholesterol', 'IBS'];
  
  // Split medicalConditions from store into predefined and custom
  const [selectedPredefinedMedicalConditions, setSelectedPredefinedMedicalConditions] = useState<MedicalCondition[]>(
    (prefs.medicalConditions || [])
      .filter((condition): condition is MedicalCondition => 
        predefinedMedicalConditionsList.includes(condition as any)
      )
  );
  
  const [customMedicalConditions, setCustomMedicalConditions] = useState<string[]>(
    (prefs.medicalConditions || [])
      .filter(condition => 
        !predefinedMedicalConditionsList.includes(condition as any)
      ) as string[]
  );

  // Effect to sync local state if store changes
  useEffect(() => {
    setDietaryProfile(prefs.dietaryProfile);
    setAllStoredAllergies(prefs.allergies || []);
    setCustomAllergies([]);
    setDislikedIngredients(prefs.dislikedIngredients);
    setSpiceLevel(prefs.spiceLevel);
    setSelectedCuisines(prefs.cuisineTypes);
    setCookingTime(String(prefs.cookingTimeLimit));
    setMaxCalories(String(prefs.maxCalories));
    setPortionSize(prefs.portionSize);
    setMicroPreferences(prefs.microPreferences);
    setCookingGoals(prefs.cookingGoals);
    
    // Split medicalConditions from store into predefined and custom
    setSelectedPredefinedMedicalConditions(
      (prefs.medicalConditions || [])
        .filter((condition): condition is MedicalCondition => 
          predefinedMedicalConditionsList.includes(condition as any)
        )
    );
    setCustomMedicalConditions(
      (prefs.medicalConditions || [])
        .filter(condition => 
          !predefinedMedicalConditionsList.includes(condition as any)
        ) as string[]
    );
  }, [
    prefs.dietaryProfile, prefs.allergies, prefs.dislikedIngredients,
    prefs.spiceLevel, prefs.cuisineTypes, prefs.cookingTimeLimit, prefs.maxCalories,
    prefs.portionSize, prefs.microPreferences, prefs.cookingGoals, prefs.medicalConditions
  ]);

  const saveButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef<LottieView>(null);

  // Handlers for preference changes
  const handleToggleAllergy = (id: string) => {
    setAllStoredAllergies((prev: string[]) => 
      prev.includes(id) 
        ? prev.filter((item: string) => item !== id) 
        : [...prev, id]
    );
  };
  const handleAddCustomAllergy = (allergy: string) => {
    const trimmedAllergy = allergy.trim();
    if (trimmedAllergy && !customAllergies.includes(trimmedAllergy) && !allStoredAllergies.includes(trimmedAllergy)) {
      setCustomAllergies(prev => [...prev, trimmedAllergy]);
    }
  };
  const handleRemoveCustomAllergy = (allergy: string) => {
    setCustomAllergies(prev => prev.filter(item => item !== allergy));
  };
  const handleAddDislikedIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !dislikedIngredients.includes(trimmed)) {
      setDislikedIngredients(prev => [...prev, trimmed]);
    }
  };
  const handleRemoveDislikedIngredient = (ingredient: string) => {
    setDislikedIngredients(prev => prev.filter(item => item !== ingredient));
  };
  const handleToggleCuisine = (id: string) => {
    setSelectedCuisines(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  const handleToggleMicroPreference = (id: MicroPreference) => {
    setMicroPreferences(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  const handleToggleCookingGoal = (id: CookingGoal) => {
    setCookingGoals(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  const handleTogglePredefinedMedicalCondition = (condition: MedicalCondition) => {
    setSelectedPredefinedMedicalConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(item => item !== condition) 
        : [...prev, condition]
    );
  };
  const handleAddCustomMedicalCondition = (condition: string) => {
    if (condition.trim() && !customMedicalConditions.includes(condition.trim())) {
      setCustomMedicalConditions(prev => [...prev, condition.trim()]);
    }
  };
  const handleRemoveCustomMedicalCondition = (condition: string) => {
    setCustomMedicalConditions(prev => prev.filter(item => item !== condition));
  };

  const handleSave = () => {
    Animated.sequence([
      Animated.timing(saveButtonScaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(saveButtonScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    confettiRef.current?.reset();
    confettiRef.current?.play();
    
    updatePreferences({
      dietaryProfile,
      allergies: [...commonSelectedAllergies, ...customAllergies],
      dislikedIngredients,
      spiceLevel,
      cuisineTypes: selectedCuisines,
      cookingTimeLimit: Number(cookingTime) || 0,
      maxCalories: Number(maxCalories) || 0,
      portionSize,
      microPreferences,
      cookingGoals,
      medicalConditions: [
        ...selectedPredefinedMedicalConditions,
        ...customMedicalConditions
      ] as MedicalCondition[], // Cast to satisfy TypeScript
    });
    // Consider a custom toast/modal instead of Alert for better UX matching the theme
    Alert.alert('Preferences Saved!', 'Your lunch preferences are all set!', [{ text: 'Awesome!', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" backgroundColor={colors.backgroundGradientStart} />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[colors.softBlueStart, colors.softBlueEnd]}
        style={styles.gradientBackground}
        locations={[0, 0.6]} // Adjust gradient spread
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
        >
          <DietaryProfileSelector selectedProfile={dietaryProfile} onSelectProfile={setDietaryProfile} />
          <AllergiesSection
            selectedAllergies={commonSelectedAllergies}
            customAllergies={customAllergies}
            onToggleAllergy={handleToggleAllergy}
            onAddCustomAllergy={handleAddCustomAllergy}
            onRemoveCustomAllergy={handleRemoveCustomAllergy}
          />
          <MedicalConditionsSelector
            selectedPredefinedConditions={selectedPredefinedMedicalConditions}
            customMedicalConditions={customMedicalConditions}
            onTogglePredefinedCondition={handleTogglePredefinedMedicalCondition}
            onAddCustomCondition={handleAddCustomMedicalCondition}
            onRemoveCustomCondition={handleRemoveCustomMedicalCondition}
          />
          <CookingTimeSelector selectedTime={cookingTime} onSelectTime={setCookingTime} />
          <PortionSizeSelector selectedSize={portionSize} onSelectSize={setPortionSize} />

          <MoreOptionsSection title="More Lunch Options">
            <SpiceLevelSelector selectedLevel={spiceLevel} onSelectLevel={setSpiceLevel} />
            <CuisineTypeSelector selectedCuisines={selectedCuisines} onToggleCuisine={handleToggleCuisine} />
            <CalorieSelector maxCalories={maxCalories} onChangeCalories={setMaxCalories} />
            <MicroPreferencesSection selectedPreferences={microPreferences} onTogglePreference={handleToggleMicroPreference} />
            <CookingGoalsSection selectedGoals={cookingGoals} onToggleGoal={handleToggleCookingGoal} />
            <DislikedIngredientsSection
              dislikedIngredients={dislikedIngredients}
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
    color: colors.text,
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
    backgroundColor: colors.primary, // Warm orange color
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
