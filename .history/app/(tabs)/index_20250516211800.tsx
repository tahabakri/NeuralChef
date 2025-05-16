"use client";

import React, { useState, useRef, useEffect } from 'react';
import {  View,  Text,  StyleSheet,  ScrollView,  Image,  TouchableOpacity,  FlatList,  Dimensions,  Platform,  ActivityIndicator,  ImageBackground,  StatusBar,  Alert,  Pressable,  Modal, ListRenderItem } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Sparkles, History, Trash2, ShoppingBasket, Camera, Tag, Filter, X, Save, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, {   useSharedValue,   useAnimatedStyle,   withTiming,   withSequence,  Easing} from 'react-native-reanimated';
import TextArea from '../../components/TextArea';
import Button from '../../components/Button';
import Card from '../../components/Card';
import PopularCombinationCard from '../../components/PopularCombinationCard';
import FilterDropdown from '../../components/FilterDropdown';
import TagFilter from '../../components/TagFilter';
import CategoryTag from '../../components/CategoryTag';
import { popularCombinations, validateIngredient } from '../../constants/ingredients';
import { useRecipeHistoryStore } from '../../stores/recipeHistoryStore';
import { useRecipeStore } from '../../stores/recipeStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { useSavedRecipesStore } from '../../stores/savedRecipesStore';
import { Recipe, generateRecipe, RecipeServiceError, modifyRecipe } from '../../services/recipeService';
import colors from '../../constants/colors';
import { extractTextFromImage } from '../../services/imageService';

interface Tag {
  id: string;
  text: string;
}

interface ListSection {
  type: 'input' | 'popular' | 'history' | 'recent';
  data: any[];
}

// Add this component for displaying active filters
function ActiveFilters({ onEditPress }: { onEditPress: () => void }) {
  const {
    dietaryPreference,
    spiceLevel,
    cookingTimeLimit,
    maxCalories,
    microPreferences,
    allergies
  } = usePreferencesStore();
  
  // Only show if we have active filters beyond defaults
  const hasActiveFilters = 
    dietaryPreference !== 'all' ||
    spiceLevel !== 'medium' ||
    cookingTimeLimit > 0 ||
    maxCalories > 0 ||
    microPreferences.length > 0 ||
    allergies.length > 0;
    
  if (!hasActiveFilters) return null;
  
  return (
    <View style={styles.activeFiltersContainer}>
      <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
      
      <View style={styles.filterTagsContainer}>
        {dietaryPreference !== 'all' && (
          <View style={styles.filterTag}>
            <Text style={styles.filterTagText}>{dietaryPreference}</Text>
          </View>
        )}
        
        {spiceLevel !== 'medium' && (
          <View style={styles.filterTag}>
            <Text style={styles.filterTagText}>{spiceLevel} spice</Text>
          </View>
        )}
        
        {cookingTimeLimit > 0 && (
          <View style={styles.filterTag}>
            <Text style={styles.filterTagText}>≤ {cookingTimeLimit} min</Text>
          </View>
        )}
        
        {maxCalories > 0 && (
          <View style={styles.filterTag}>
            <Text style={styles.filterTagText}>≤ {maxCalories} cal</Text>
          </View>
        )}
        
        {microPreferences.length > 0 && microPreferences.map(pref => (
          <View key={pref} style={styles.filterTag}>
            <Text style={styles.filterTagText}>{pref}</Text>
          </View>
        ))}
        
        {allergies.length > 0 && (
          <View style={[styles.filterTag, styles.allergenTag]}>
            <Text style={styles.filterTagText}>
              {allergies.length} allergen{allergies.length > 1 ? 's' : ''} excluded
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.editFiltersButton} 
          onPress={onEditPress}
        >
          <Text style={styles.editFiltersText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabOneScreen() {
  const params = useLocalSearchParams();
  const [inputText, setInputText] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentIngredients, setRecentIngredients] = useState<string[]>([]);
  const [ocrIngredients, setOcrIngredients] = useState<string[]>([]);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRecipeId, setEditRecipeId] = useState<string | null>(null);
  const [editRecipeData, setEditRecipeData] = useState<Recipe | null>(null);
  const [createNewVariation, setCreateNewVariation] = useState(true);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { history: recipeHistory, clearHistory, addToHistory, getHistoryRecipesByTags } = useRecipeHistoryStore();
  const { setRecipe, setError, clearError } = useRecipeStore();
  const { 
    dietaryPreference, 
    allergies, 
    dislikedIngredients, 
    spiceLevel,
    cuisineTypes,
    cookingTimeLimit,
    setDietaryPreference,
    maxCalories,
    microPreferences
  } = usePreferencesStore();
  const { savedRecipes, getRecipesByTags, saveRecipe, updateRecipe } = useSavedRecipesStore();
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Recipe[]>([]);
  
  // Check for edit mode from params
  useEffect(() => {
    if (params.editMode === 'true' && params.recipeData) {
      try {
        const recipeToEdit = JSON.parse(params.recipeData as string) as Recipe;
        setIsEditMode(true);
        setEditRecipeId(params.recipeId as string);
        setEditRecipeData(recipeToEdit);
        
        // Pre-populate the form with recipe ingredients
        setTags(recipeToEdit.ingredients.map(ingredient => ({
          id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: ingredient
        })));
        
        setInputText(recipeToEdit.ingredients.join(', '));
      } catch (error) {
        console.error('Failed to parse recipe data:', error);
        Alert.alert('Error', 'Failed to load recipe for editing');
      }
    }
  }, [params]);
  
  // Load recent ingredients from AsyncStorage on component mount 
  useEffect(() => {
    const loadRecentIngredients = async () => {
      try {
        // You would typically load these from AsyncStorage
        // This is a placeholder - implement actual storage in recipeHistoryStore
        setRecentIngredients(['Chicken', 'Pasta', 'Tomatoes', 'Basil', 'Garlic']);
      } catch (error) {
        console.error('Failed to load recent ingredients:', error);
      }
    };
        loadRecentIngredients();
  }, []);
  
  // Filter recipes when selectedTags change 
  useEffect(() => {
    if (selectedTags.length === 0) {
      // No filters, show all recipes
      setFilteredRecipes(savedRecipes);
      setFilteredHistory(recipeHistory);
    } else {
      // Apply tag filtering
      setFilteredRecipes(getRecipesByTags(selectedTags));
      setFilteredHistory(getHistoryRecipesByTags(selectedTags));
    }
  }, [selectedTags, savedRecipes, recipeHistory, getRecipesByTags, getHistoryRecipesByTags]);

  const handleAddTag = (tag: Tag) => {
    if (!tags.some(t => t.text.toLowerCase() === tag.text.toLowerCase())) {
      setTags([...tags, tag]);
      
      // Add to recent ingredients if not already there
      if (!recentIngredients.some(i => i.toLowerCase() === tag.text.toLowerCase())) {
        setRecentIngredients([tag.text, ...recentIngredients].slice(0, 10));
        // In a real app, save this to AsyncStorage via the store
      }
    }
  };
  
  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };
  
  const handleCombinationPress = (combination: typeof popularCombinations[0]) => {
    // Add the ingredients from the combination to the input
    // Clear existing tags and create new ones from the combination
    setTags([]);
    
    // Add each ingredient as a tag
    combination.ingredients.forEach(ingredient => {
      handleAddTag({
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: ingredient.charAt(0).toUpperCase() + ingredient.slice(1)
      });
    });
    
    // Update the input text with the ingredients
    setInputText(combination.ingredients.join(', ') + ', ');
  };
  
    const handleGenerateRecipes = async () => {
    if (tags.length === 0) {
      Alert.alert(
        'No Ingredients',
        'Please add at least one ingredient to generate recipes.'
      );
      return;
    }
    
    setIsLoading(true);
    clearError();
    try {
      const ingredientTexts = tags.map(tag => tag.text);
      
      let newRecipe: Recipe;
      
      if (isEditMode && editRecipeData) {
        // Call modifyRecipe instead of generateRecipe when in edit mode
        newRecipe = await modifyRecipe(
          editRecipeData, 
          ingredientTexts, 
          dietaryPreference,
          allergies,
          dislikedIngredients,
          spiceLevel,
          cuisineTypes,
          cookingTimeLimit
        );
      } else {
        // Regular recipe generation with all preferences
        newRecipe = await generateRecipe(
          ingredientTexts, 
          dietaryPreference, 
          allergies,
          dislikedIngredients,
          spiceLevel,
          cuisineTypes,
          cookingTimeLimit
        );
      }
      
      setRecipe(newRecipe);
      
      // If in edit mode, show save options
      if (isEditMode) {
        setShowSaveOptions(true);
      } else {
        router.push('/(tabs)/recipe');
      }
    } catch (error: any) {
      console.error("Failed to generate recipe:", error);
      const recipeError = error as RecipeServiceError;
      setError(
        recipeError.type || 'unknown',
        recipeError.message || 'Could not generate recipe. Please try again.'
      );
      Alert.alert(
        'Generation Failed',
        recipeError.message || 'An unexpected error occurred while generating your recipe. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipeVariation = async () => {
    if (!createNewVariation && editRecipeId && editRecipeId !== 'new') {
      // Update existing recipe
      await updateRecipe(editRecipeId, useRecipeStore.getState().recipe!);
      Alert.alert('Success', 'Recipe updated successfully');
    } else {
      // Save as new recipe/variation
      const recipe = useRecipeStore.getState().recipe;
      if (recipe) {
        // If it's a variation, update the title to indicate that
        if (editRecipeData && editRecipeData.title) {
          recipe.title = `${recipe.title} (Variation)`;
        }
        await saveRecipe(recipe);
        Alert.alert('Success', 'Recipe variation saved');
      }
    }
    
    // Close the modal and navigate to recipe screen
    setShowSaveOptions(false);
    router.push('/(tabs)/recipe');
  };
  
  const handleCancelSaveOptions = () => {
    setShowSaveOptions(false);
    router.push('/(tabs)/recipe');
  };

  const handleRecentRecipePress = (recipe: Recipe) => {
    setRecipe(recipe);
    router.push('/(tabs)/recipe');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your recipe history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };
  
  const handleRecentIngredientPress = (ingredient: string) => {
    // Add the ingredient as a tag if not already present
    if (!tags.some(tag => tag.text.toLowerCase() === ingredient.toLowerCase())) {
      handleAddTag({
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: ingredient
      });
      
      // Update input text
      setInputText(inputText ? `${inputText}, ${ingredient}, ` : `${ingredient}, `);
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Input validation
  const validateTag = (tag: string): boolean | string => {
    return validateIngredient(tag);
  };
  
  // Animation for ingredient chips
  const AnimatedIngredientChip = ({ ingredient }: { ingredient: string }) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }]
      };
    });
    
    const handlePress = () => {
      scale.value = withSequence(
        withTiming(1.1, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      );
      
      handleRecentIngredientPress(ingredient);
    };
    
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={styles.ingredientChip}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text style={styles.ingredientChipText}>{ingredient}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Handle photo upload for ingredient extraction
  const handlePhotoUpload = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required", 
          "You need to grant camera permissions to take photos of ingredients."
        );
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Provide haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        // Extract image URI
        const imageUri = result.assets[0].uri;
        
        // Set loading state
        setIsOcrLoading(true);
        
        try {
          // Extract ingredients from the image
          const extractedIngredients = await extractTextFromImage(imageUri);
          
          if (extractedIngredients.length > 0) {
            // Convert to Tag format and update state
            const newTags = extractedIngredients.map(ingredient => ({
              id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              text: ingredient.charAt(0).toUpperCase() + ingredient.slice(1).toLowerCase()
            }));
            
            // Update tags state
            const uniqueTags = [...tags];
            newTags.forEach(newTag => {
              if (!uniqueTags.some(t => t.text.toLowerCase() === newTag.text.toLowerCase())) {
                uniqueTags.push(newTag);
              }
            });
            
            setTags(uniqueTags);
            setOcrIngredients(extractedIngredients);
            
            // Success feedback
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            Alert.alert(
              "Ingredients Detected", 
              `Found ${extractedIngredients.length} ingredients in your photo! You can add or remove ingredients as needed.`
            );
          } else {
            Alert.alert(
              "No Ingredients Found", 
              "Couldn't identify any ingredients in the photo. Try taking a clearer photo or enter ingredients manually."
            );
          }
        } catch (error) {
          console.error('Error processing image:', error);
          Alert.alert(
            "Processing Failed", 
            "Couldn't process the image. Please try again or enter ingredients manually."
          );
        } finally {
          setIsOcrLoading(false);
        }
      }
    } catch (error) {
      console.error('Error with image picker:', error);
      setIsOcrLoading(false);
      Alert.alert(
        "Error", 
        "There was a problem accessing your camera. Please try again."
      );
    }
  };

    const handleToggleTagFilter = () => {    setShowTagFilter(!showTagFilter);  };    const handleTagsChange = (tags: string[]) => {    setSelectedTags(tags);  };

  const renderListItem: ListRenderItem<ListSection> = ({ item }) => {
    switch (item.type) {
      case 'input':
        return (
          <View style={styles.inputSection}>
            <TextArea
              value={inputText}
              onChangeText={setInputText}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              tags={tags}
              placeholder="Type ingredients separated by commas..."
              style={styles.textArea}
              validateTag={validateTag}
            />
            
            <ActiveFilters onEditPress={() => router.push('/preferences')} />
            <FilterDropdown
              type="dietary"
              selectedDietaryValue={dietaryPreference}
              onDietaryChange={setDietaryPreference}
              label="Dietary Filter"
            />
            
            <Button
              title={isEditMode ? "Generate Variation" : "Generate Recipe"}
              onPress={handleGenerateRecipes}
              loading={isLoading}
              disabled={tags.length === 0}
              fullWidth
              icon={<Sparkles size={18} color="white" style={{ marginRight: 8 }} />}
              style={styles.generateButton}
            />
          </View>
        );
      
      case 'popular':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Combinations</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={popularCombinations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PopularCombinationCard
                  combination={item}
                  onPress={() => handleCombinationPress(item)}
                />
              )}
              style={styles.horizontalList}
            />
          </View>
        );
      
      case 'history':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recipe History</Text>
              {filteredHistory.length > 0 && (
                <TouchableOpacity onPress={handleClearHistory}>
                  <Trash2 size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            {filteredHistory.length > 0 ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={filteredHistory}
                keyExtractor={(item) => item.id || item.title}
                renderItem={({ item }) => (
                  <Card
                    title={item.title}
                    description={item.description}
                    imageUrl={item.heroImage}
                    onPress={() => handleRecentRecipePress(item)}
                  />
                )}
                style={styles.horizontalList}
              />
            ) : (
              <Text style={styles.emptyText}>No recipe history yet</Text>
            )}
          </View>
        );
      
      case 'recent':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Ingredients</Text>
            <View style={styles.recentIngredientsContainer}>
              {recentIngredients.map((ingredient, index) => (
                <TouchableOpacity
                  key={`${ingredient}-${index}`}
                  style={styles.recentIngredient}
                  onPress={() => handleRecentIngredientPress(ingredient)}
                >
                  <Text style={styles.recentIngredientText}>{ingredient}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  const sections: ListSection[] = [
    { type: 'input', data: [] },
    { type: 'popular', data: popularCombinations },
    { type: 'history', data: filteredHistory },
    { type: 'recent', data: recentIngredients },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={styles.gradientBackground}
      />
      
      <FlatList
        data={sections}
        renderItem={renderListItem}
        keyExtractor={(item) => item.type}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Save Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSaveOptions}
        onRequestClose={() => setShowSaveOptions(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Recipe</Text>
              <TouchableOpacity onPress={() => setShowSaveOptions(false)}>
                <X size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalText}>
              How would you like to save this recipe?
            </Text>
            
            <TouchableOpacity
              style={[styles.modalButton, createNewVariation && styles.modalButtonSelected]}
              onPress={() => setCreateNewVariation(true)}
            >
              <Text style={styles.modalButtonText}>Create New Variation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, !createNewVariation && styles.modalButtonSelected]}
              onPress={() => setCreateNewVariation(false)}
            >
              <Text style={styles.modalButtonText}>Update Existing Recipe</Text>
            </TouchableOpacity>
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={handleCancelSaveOptions}
                variant="outline"
                style={styles.modalActionButton}
              />
              <Button
                title="Save"
                onPress={handleSaveRecipeVariation}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Tag Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTagFilter}
        onRequestClose={() => setShowTagFilter(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Tags</Text>
              <TouchableOpacity onPress={() => setShowTagFilter(false)}>
                <X size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <TagFilter
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

const styles = StyleSheet.create({  container: {    flex: 1,    position: 'relative',  },  modalContainer: {    flex: 1,    justifyContent: 'center',    alignItems: 'center',    backgroundColor: 'rgba(0, 0, 0, 0.5)',  },  modalContent: {    width: '90%',    backgroundColor: 'white',    borderRadius: 15,    padding: 20,    shadowColor: '#000',    shadowOffset: {      width: 0,      height: 2,    },    shadowOpacity: 0.25,    shadowRadius: 3.84,    elevation: 5,  },  modalHeader: {    flexDirection: 'row',    justifyContent: 'space-between',    alignItems: 'center',    marginBottom: 20,  },  modalTitle: {    fontSize: 18,    fontWeight: '600',    color: colors.text,  },  modalText: {    fontSize: 16,    color: colors.text,    marginBottom: 20,  },  modalButton: {    flexDirection: 'row',    alignItems: 'center',    marginBottom: 15,    padding: 15,    borderWidth: 1,    borderColor: colors.border,    borderRadius: 10,  },  modalButtonSelected: {    borderColor: colors.primary,    backgroundColor: colors.primaryLight,  },  modalButtonText: {    fontSize: 16,    fontWeight: '600',    color: colors.text,  },  modalActions: {    flexDirection: 'row',    justifyContent: 'space-between',    marginTop: 20,  },  modalActionButton: {    flex: 1,    marginLeft: 10,  },  gradientBackground: {    position: 'absolute',    left: 0,    right: 0,    top: 0,    bottom: 0,  },  filterButtonContainer: {    paddingHorizontal: 20,    marginBottom: 20,  },  filterButton: {    flexDirection: 'row',    alignItems: 'center',    backgroundColor: '#F5F5F5',    paddingHorizontal: 16,    paddingVertical: 10,    borderRadius: 12,    alignSelf: 'flex-start',  },  filterButtonText: {    marginLeft: 8,    color: '#666',    fontWeight: '500',  },  activeFilterText: {    color: colors.primary,    fontWeight: '600',  },  selectedTagsContainer: {    flexDirection: 'row',    alignItems: 'center',    marginTop: 10,  },  clearFiltersButton: {    paddingHorizontal: 10,    paddingVertical: 6,    backgroundColor: 'rgba(255, 59, 48, 0.1)',    borderRadius: 12,    marginLeft: 8,  },  clearFiltersText: {    color: '#FF3B30',    fontSize: 12,    fontWeight: '500',  },  emptyFilterResults: {    padding: 20,    alignItems: 'center',    justifyContent: 'center',  },  emptyFilterText: {    color: '#8E8E93',    fontSize: 14,    fontStyle: 'italic',  },  tagsList: {    flexDirection: 'row',    marginBottom: 4,  },  recipeTag: {    color: '#34C759',    fontSize: 12,    marginRight: 4,  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 22,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  textArea: {
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  popularSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#34C759',
    marginRight: 4,
  },
  combinationsContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recentItems: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  emptyStateText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 12,
  },
  emptyStateButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentRecipesSection: {
    marginBottom: 30,
  },
  recentRecipesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleIcon: {
    marginRight: 8,
  },
  recentRecipeCard: {
    marginRight: 12,
    width: cardWidth * 0.8,
    padding: 0,
    borderRadius: 12,
  },
  recentRecipeImage: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
  },
  recentRecipeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  recentRecipeTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  viewRecipeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  clearHistoryText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '500',
  },
  ingredientChip: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#34C759',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientChipText: {
    color: '#34C759',
    fontWeight: '500',
    fontSize: 14,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  photoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  photoIcon: {
    marginRight: 8,
  },
  photoButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  applyButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  recentIngredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  recentIngredient: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#34C759',
    borderRadius: 16,
    margin: 4,
  },
  recentIngredientText: {
    color: '#34C759',
    fontWeight: '500',
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  activeFiltersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  filterTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterTag: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  allergenTag: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  filterTagText: {
    fontSize: 13,
    color: colors.text,
  },
  editFiltersButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  editFiltersText: {
    fontSize: 13,
    color: 'white',
  },
});
