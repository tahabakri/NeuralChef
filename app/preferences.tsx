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
import { Stack } from 'expo-router';
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
} from '@/components/preferences';

// Theme colors from the prompt
const theme = {
  orange: '#FF9B54',
  lightOrange: 'rgba(255, 155, 84, 0.1)',
  green: '#4CAF50',
  lightGreen: 'rgba(76, 175, 80, 0.1)',
  white: '#FFFFFF',
  textDark: '#333333',
  textLight: '#555555',
  // Add other colors if needed from individual component styling
};

// Placeholder for animated header chef icon
const HeaderChefIcon: React.FC = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 600, // 300ms for half flip, 600ms for full flip-flop
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '0deg'], // Simple flip animation
  });

  // TODO: Replace with actual sandwich flipping animation/Lottie
  return (
    <Animated.View style={{ transform: [{ rotateY: rotation }] }}>
      <Ionicons name="restaurant-outline" size={36} color={theme.green} />
      {/* <Image source={require('@/assets/images/chef-flipping-sandwich.png')} style={{ width: 40, height: 40 }} /> */}
    </Animated.View>
  );
};


export default function PreferencesScreen() {
  // Preferences state from Zustand store
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

  // Effect to sync local state if store changes (e.g., after a reset elsewhere or initial load)
  useEffect(() => {
    setDietaryProfile(prefs.dietaryProfile);
    setAllStoredAllergies(prefs.allergies || []);
    // customAllergies are managed locally, not directly synced from a store field `prefs.customAllergies`
    setCustomAllergies([]); // Reset local custom allergies when store changes, or load them if they were persisted differently
    setDislikedIngredients(prefs.dislikedIngredients);
    setSpiceLevel(prefs.spiceLevel);
    setSelectedCuisines(prefs.cuisineTypes);
    setCookingTime(String(prefs.cookingTimeLimit));
    setMaxCalories(String(prefs.maxCalories));
    setPortionSize(prefs.portionSize);
    setMicroPreferences(prefs.microPreferences);
    setCookingGoals(prefs.cookingGoals);
  }, [
    prefs.dietaryProfile, prefs.allergies, /* removed prefs.customAllergies */ prefs.dislikedIngredients,
    prefs.spiceLevel, prefs.cuisineTypes, prefs.cookingTimeLimit, prefs.maxCalories,
    prefs.portionSize, prefs.microPreferences, prefs.cookingGoals
  ]);

  const saveButtonAnim = useRef(new Animated.Value(0)).current; // For spin animation
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
    if (!customAllergies.includes(allergy.trim()) && allergy.trim() !== "") {
      setCustomAllergies(prev => [...prev, allergy.trim()]);
    }
  };
  const handleRemoveCustomAllergy = (allergy: string) => {
    setCustomAllergies(prev => prev.filter(item => item !== allergy));
  };
  const handleAddDislikedIngredient = (ingredient: string) => {
    if (!dislikedIngredients.includes(ingredient.trim()) && ingredient.trim() !== "") {
      setDislikedIngredients(prev => [...prev, ingredient.trim()]);
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

  const handleSave = () => {
    // Spin animation for the button
    saveButtonAnim.setValue(0); // Reset animation
    Animated.timing(saveButtonAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    // TODO: Trigger confetti animation
    // confettiRef.current?.play();
    
    // TODO: Trigger chef clapping animation

    updatePreferences({
      dietaryProfile,
      allergies: [...commonSelectedAllergies, ...customAllergies], // Combine effectively selected common and new custom
      // No 'customAllergies' field in the store's updatePreferences payload
      dislikedIngredients,
      spiceLevel,
      cuisineTypes: selectedCuisines,
      cookingTimeLimit: Number(cookingTime) || 0,
      maxCalories: Number(maxCalories) || 0,
      portionSize,
      microPreferences,
      cookingGoals,
    });
    Alert.alert('Preferences Saved!', 'Your lunch preferences have been updated.');
  };

  const saveButtonSpin = saveButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" backgroundColor={theme.orange} />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[theme.orange, theme.white, theme.lightGreen]} // Orange top, fading to white, then light green bottom
        style={styles.gradientBackground}
        locations={[0, 0.4, 1]} // Orange dominant, then white, then green
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <HeaderChefIcon />
          <Text style={styles.headerTitle}>Your Lunch Preferences! 🥪</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Preferences */}
          <DietaryProfileSelector
            selectedProfile={dietaryProfile}
            onSelectProfile={setDietaryProfile}
          />
          <AllergiesSection
            selectedAllergies={commonSelectedAllergies} // Pass the filtered common allergies
            customAllergies={customAllergies} // Pass the local custom allergies
            onToggleAllergy={handleToggleAllergy}
            onAddCustomAllergy={handleAddCustomAllergy}
            onRemoveCustomAllergy={handleRemoveCustomAllergy}
          />
          <CookingTimeSelector
            selectedTime={cookingTime}
            onSelectTime={setCookingTime}
          />
          <PortionSizeSelector
            selectedSize={portionSize}
            onSelectSize={setPortionSize}
          />

          {/* More Options Section */}
          <MoreOptionsSection title="More Lunch Options">
            <SpiceLevelSelector
              selectedLevel={spiceLevel}
              onSelectLevel={setSpiceLevel}
            />
            <CuisineTypeSelector
              selectedCuisines={selectedCuisines}
              onToggleCuisine={handleToggleCuisine}
            />
            <CalorieSelector
              maxCalories={maxCalories}
              onChangeCalories={setMaxCalories}
            />
            <MicroPreferencesSection
              selectedPreferences={microPreferences}
              onTogglePreference={handleToggleMicroPreference}
            />
            <CookingGoalsSection
              selectedGoals={cookingGoals}
              onToggleGoal={handleToggleCookingGoal}
            />
            <DislikedIngredientsSection
              dislikedIngredients={dislikedIngredients}
              onAddIngredient={handleAddDislikedIngredient}
              onRemoveIngredient={handleRemoveDislikedIngredient}
            />
          </MoreOptionsSection>
        </ScrollView>

        {/* Sticky Save Button */}
        <View style={styles.stickyButtonContainer}>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
            <Animated.View style={[styles.saveButton, { transform: [{ rotate: saveButtonSpin }] }]}>
              <Ionicons name="restaurant-outline" size={28} color={theme.white} /> 
              {/* Placeholder for chef's spoon, using restaurant icon for now */}
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.saveButtonLabel}>Save for Lunch!</Text>
        </View>
        
        {/* TODO: Confetti Animation Layer */}
        {/* <LottieView
          ref={confettiRef}
          source={require('@/assets/animations/confetti.json')} // Replace with actual path
          loop={false}
          autoPlay={false}
          style={styles.lottieConfetti}
        /> */}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.orange, // Fallback for notch area
  },
  gradientBackground: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'android' ? 20 : 15, // Adjust padding for platform
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // Handled by gradient
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.white, // White or light color for contrast on orange
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', // Example rounded-ish font
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120, // Space for the sticky save button
  },
  // Individual section components are expected to style themselves as per the prompt
  // (e.g., background colors, borders, titles within their own component files)

  stickyButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20, // Adjust for safe area / navbar
    alignSelf: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: theme.green,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  saveButtonLabel: {
    color: theme.green, // Or theme.white if on a contrasting background
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
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
