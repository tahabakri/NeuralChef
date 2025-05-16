import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertCircle,
  Ban,
  Clock,
  Globe,
  Flame,
  Utensils,
  X,
  Save,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import Toast from 'react-native-toast-message';

import Button from '@/components/Button';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { usePreferencesStore, DietaryPreference, SpiceLevel } from '@/stores/preferencesStore';

// Common cuisine types
const COMMON_CUISINES = [
  'Italian',
  'Chinese',
  'Mexican',
  'Indian',
  'Japanese',
  'Thai',
  'French',
  'Mediterranean',
  'American',
  'Korean',
  'Middle Eastern',
  'Greek',
  'Vietnamese',
  'Spanish',
];

// Common food allergies
const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Wheat',
  'Soy',
  'Sesame',
];

// Dietary preference options
const DIETARY_PREFERENCES = [
  { value: 'all', label: 'No Restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'low-carb', label: 'Low-Carb' },
];

// Spice level options
const SPICE_LEVELS = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'extra-spicy', label: 'Extra Spicy' },
];

interface CollapsibleSectionProps {
  title: string;
  icon: JSX.Element;
  children: React.ReactNode;
  initialExpanded?: boolean;
}

// Collapsible section component
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  initialExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const animatedHeight = useSharedValue(initialExpanded ? 1 : 0);

  const toggleExpanded = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpanded(!expanded);
    animatedHeight.value = withTiming(expanded ? 0 : 1, { duration: 300 });
  };

  const contentStyle = useAnimatedStyle(() => {
    return {
      maxHeight: interpolate(animatedHeight.value, [0, 1], [0, 1000]),
      opacity: animatedHeight.value,
      overflow: 'hidden',
    };
  });

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.sectionHeader}
        onPress={toggleExpanded}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
      >
        <View style={styles.sectionTitleContainer}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {expanded ? (
          <ChevronUp color={colors.text} size={20} />
        ) : (
          <ChevronDown color={colors.text} size={20} />
        )}
      </Pressable>
      <Animated.View style={contentStyle}>
        <View style={styles.sectionContent}>{children}</View>
      </Animated.View>
    </View>
  );
};

// Tag component for selected items (cuisines, allergies, etc.)
const Tag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
    <TouchableOpacity style={styles.tagRemove} onPress={onRemove}>
      <X size={14} color={colors.textLight} />
    </TouchableOpacity>
  </View>
);

// Main component
export default function SettingsScreen() {
  // Get preferences from store
  const {
    dietaryPreference,
    allergies,
    dislikedIngredients,
    spiceLevel,
    cuisineTypes,
    cookingTimeLimit,
    setDietaryPreference,
    setAllergies,
    setDislikedIngredients,
    setSpiceLevel,
    setCuisineTypes,
    setCookingTimeLimit,
    resetPreferences,
  } = usePreferencesStore();

  // Local state for form
  const [newAllergy, setNewAllergy] = useState('');
  const [newDislikedIngredient, setNewDislikedIngredient] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [localTimeLimit, setLocalTimeLimit] = useState(cookingTimeLimit.toString());
  const [isModified, setIsModified] = useState(false);

  // Check if any changes were made
  useEffect(() => {
    setIsModified(true);
  }, [
    dietaryPreference,
    allergies,
    dislikedIngredients,
    spiceLevel,
    cuisineTypes,
    localTimeLimit,
  ]);

  // Helper to add a new allergy
  const addAllergy = () => {
    if (newAllergy.trim() !== '' && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Helper to remove an allergy
  const removeAllergy = (item: string) => {
    setAllergies(allergies.filter((allergy) => allergy !== item));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Helper to add a common allergy
  const addCommonAllergy = (item: string) => {
    if (!allergies.includes(item)) {
      setAllergies([...allergies, item]);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Helper to add a disliked ingredient
  const addDislikedIngredient = () => {
    if (newDislikedIngredient.trim() !== '' && !dislikedIngredients.includes(newDislikedIngredient.trim())) {
      setDislikedIngredients([...dislikedIngredients, newDislikedIngredient.trim()]);
      setNewDislikedIngredient('');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Helper to remove a disliked ingredient
  const removeDislikedIngredient = (item: string) => {
    setDislikedIngredients(dislikedIngredients.filter((ingredient) => ingredient !== item));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Helper to add a cuisine
  const addCuisine = () => {
    if (newCuisine.trim() !== '' && !cuisineTypes.includes(newCuisine.trim())) {
      setCuisineTypes([...cuisineTypes, newCuisine.trim()]);
      setNewCuisine('');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Helper to add a common cuisine
  const addCommonCuisine = (item: string) => {
    if (!cuisineTypes.includes(item)) {
      setCuisineTypes([...cuisineTypes, item]);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Helper to remove a cuisine
  const removeCuisine = (item: string) => {
    setCuisineTypes(cuisineTypes.filter((cuisine) => cuisine !== item));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Helper to save cooking time limit
  const saveCookingTimeLimit = () => {
    const timeLimit = parseInt(localTimeLimit, 10) || 0;
    setCookingTimeLimit(timeLimit);
  };

  // Reset all preferences
  const handleResetPreferences = async () => {
    await resetPreferences();
    setLocalTimeLimit('0');
    setNewAllergy('');
    setNewDislikedIngredient('');
    setNewCuisine('');
    setIsModified(false);
    
    Toast.show({
      type: 'success',
      text1: 'Preferences Reset',
      text2: 'All preferences have been reset to defaults.',
      position: 'bottom',
    });
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <SettingsIcon size={24} color={colors.text} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Preferences</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <CollapsibleSection 
          title="Dietary Preferences" 
          icon={<Utensils size={20} color={colors.primary} style={styles.sectionIcon} />}
          initialExpanded={true}
        >
          <View style={styles.optionsContainer}>
            {DIETARY_PREFERENCES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  dietaryPreference === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => setDietaryPreference(option.value as DietaryPreference)}
              >
                <Text
                  style={[
                    styles.optionText,
                    dietaryPreference === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </CollapsibleSection>
        
        <CollapsibleSection 
          title="Allergies" 
          icon={<AlertCircle size={20} color={colors.error} style={styles.sectionIcon} />}
        >
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter an allergy..."
                value={newAllergy}
                onChangeText={setNewAllergy}
                returnKeyType="done"
                onSubmitEditing={addAllergy}
              />
              <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionSubtitle}>Common Allergies</Text>
            <View style={styles.suggestionsContainer}>
              {COMMON_ALLERGIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.suggestionChip,
                    allergies.includes(item) && styles.suggestionChipSelected,
                  ]}
                  onPress={() => addCommonAllergy(item)}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      allergies.includes(item) && styles.suggestionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {allergies.length > 0 && (
              <View style={styles.selectedItemsContainer}>
                <Text style={styles.selectedItemsTitle}>Your Allergies</Text>
                <View style={styles.tagsContainer}>
                  {allergies.map((item) => (
                    <Tag key={item} label={item} onRemove={() => removeAllergy(item)} />
                  ))}
                </View>
              </View>
            )}
          </View>
        </CollapsibleSection>
        
        <CollapsibleSection 
          title="Disliked Ingredients" 
          icon={<Ban size={20} color={colors.secondary} style={styles.sectionIcon} />}
        >
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter an ingredient..."
                value={newDislikedIngredient}
                onChangeText={setNewDislikedIngredient}
                returnKeyType="done"
                onSubmitEditing={addDislikedIngredient}
              />
              <TouchableOpacity style={styles.addButton} onPress={addDislikedIngredient}>
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {dislikedIngredients.length > 0 && (
              <View style={styles.selectedItemsContainer}>
                <Text style={styles.selectedItemsTitle}>Your Disliked Ingredients</Text>
                <View style={styles.tagsContainer}>
                  {dislikedIngredients.map((item) => (
                    <Tag key={item} label={item} onRemove={() => removeDislikedIngredient(item)} />
                  ))}
                </View>
              </View>
            )}
          </View>
        </CollapsibleSection>
        
        <CollapsibleSection 
          title="Spice Level" 
          icon={<Flame size={20} color={colors.accentOrange} style={styles.sectionIcon} />}
        >
          <View style={styles.spiceLevelContainer}>
            {SPICE_LEVELS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.spiceLevelButton,
                  spiceLevel === option.value && styles.spiceLevelButtonSelected,
                ]}
                onPress={() => setSpiceLevel(option.value as SpiceLevel)}
              >
                <Text
                  style={[
                    styles.spiceLevelText,
                    spiceLevel === option.value && styles.spiceLevelTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {option.value === 'mild' && <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />}
                {option.value === 'medium' && (
                  <>
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                  </>
                )}
                {option.value === 'spicy' && (
                  <>
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                  </>
                )}
                {option.value === 'extra-spicy' && (
                  <>
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                    <Flame size={16} color={spiceLevel === option.value ? '#fff' : colors.textLight} />
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </CollapsibleSection>
        
        <CollapsibleSection 
          title="Cuisine Types" 
          icon={<Globe size={20} color={colors.accentBlue} style={styles.sectionIcon} />}
        >
          <View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter a cuisine type..."
                value={newCuisine}
                onChangeText={setNewCuisine}
                returnKeyType="done"
                onSubmitEditing={addCuisine}
              />
              <TouchableOpacity style={styles.addButton} onPress={addCuisine}>
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionSubtitle}>Popular Cuisines</Text>
            <View style={styles.suggestionsContainer}>
              {COMMON_CUISINES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.suggestionChip,
                    cuisineTypes.includes(item) && styles.suggestionChipSelected,
                  ]}
                  onPress={() => addCommonCuisine(item)}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      cuisineTypes.includes(item) && styles.suggestionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {cuisineTypes.length > 0 && (
              <View style={styles.selectedItemsContainer}>
                <Text style={styles.selectedItemsTitle}>Your Preferred Cuisines</Text>
                <View style={styles.tagsContainer}>
                  {cuisineTypes.map((item) => (
                    <Tag key={item} label={item} onRemove={() => removeCuisine(item)} />
                  ))}
                </View>
              </View>
            )}
          </View>
        </CollapsibleSection>
        
        <CollapsibleSection 
          title="Cooking Time Limit" 
          icon={<Clock size={20} color={colors.accentYellow} style={styles.sectionIcon} />}
        >
          <View>
            <Text style={styles.timeLimitDescription}>
              Maximum cooking time in minutes (0 = no limit)
            </Text>
            
            <View style={styles.timeLimitContainer}>
              <TextInput
                style={styles.timeLimitInput}
                value={localTimeLimit}
                onChangeText={setLocalTimeLimit}
                keyboardType="number-pad"
                returnKeyType="done"
                onBlur={saveCookingTimeLimit}
              />
              <Text style={styles.timeLimitUnit}>minutes</Text>
            </View>
            
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={120}
              step={5}
              value={parseInt(localTimeLimit, 10) || 0}
              onValueChange={(value) => setLocalTimeLimit(String(value))}
              onSlidingComplete={saveCookingTimeLimit}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>No limit</Text>
              <Text style={styles.sliderLabel}>30 min</Text>
              <Text style={styles.sliderLabel}>60 min</Text>
              <Text style={styles.sliderLabel}>90 min</Text>
              <Text style={styles.sliderLabel}>120 min</Text>
            </View>
          </View>
        </CollapsibleSection>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Reset All Preferences"
            onPress={handleResetPreferences}
            style={styles.resetButton}
            variant="outline"
          />
        </View>
      </ScrollView>
      
      <Toast position="bottom" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    ...typography.title2,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    ...typography.subtitle1,
    color: colors.text,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    color: colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  suggestionText: {
    color: colors.text,
    fontSize: 14,
  },
  suggestionTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  selectedItemsContainer: {
    marginTop: 16,
  },
  selectedItemsTitle: {
    ...typography.subtitle2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: colors.text,
    marginRight: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  tagRemove: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spiceLevelContainer: {
    marginTop: 8,
  },
  spiceLevelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spiceLevelButtonSelected: {
    backgroundColor: colors.accentOrange,
    borderColor: colors.accentOrange,
  },
  spiceLevelText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  spiceLevelTextSelected: {
    color: '#fff',
  },
  timeLimitDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  timeLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLimitInput: {
    width: 80,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    color: colors.text,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  timeLimitUnit: {
    marginLeft: 12,
    color: colors.textSecondary,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  buttonsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  resetButton: {
    marginTop: 8,
  },
}); 