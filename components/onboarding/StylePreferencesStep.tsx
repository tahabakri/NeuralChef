import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { useOnboardingStore, DietaryPreference, MealPreference } from '@/stores/onboardingStore';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '@/constants/typography';
import BackArrow from '@/components/BackArrow';

interface StylePreferencesStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void; // Added onSkip
  isLastStep?: boolean; // Added isLastStep
  stepIndex: number;
  totalSteps: number;
}

interface PreferenceOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const { width } = Dimensions.get('window');

// Define options
const dietaryPreferences: PreferenceOption[] = [
  { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
  { id: 'vegan', label: 'Vegan', icon: 'nutrition' },
  { id: 'glutenFree', label: 'Gluten Free', icon: 'ban-outline' }, // Changed icon
  { id: 'dairyFree', label: 'Dairy Free', icon: 'water' },
  { id: 'keto', label: 'Keto', icon: 'flame' },
  { id: 'lowCarb', label: 'Low Carb', icon: 'barbell' },
  { id: 'paleo', label: 'Paleo', icon: 'fish' },
  { id: 'lowFat', label: 'Low Fat', icon: 'heart' },
];

const mealPreferences: PreferenceOption[] = [
  { id: 'quickMeals', label: 'Quick Meals (<30 min)', icon: 'timer' },
  { id: 'familyFriendly', label: 'Family Friendly', icon: 'people' },
  { id: 'budgetFriendly', label: 'Budget Friendly', icon: 'wallet' },
  { id: 'singleServing', label: 'Single Serving', icon: 'person' },
];

const StylePreferencesStep = ({ onNext, onPrevious, stepIndex, totalSteps }: StylePreferencesStepProps) => {
  const { dietaryPreferences: dietaryPrefs, mealPreferences: mealPrefs, setDietaryPreferences, setMealPreferences } = useOnboardingStore();
  
  // Local state to track selections
  const [selectedDietaryPrefs, setSelectedDietaryPrefs] = useState<string[]>(dietaryPrefs);
  const [selectedMealPrefs, setSelectedMealPrefs] = useState<string[]>(mealPrefs);

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

  // Continue to next step
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Save preferences to store
    setDietaryPreferences(selectedDietaryPrefs as DietaryPreference[]);
    setMealPreferences(selectedMealPrefs as MealPreference[]);
    
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
            Help us personalize your recipe recommendations by selecting your dietary preferences
          </Text>
        </View>
        
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
        </View>
        
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
