import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  TextStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Slider from '@react-native-community/slider'; // Corrected import
import { Plus, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import Button from '@/components/Button';
import TagSelector from '@/components/TagSelector';
import TagInput from '@/components/TagInput';
import {
  usePreferencesStore,
  DietaryPreference,
  getDietaryPreferences,
  getCommonAllergies,
  getPopularCuisines,
  SpiceLevel,
} from '@/stores/preferencesStore';
import BackArrow from '@/components/BackArrow';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const commonAllergies = getCommonAllergies();
const cuisineTypes = getPopularCuisines();
const allDietaryPreferences = getDietaryPreferences();

const spiceLevels: SpiceLevel[] = ['Mild', 'Medium', 'Spicy', 'Extra Spicy'];
const timeOptions = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 0, label: 'No limit' },
];

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  initialOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity onPress={toggleOpen} style={styles.accordionTrigger}>
        <View style={styles.accordionTitleContainer}>
          {icon && <Text style={styles.accordionIcon}>{icon}</Text>}
          <Text style={styles.accordionTitle}>{title}</Text>
        </View>
        {isOpen ? <ChevronUp size={20} color={colors.textSecondary} /> : <ChevronDown size={20} color={colors.textSecondary} />}
      </TouchableOpacity>
      {isOpen && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

export default function PreferencesPage() {
  const router = useRouter();
  const store = usePreferencesStore();

  const [currentDietaryPreferences, setCurrentDietaryPreferences] = useState<DietaryPreference[]>(store.dietaryPreferences);
  const [currentAllergies, setCurrentAllergies] = useState<string[]>(store.allergies);
  const [newAllergy, setNewAllergy] = useState('');
  const [currentDislikedIngredients, setCurrentDislikedIngredients] = useState<string[]>(store.dislikedIngredients);
  const [newDislikedIngredient, setNewDislikedIngredient] = useState('');
  const [currentSpiceLevel, setCurrentSpiceLevel] = useState<SpiceLevel>(store.spiceLevel);
  const [currentSelectedCuisines, setCurrentSelectedCuisines] = useState<string[]>(store.cuisineTypes);
  const [newCuisine, setNewCuisine] = useState('');
  const [currentCookingTimeLimit, setCurrentCookingTimeLimit] = useState<number>(store.cookingTimeLimit);

  useEffect(() => {
    setCurrentDietaryPreferences(store.dietaryPreferences);
    setCurrentAllergies(store.allergies);
    setCurrentDislikedIngredients(store.dislikedIngredients);
    setCurrentSpiceLevel(store.spiceLevel);
    setCurrentSelectedCuisines(store.cuisineTypes);
    setCurrentCookingTimeLimit(store.cookingTimeLimit);
  }, [
    store.dietaryPreferences,
    store.allergies,
    store.dislikedIngredients,
    store.spiceLevel,
    store.cuisineTypes,
    store.cookingTimeLimit,
  ]);

  const handleDietaryPreferenceToggle = (preference: DietaryPreference) => {
    setCurrentDietaryPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !currentAllergies.includes(newAllergy.trim())) {
      setCurrentAllergies([...currentAllergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (allergyToRemove: string) => {
    setCurrentAllergies(currentAllergies.filter((a) => a !== allergyToRemove));
  };

  const handleAddDislikedIngredient = () => {
    if (newDislikedIngredient.trim() && !currentDislikedIngredients.includes(newDislikedIngredient.trim())) {
      setCurrentDislikedIngredients([...currentDislikedIngredients, newDislikedIngredient.trim()]);
      setNewDislikedIngredient('');
    }
  };

  const handleRemoveDislikedIngredient = (ingredientToRemove: string) => {
    setCurrentDislikedIngredients(currentDislikedIngredients.filter((i) => i !== ingredientToRemove));
  };

  const handleSpiceLevelSelect = (level: SpiceLevel) => {
    setCurrentSpiceLevel(level);
  };

  const handleCuisineToggle = (cuisine: string) => {
    setCurrentSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleAddCuisine = () => {
    if (newCuisine.trim() && !currentSelectedCuisines.includes(newCuisine.trim()) && !cuisineTypes.includes(newCuisine.trim())) {
      setCurrentSelectedCuisines([...currentSelectedCuisines, newCuisine.trim()]);
      setNewCuisine('');
    }
  };

  const handleSavePreferences = () => {
    store.setDietaryPreferences(currentDietaryPreferences);
    store.setAllergies(currentAllergies);
    store.setDislikedIngredients(currentDislikedIngredients);
    store.setSpiceLevel(currentSpiceLevel);
    store.setCuisineTypes(currentSelectedCuisines);
    store.setCookingTimeLimit(currentCookingTimeLimit);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const handleResetPreferences = () => {
    store.resetPreferences();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerTitle: 'Preferences',
          headerLeft: () => <BackArrow />,
          headerTitleStyle: { // Hardcoded for debugging
            fontFamily: 'OpenSans-SemiBold',
            fontSize: 24,
            fontWeight: '600',
            color: colors.text,
          } as StyleProp<Pick<TextStyle, "fontSize" | "fontFamily" | "fontWeight"> & { color?: string }>,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
        <CollapsibleSection title="Dietary Preferences" icon="🥗" initialOpen>
          <TagSelector
            categories={allDietaryPreferences}
            selectedCategories={currentDietaryPreferences}
            onSelectCategory={(category) => handleDietaryPreferenceToggle(category as DietaryPreference)}
            allowMultiple={true}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Allergies" icon="⚠️">
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter an allergy..."
              value={newAllergy}
              onChangeText={setNewAllergy}
              onSubmitEditing={handleAddAllergy}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddAllergy}>
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>Common Allergies</Text>
          <TagSelector
            categories={commonAllergies}
            selectedCategories={currentAllergies}
            onSelectCategory={(allergy) => {
              if (currentAllergies.includes(allergy)) {
                handleRemoveAllergy(allergy);
              } else {
                setCurrentAllergies([...currentAllergies, allergy]);
              }
            }}
            allowMultiple={true}
          />
          {currentAllergies.length > 0 && (
            <View style={styles.marginTop}>
              <Text style={styles.helperText}>Your Allergies</Text>
              <TagInput
                tags={currentAllergies}
                onTagsChange={setCurrentAllergies}
                placeholder="Your added allergies"
                label=""
                value={currentAllergies.join(', ')}
                onChangeText={() => {}}
              />
            </View>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Disliked Ingredients" icon="👎">
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter an ingredient..."
              value={newDislikedIngredient}
              onChangeText={setNewDislikedIngredient}
              onSubmitEditing={handleAddDislikedIngredient}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddDislikedIngredient}>
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          {currentDislikedIngredients.length > 0 && (
            <TagInput
              tags={currentDislikedIngredients}
              onTagsChange={setCurrentDislikedIngredients}
              placeholder="Your disliked ingredients"
              label=""
              value={currentDislikedIngredients.join(', ')}
              onChangeText={() => {}}
            />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Spice Level" icon="🔥">
          <View style={styles.spiceLevelContainer}>
            {spiceLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.spiceOption,
                  currentSpiceLevel === level && styles.spiceOptionSelected,
                  currentSpiceLevel === level && level === 'Medium' && styles.spiceMediumSelected,
                  currentSpiceLevel === level && (level === 'Spicy' || level === 'Extra Spicy') && styles.spiceHotSelected,
                ]}
                onPress={() => handleSpiceLevelSelect(level)}
              >
                <Text style={[styles.spiceText, currentSpiceLevel === level && styles.spiceTextSelected]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </CollapsibleSection>

        <CollapsibleSection title="Cuisine Types" icon="🌎">
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter a cuisine type..."
              value={newCuisine}
              onChangeText={setNewCuisine}
              onSubmitEditing={handleAddCuisine}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCuisine}>
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>Popular Cuisines</Text>
          <TagSelector
            categories={cuisineTypes}
            selectedCategories={currentSelectedCuisines}
            onSelectCategory={handleCuisineToggle}
            allowMultiple={true}
          />
          {currentSelectedCuisines.filter(c => !cuisineTypes.includes(c)).length > 0 && (
            <View style={styles.marginTop}>
                <Text style={styles.helperText}>Your Added Cuisines</Text>
                <TagInput
                    tags={currentSelectedCuisines.filter(c => !cuisineTypes.includes(c))}
                    onTagsChange={(updatedUserCuisines) => {
                        const popularSelected = currentSelectedCuisines.filter(c => cuisineTypes.includes(c));
                        setCurrentSelectedCuisines([...popularSelected, ...updatedUserCuisines]);
                    }}
                    placeholder="Your added cuisines"
                    label=""
                    value={currentSelectedCuisines.filter(c => !cuisineTypes.includes(c)).join(', ')}
                    onChangeText={() => {}}
                />
            </View>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Cooking Time Limit" icon="⏰">
          <Text style={styles.helperText}>Maximum cooking time in minutes (0 = no limit)</Text>
          <View style={styles.inputRow}>
            <View style={styles.timeDisplayBox}>
              <Text style={styles.timeDisplayText}>{currentCookingTimeLimit === 0 ? 'Any' : currentCookingTimeLimit}</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.timeInput]}
              keyboardType="number-pad"
              value={currentCookingTimeLimit === 0 ? '' : String(currentCookingTimeLimit)}
              onChangeText={(text) => {
                const value = parseInt(text);
                if (!isNaN(value) && value >= 0) {
                  setCurrentCookingTimeLimit(value);
                } else if (text === '') {
                  setCurrentCookingTimeLimit(0);
                }
              }}
              placeholder="minutes"
            />
          </View>
          <View style={styles.timeOptionsContainer}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeOptionButton,
                  option.value === currentCookingTimeLimit && styles.timeOptionButtonSelected,
                ]}
                onPress={() => setCurrentCookingTimeLimit(option.value)}
              >
                <Text style={[
                  styles.timeOptionText,
                  option.value === currentCookingTimeLimit && styles.timeOptionTextSelected,
                ]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Slider
            style={styles.slider}
            value={currentCookingTimeLimit}
            minimumValue={0}
            maximumValue={120}
            step={5}
            onValueChange={(value: number) => setCurrentCookingTimeLimit(value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </CollapsibleSection>

        <Button
          title="Save Preferences"
          onPress={handleSavePreferences}
          style={styles.saveButton}
        />
        <Button
          title="Reset All Preferences"
          onPress={handleResetPreferences}
          variant="outline"
          style={styles.resetButton}
        />
      </ScrollView>
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
  },
  scrollContentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  collapsibleSection: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  accordionTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  accordionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionIcon: {
    fontSize: typography.h5?.fontSize || 18, // Fallback
    marginRight: spacing.sm,
  },
  accordionTitle: {
    fontFamily: typography.h5?.fontFamily || 'OpenSans-SemiBold', // Fallback
    fontSize: typography.h5?.fontSize || 18, // Fallback
    fontWeight: typography.h5?.fontWeight || '600', // Fallback
    lineHeight: typography.h5?.lineHeight || 24, // Fallback
    color: colors.text,
  },
  accordionContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.body?.fontFamily || 'OpenSans-Regular', // Fallback
    fontSize: typography.body?.fontSize || 16, // Fallback
    fontWeight: typography.body?.fontWeight || '400', // Fallback
    lineHeight: typography.body?.lineHeight || 24, // Fallback
    color: colors.text,
    backgroundColor: colors.cardAlt,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    width: 44,
  },
  helperText: {
    fontFamily: typography.caption?.fontFamily || 'OpenSans-Regular', // Fallback
    fontSize: typography.caption?.fontSize || 12, // Fallback
    fontWeight: typography.caption?.fontWeight || '400', // Fallback
    lineHeight: typography.caption?.lineHeight || 18, // Fallback
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  marginTop: {
    marginTop: spacing.md,
  },
  spiceLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spiceOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.cardAlt,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '48%',
    alignItems: 'center',
  },
  spiceOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  spiceMediumSelected: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  spiceHotSelected: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  spiceText: {
    fontFamily: typography.body?.fontFamily || 'OpenSans-Regular', // Fallback
    fontSize: typography.body?.fontSize || 16, // Fallback
    fontWeight: typography.body?.fontWeight || '400', // Fallback
    lineHeight: typography.body?.lineHeight || 24, // Fallback
    color: colors.text,
  },
  spiceTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  timeDisplayBox: {
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  timeDisplayText: {
    fontFamily: typography.body?.fontFamily || 'OpenSans-Regular', // Fallback
    fontSize: typography.body?.fontSize || 16, // Fallback
    fontWeight: typography.body?.fontWeight || 'bold', // Fallback for bold
    lineHeight: typography.body?.lineHeight || 24, // Fallback
    color: colors.text,
  },
  timeInput: {
    maxWidth: 100,
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: spacing.md,
  },
  timeOptionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.pill,
    backgroundColor: colors.cardAlt,
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeOptionButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  timeOptionText: {
    fontFamily: typography.caption?.fontFamily || 'OpenSans-Regular', // Fallback
    fontSize: typography.caption?.fontSize || 12, // Fallback
    fontWeight: typography.caption?.fontWeight || '400', // Fallback
    lineHeight: typography.caption?.lineHeight || 18, // Fallback
    color: colors.textSecondary,
  },
  timeOptionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
  resetButton: {
    marginTop: spacing.md,
  },
});
