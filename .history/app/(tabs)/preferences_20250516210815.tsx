import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Slider } from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import Button from '@/components/Button';
import colors from '@/constants/colors';
import FilterDropdown from '@/components/FilterDropdown';
import { 
  usePreferencesStore, 
  DietaryPreference, 
  SpiceLevel, 
  PortionSize,
  MicroPreference
} from '@/stores/preferencesStore';
import TagInput from '@/components/TagInput';

export default function PreferencesScreen() {
  const preferences = usePreferencesStore();
  const router = useRouter();
  
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(preferences.dietaryPreference);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(preferences.spiceLevel);
  const [allergies, setAllergies] = useState<string[]>(preferences.allergies);
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>(preferences.dislikedIngredients);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>(preferences.cuisineTypes);
  const [cookingTimeLimit, setCookingTimeLimit] = useState<number>(preferences.cookingTimeLimit);
  const [maxCalories, setMaxCalories] = useState<number>(preferences.maxCalories);
  const [portionSize, setPortionSize] = useState<PortionSize>(preferences.portionSize);
  const [microPreferences, setMicroPreferences] = useState<MicroPreference[]>(preferences.microPreferences);
  
  // Count of changed preferences (for save button state)
  const [changeCount, setChangeCount] = useState(0);
  
  // Update change count when preferences are modified
  useEffect(() => {
    let count = 0;
    
    if (dietaryPreference !== preferences.dietaryPreference) count++;
    if (spiceLevel !== preferences.spiceLevel) count++;
    if (JSON.stringify(allergies) !== JSON.stringify(preferences.allergies)) count++;
    if (JSON.stringify(dislikedIngredients) !== JSON.stringify(preferences.dislikedIngredients)) count++;
    if (JSON.stringify(cuisineTypes) !== JSON.stringify(preferences.cuisineTypes)) count++;
    if (cookingTimeLimit !== preferences.cookingTimeLimit) count++;
    if (maxCalories !== preferences.maxCalories) count++;
    if (portionSize !== preferences.portionSize) count++;
    if (JSON.stringify(microPreferences) !== JSON.stringify(preferences.microPreferences)) count++;
    
    setChangeCount(count);
  }, [
    dietaryPreference, 
    spiceLevel, 
    allergies, 
    dislikedIngredients, 
    cuisineTypes, 
    cookingTimeLimit,
    maxCalories,
    portionSize,
    microPreferences,
    preferences
  ]);
  
  const handleSavePreferences = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    await preferences.setDietaryPreference(dietaryPreference);
    await preferences.setSpiceLevel(spiceLevel);
    await preferences.setAllergies(allergies);
    await preferences.setDislikedIngredients(dislikedIngredients);
    await preferences.setCuisineTypes(cuisineTypes);
    await preferences.setCookingTimeLimit(cookingTimeLimit);
    await preferences.setMaxCalories(maxCalories);
    await preferences.setPortionSize(portionSize);
    await preferences.setMicroPreferences(microPreferences);
    
    setChangeCount(0);
  };
  
  const handleReset = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    await preferences.resetPreferences();
    
    // Reset local state
    setDietaryPreference(preferences.dietaryPreference);
    setSpiceLevel(preferences.spiceLevel);
    setAllergies(preferences.allergies);
    setDislikedIngredients(preferences.dislikedIngredients);
    setCuisineTypes(preferences.cuisineTypes);
    setCookingTimeLimit(preferences.cookingTimeLimit);
    setMaxCalories(preferences.maxCalories);
    setPortionSize(preferences.portionSize);
    setMicroPreferences(preferences.microPreferences);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Dietary Preferences</Text>
        <Text style={styles.subtitle}>
          Customize your dietary preferences and restrictions to get personalized recipe suggestions
        </Text>
        
        <View style={styles.section}>
          <FilterDropdown
            type="dietary"
            label="Dietary Preference"
            selectedDietaryValue={dietaryPreference}
            onDietaryChange={setDietaryPreference}
            tooltip="Select your primary dietary preference for recipe filtering"
          />
          
          <FilterDropdown
            type="spice"
            label="Spice Level"
            selectedSpiceValue={spiceLevel}
            onSpiceLevelChange={setSpiceLevel}
            tooltip="Choose your preferred level of spiciness in recipes"
          />
          
          <FilterDropdown
            type="portion"
            label="Typical Portion Size"
            selectedPortionSize={portionSize}
            onPortionSizeChange={setPortionSize}
            tooltip="Set default portion/serving size for recipes"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutritional Preferences</Text>
          
          <FilterDropdown
            type="calories"
            label="Maximum Calories"
            maxCalories={maxCalories}
            onMaxCaloriesChange={setMaxCalories}
            tooltip="Set a maximum calorie limit per serving (0 = no limit)"
          />
          
          <FilterDropdown
            type="micro"
            label="Nutritional Focus"
            selectedMicroPreferences={microPreferences}
            onMicroPreferencesChange={setMicroPreferences}
            tooltip="Select specific nutritional goals for your recipes"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time & Convenience</Text>
          
          <FilterDropdown
            type="time"
            label="Maximum Cooking Time"
            cookingTimeLimit={cookingTimeLimit}
            onCookingTimeLimitChange={setCookingTimeLimit}
            tooltip="Set a maximum cooking time in minutes (0 = no limit)"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies & Restrictions</Text>
          <Text style={styles.helperText}>
            Enter allergies or ingredients to avoid. These will be strictly excluded from your recipes.
          </Text>
          
          <TagInput
            tags={allergies}
            onTagsChange={setAllergies}
            placeholder="Enter allergens (e.g., 'peanuts')"
            label="Allergies"
          />
          
          <TagInput
            tags={dislikedIngredients}
            onTagsChange={setDislikedIngredients}
            placeholder="Enter ingredients (e.g., 'olives')"
            label="Disliked Ingredients"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuisine Preferences</Text>
          <Text style={styles.helperText}>
            Enter cuisine types you prefer. Leave empty if you enjoy all cuisines.
          </Text>
          
          <TagInput
            tags={cuisineTypes}
            onTagsChange={setCuisineTypes}
            placeholder="Enter cuisines (e.g., 'Italian')"
            label="Preferred Cuisines"
          />
        </View>
        
        <View style={styles.buttons}>
          <Button 
            title="Save Preferences"
            onPress={handleSavePreferences}
            style={styles.saveButton}
            disabled={changeCount === 0}
            accessibilityLabel="Save dietary preferences"
            accessibilityHint="Double tap to save your dietary preference settings"
          />
          
          <Button 
            title="Reset to Defaults"
            onPress={handleReset}
            variant="outline"
            style={styles.resetButton}
            accessibilityLabel="Reset to default preferences"
            accessibilityHint="Double tap to reset all preferences to default values"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  buttons: {
    marginTop: 8,
  },
  saveButton: {
    marginBottom: 12,
  },
  resetButton: {
  },
}); 