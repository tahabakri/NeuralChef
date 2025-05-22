import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { DietaryProfile, SpiceLevel } from '@/stores/preferencesStore';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '@/constants/typography';
import BackArrow from '@/components/BackArrow';
import Slider from '@react-native-community/slider';

interface StylePreferencesStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  isLastStep?: boolean;
  stepIndex: number;
  totalSteps: number;
}

interface PreferenceOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const { width } = Dimensions.get('window');

// Define options with expanded dietary preferences
const dietaryPreferences: PreferenceOption[] = [
  { id: 'omnivore', label: 'Omnivore', icon: 'restaurant' },
  { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
  { id: 'vegan', label: 'Vegan', icon: 'nutrition' },
  { id: 'pescatarian', label: 'Pescatarian', icon: 'fish-outline' },
  { id: 'glutenFree', label: 'Gluten Free', icon: 'ban' },
  { id: 'dairyFree', label: 'Dairy Free', icon: 'water' },
  { id: 'lowFODMAP', label: 'Low FODMAP', icon: 'barbell-outline' },
  { id: 'keto', label: 'Keto', icon: 'flame' },
  { id: 'paleo', label: 'Paleo', icon: 'fish' },
  { id: 'mediterranean', label: 'Mediterranean', icon: 'earth' },
  { id: 'customDiet', label: 'Custom Diet', icon: 'create-outline' },
];

const mealPreferences: PreferenceOption[] = [
  { id: 'quickMeals', label: 'Quick Meals (<30 min)', icon: 'timer' },
  { id: 'familyFriendly', label: 'Family Friendly', icon: 'people' },
  { id: 'budgetFriendly', label: 'Budget Friendly', icon: 'wallet' },
  { id: 'singleServing', label: 'Single Serving', icon: 'person' },
];

// Add allergy options
const allergyOptions: PreferenceOption[] = [
  { id: 'dairy', label: 'Dairy', icon: 'cafe-outline' },
  { id: 'gluten', label: 'Gluten', icon: 'pizza-outline' },
  { id: 'peanuts', label: 'Peanuts', icon: 'egg-outline' },
  { id: 'soy', label: 'Soy', icon: 'leaf-outline' },
  { id: 'shellfish', label: 'Shellfish', icon: 'fish-outline' },
  { id: 'eggs', label: 'Eggs', icon: 'sunny-outline' },
  { id: 'treeNuts', label: 'Tree Nuts', icon: 'nutrition-outline' },
  { id: 'otherAllergy', label: 'Other', icon: 'help-circle-outline' },
];

// Budget options
const pricePreferences = [
  { id: 'low', label: '$ Budget Friendly' },
  { id: 'medium', label: '$$ Balanced' },
  { id: 'high', label: '$$$ Premium' },
];

// Tag component for disliked ingredients
interface IngredientTagProps {
  text: string;
  onRemove: () => void;
}

const IngredientTag: React.FC<IngredientTagProps> = ({ text, onRemove }) => (
  <View style={styles.tagContainer}>
    <Text style={styles.tagText}>{text}</Text>
    <TouchableOpacity style={styles.tagRemoveButton} onPress={onRemove}>
      <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  </View>
);

const StylePreferencesStep = ({ onNext, onPrevious, stepIndex, totalSteps }: StylePreferencesStepProps) => {
  const { 
    dietaryPreferences: dietaryPrefs, 
    mealPreferences: mealPrefs, 
    setDietaryPreferences, 
    setMealPreferences 
  } = useOnboardingStore();
  
  // Local state to track selections
  const [selectedDietaryPrefs, setSelectedDietaryPrefs] = useState<string[]>(dietaryPrefs);
  const [selectedMealPrefs, setSelectedMealPrefs] = useState<string[]>(mealPrefs);
  const [customDietNote, setCustomDietNote] = useState<string>('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [otherAllergyNote, setOtherAllergyNote] = useState<string>('');
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [budgetLevel, setBudgetLevel] = useState<string>('medium');
  const [priceLimit, setPriceLimit] = useState<number>(10);

  // Toggle dietary preference selection
  const toggleDietaryPreference = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (selectedDietaryPrefs.includes(id)) {
      setSelectedDietaryPrefs(selectedDietaryPrefs.filter(item => item !== id));
    } else {
      setSelectedDietaryPrefs([...selectedDietaryPrefs, id]);
    }
  };

  // Toggle meal preference selection
  const toggleMealPreference = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (selectedMealPrefs.includes(id)) {
      setSelectedMealPrefs(selectedMealPrefs.filter(item => item !== id));
    } else {
      setSelectedMealPrefs([...selectedMealPrefs, id]);
    }
  };

  // Toggle allergy selection
  const toggleAllergy = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (selectedAllergies.includes(id)) {
      setSelectedAllergies(selectedAllergies.filter(item => item !== id));
    } else {
      setSelectedAllergies([...selectedAllergies, id]);
    }
  };

  // Add disliked ingredient
  const addDislikedIngredient = () => {
    if (newIngredient.trim() !== '' && !dislikedIngredients.includes(newIngredient.trim())) {
      setDislikedIngredients([...dislikedIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  // Remove disliked ingredient
  const removeDislikedIngredient = (ingredient: string) => {
    setDislikedIngredients(dislikedIngredients.filter(item => item !== ingredient));
  };

  // Toggle budget preference
  const selectBudgetPreference = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBudgetLevel(id);
  };

  // Continue to next step
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Save preferences to store
    setDietaryPreferences(selectedDietaryPrefs as DietaryProfile[]);
    setMealPreferences(selectedMealPrefs as any[]);
    
    // Here you would also save the new preferences to your store
    // For example: 
    // setCustomDietNote(customDietNote);
    // setAllergies(selectedAllergies);
    // setOtherAllergyNote(otherAllergyNote);
    // setDislikedIngredients(dislikedIngredients);
    // setBudgetLevel(budgetLevel);
    // setPriceLimit(priceLimit);
    
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackArrow onClick={onPrevious} />
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${((stepIndex + 1) / totalSteps) * 100}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>Your Preferences</Text>
          <Text style={styles.subtitle}>
            Help us personalize your recipe recommendations by selecting your preferences
          </Text>
        </View>
        
        {/* Dietary Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.optionsGrid}>
            {dietaryPreferences.map((preference) => (
              <TouchableOpacity
                key={preference.id}
                style={[
                  styles.optionButton,
                  selectedDietaryPrefs.includes(preference.id) && styles.selectedOption
                ]}
                onPress={() => toggleDietaryPreference(preference.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={preference.icon} 
                  size={28} 
                  color={selectedDietaryPrefs.includes(preference.id) ? colors.white : colors.primary} 
                />
                <Text 
                  style={[
                    styles.optionLabel,
                    selectedDietaryPrefs.includes(preference.id) && styles.selectedOptionLabel
                  ]}
                >
                  {preference.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Diet Note */}
          {selectedDietaryPrefs.includes('customDiet') && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe your custom diet (e.g., 'No red meat, more fiber')"
                placeholderTextColor={colors.textSecondary}
                value={customDietNote}
                onChangeText={setCustomDietNote}
                multiline
                numberOfLines={2}
              />
            </View>
          )}
        </View>
        
        {/* Meal Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Meal Preferences</Text>
          <View style={styles.optionsGrid}>
            {mealPreferences.map((preference) => (
              <TouchableOpacity
                key={preference.id}
                style={[
                  styles.optionButton,
                  selectedMealPrefs.includes(preference.id) && styles.selectedOption
                ]}
                onPress={() => toggleMealPreference(preference.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={preference.icon} 
                  size={28} 
                  color={selectedMealPrefs.includes(preference.id) ? colors.white : colors.primary} 
                />
                <Text 
                  style={[
                    styles.optionLabel,
                    selectedMealPrefs.includes(preference.id) && styles.selectedOptionLabel
                  ]}
                >
                  {preference.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergies Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Allergies & Sensitivities</Text>
          <View style={styles.optionsGrid}>
            {allergyOptions.map((allergy) => (
              <TouchableOpacity
                key={allergy.id}
                style={[
                  styles.optionButton,
                  selectedAllergies.includes(allergy.id) && styles.selectedOption
                ]}
                onPress={() => toggleAllergy(allergy.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={allergy.icon} 
                  size={28} 
                  color={selectedAllergies.includes(allergy.id) ? colors.white : colors.primary} 
                />
                <Text 
                  style={[
                    styles.optionLabel,
                    selectedAllergies.includes(allergy.id) && styles.selectedOptionLabel
                  ]}
                >
                  {allergy.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Other Allergies Note */}
          {selectedAllergies.includes('otherAllergy') && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Specify other allergies..."
                placeholderTextColor={colors.textSecondary}
                value={otherAllergyNote}
                onChangeText={setOtherAllergyNote}
              />
            </View>
          )}
        </View>

        {/* Disliked Ingredients Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Disliked Ingredients</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add ingredient (e.g., olives, onions)"
              placeholderTextColor={colors.textSecondary}
              value={newIngredient}
              onChangeText={setNewIngredient}
              onSubmitEditing={addDislikedIngredient}
              returnKeyType="done"
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addDislikedIngredient}
            >
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {dislikedIngredients.map((ingredient, index) => (
              <IngredientTag
                key={`${ingredient}-${index}`}
                text={ingredient}
                onRemove={() => removeDislikedIngredient(ingredient)}
              />
            ))}
          </View>
        </View>

        {/* Budget Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Budget Preference</Text>
          <View style={styles.budgetContainer}>
            {pricePreferences.map((price) => (
              <TouchableOpacity
                key={price.id}
                style={[
                  styles.budgetOption,
                  budgetLevel === price.id && styles.selectedBudgetOption
                ]}
                onPress={() => selectBudgetPreference(price.id)}
              >
                <Text 
                  style={[
                    styles.budgetOptionLabel,
                    budgetLevel === price.id && styles.selectedBudgetOptionLabel
                  ]}
                >
                  {price.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.priceSliderContainer}>
            <Text style={styles.priceLabel}>Maximum price per meal</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={30}
              step={1}
              value={priceLimit}
              onValueChange={setPriceLimit}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <Text style={styles.priceValue}>${priceLimit.toFixed(2)} per meal</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={onNext}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={['#FFA726', '#FB8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    paddingRight: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '90%',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  optionButton: {
    width: '46%',
    margin: '2%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionLabel: {
    ...typography.subtitle2,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedOptionLabel: {
    color: colors.white,
  },
  textInputContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  addButton: {
    marginLeft: 8,
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    ...typography.body2,
    color: colors.text,
    marginRight: 6,
  },
  tagRemoveButton: {
    padding: 2,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetOption: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  selectedBudgetOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  budgetOptionLabel: {
    ...typography.subtitle2,
    color: colors.text,
    textAlign: 'center',
  },
  selectedBudgetOptionLabel: {
    color: colors.white,
  },
  priceSliderContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  priceLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  priceValue: {
    ...typography.subtitle2,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  continueButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});

export default StylePreferencesStep;
