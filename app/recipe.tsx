import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as Speech from 'expo-speech';
import RecipeHeader from '@/components/RecipeHeader';
import CategoryTag from '@/components/CategoryTag';
import IngredientList from '@/components/IngredientList';
import StepList from '@/components/StepList';
import StepCheckbox from '@/components/StepCheckbox';
import TimerButton from '@/components/TimerButton';
import Timer from '@/components/Timer';
import RecipeCarousel from '@/components/RecipeCarousel';
import StarRating from '@/components/StarRating';
import SaveButton from '@/components/SaveButton';
import ShareModal from '@/components/ShareModal';
import EditIngredients from '@/components/EditIngredients';
import BackHeader from '@/components/BackHeader';
import { useFeedback } from '@/components/FeedbackSystem';
import colors from '@/constants/colors';
import { useRecipeStore } from '@/stores/recipeStore';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { Recipe } from '@/services/recipeService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function RecipeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { showFeedback } = useFeedback();

  // Get stores
  const { savedRecipes, saveRecipe, removeSavedRecipe } = useSavedRecipesStore();

  // If we have a recipeId in params, load that recipe
  useEffect(() => {
    setLoading(true);
    let recipeData: Recipe | null = null;

    if (params.recipeId) {
      const recipeIdParam = params.recipeId as string;
      // Try to find the recipe in saved recipes
      const saved = savedRecipes.find(r => r.id === recipeIdParam);
      if (saved) {
        recipeData = saved;
      } else {
        // Potentially fetch from an API if not in saved recipes
        // For now, if not in saved, consider it not found or handle as per app logic
        console.warn(`Recipe with ID ${recipeIdParam} not found in saved recipes.`);
        // If your app has a global "current recipe" that's not part of savedRecipes,
        // you might try to load it here.
        // For this fix, we'll assume it must be in savedRecipes or passed directly.
      }
    }

    if (recipeData) {
      setRecipe(recipeData);
      initializeRecipe(recipeData);
    } else {
      // No recipe found or ID provided - go back or show error
      Alert.alert('Recipe not found', 'The requested recipe could not be found or no recipe was selected.');
      router.back();
    }
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    setLoading(false);
  }, [params.recipeId, savedRecipes]); // Use savedRecipes as a dependency if its change should trigger re-evaluation

  // Initialize the recipe state
  const initializeRecipe = (recipe: Recipe) => {
    // Check if recipe is saved
    setIsSaved(savedRecipes.some(r => r.id === recipe.id));
    
    // Initialize completed steps
    setCompletedSteps(new Array(recipe.steps.length).fill(false));

    // Get user rating if available
    if (recipe.rating) {
      setCurrentRating(recipe.rating);
    }
  };

  // Toggle step completion
  const toggleStepCompletion = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[index] = !newCompletedSteps[index];
    setCompletedSteps(newCompletedSteps);
    
    // If completed the step, scroll to the next step if available
    if (newCompletedSteps[index] && index < recipe!.steps.length - 1) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: (index + 1) * 200, // Approximate height of a step
          animated: true
        });
      }, 500);
    }
  };

  // Start a timer for a step
  const startTimer = (index: number, duration: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveTimer(index);
  };

  // Handle timer completion
  const handleTimerComplete = (index: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActiveTimer(null);
    
    // Mark step as completed when timer finishes
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[index] = true;
    setCompletedSteps(newCompletedSteps);
    
    // Show an alert that the timer is complete
    Alert.alert('Timer Complete', `Step ${index + 1} timer is complete!`);
  };

  // Set rating
  const handleRating = (ratingValue: number) => {
    if (!recipe) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentRating(ratingValue);
    
    // Update the recipe rating locally and in the store if applicable
    const updatedRecipe = {
      ...recipe,
      rating: ratingValue
    };
    setRecipe(updatedRecipe); // Update local state

    // If this recipe is in savedRecipes, update it there too.
    // This assumes savedRecipesStore has an updateRecipe method.
    // If not, this part needs adjustment based on store capabilities.
    const existingSavedRecipe = savedRecipes.find(r => r.id === recipe.id);
    if (existingSavedRecipe) {
      // Ideally, useSavedRecipesStore would have an `updateRecipe` action
      // For now, we'll update the local `recipe` state and assume persistence handles it,
      // or the user re-saves if they want this rating persisted.
      // A more robust solution would involve calling an update action on the store.
      console.log("Rating updated locally. To persist, ensure the recipe is saved or an update mechanism exists in the store.");
    }
    
    // Show feedback to the user
    showFeedback({
      title: 'Rating Saved',
      description: `You rated this recipe ${ratingValue} stars.`,
      type: 'success'
    });
  };

  // Toggle saved state
  const toggleSaved = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!recipe) return;
    
    if (isSaved) {
      removeSavedRecipe(recipe.title); // Assumes removal by title
      setIsSaved(false);
      
      // Show feedback toast
      showFeedback({
        title: 'Recipe Removed',
        description: 'Recipe removed from your saved collection.',
        type: 'info'
      });
    } else {
      saveRecipe(recipe); // Use saveRecipe from the store
      setIsSaved(true);
      
      // Show feedback toast
      showFeedback({
        title: 'Recipe Saved',
        description: 'Recipe added to your saved collection.',
        type: 'success'
      });
    }
  };

  // Open share modal
  const openShareModal = () => {
    if (!recipe) return;
    setShowShareModal(true);
  };

  // Open edit ingredients modal
  const openEditModal = () => {
    if (!recipe) return;
    setShowEditModal(true);
  };

  // Create a new recipe
  const createNewRecipe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/input');
  };

  // View a related recipe
  const viewRelatedRecipe = (relatedRecipe: Recipe) => {
    if (!relatedRecipe || !relatedRecipe.id) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate with recipeId, the screen will load it
    router.push({
      pathname: '/recipe', // Assuming the route is just '/recipe'
      params: { recipeId: relatedRecipe.id }
    });
  };

  // Share recipe
  const shareRecipe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!recipe) return;
    
    try {
      const shareMessage = `Check out this recipe for ${recipe.title}!\n\n` +
        `🍽️ Ingredients:\n${recipe.ingredients.join('\n')}\n\n` +
        `👨‍🍳 Instructions:\n${recipe.steps.map((step, i) => 
          `${i + 1}. ${step.instruction}`).join('\n')}\n\n` +
        'Generated with ReciptAI';
      
      await Share.share({
        message: shareMessage,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  // Toggle voice navigation
  const toggleVoiceNavigation = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      Speech.stop();
    } else {
      // Start listening
      setIsListening(true);
      Speech.speak('Voice navigation activated. Say "next step" to navigate.');
      
      // In a real app, you would implement voice recognition
      // This is a placeholder for demo purposes
    }
  };

  // Regenerate image for a step
  const regenerateStepImage = (index: number) => {
    if (!recipe) return;
    
    // In a real app, this would call imageService.ts to generate a new image
    Alert.alert('Generating New Image', 'Regenerating image for this step...');
    
    // Simulate image regeneration delay
    setTimeout(() => {
      Alert.alert('Image Generated', 'New image has been generated for this step.');
    }, 1500);
  };

  if (loading || !recipe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  // Calculate some derived values
  const allStepsCompleted = completedSteps.every(Boolean) && completedSteps.length > 0;
  const progressPercentage = completedSteps.filter(Boolean).length / 
    (completedSteps.length || 1) * 100;

  // Mock related recipes
  const relatedRecipes = [
    {
      id: 'related1',
      title: 'Similar Dish with Variations',
      description: 'A different take on this recipe with alternative ingredients',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3',
      prepTime: '15 min',
      cookTime: '25 min',
      ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
      steps: [{ instruction: 'Step 1' }, { instruction: 'Step 2' }],
      servings: 4,
      difficulty: 'Medium' as 'Medium' // Type assertion for difficulty
    },
    {
      id: 'related2',
      title: 'Another Related Recipe',
      description: 'Uses similar cooking techniques',
      imageUrl: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-4.0.3',
      prepTime: '10 min',
      cookTime: '20 min',
      ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
      steps: [{ instruction: 'Step 1' }, { instruction: 'Step 2' }],
      servings: 2,
      difficulty: 'Easy' as 'Easy' // Type assertion for difficulty
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        {recipe?.heroImage ? (
          <Image 
            source={{ uri: recipe.heroImage }} 
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderHero}>
            <Ionicons name="restaurant-outline" size={48} color="rgba(0,0,0,0.2)" />
          </View>
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.heroGradient}
          pointerEvents="none"
        />
      </View>
      
      {/* Back Header */}
      <BackHeader 
        transparent={true}
        rightContent={
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openShareModal}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ 
              uri: recipe.heroImage || 
              recipe.steps[0]?.imageUrl || 
              'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?q=80&w=2892&auto=format&fit=crop'
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            {/* Recipe Title */}
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            
            {/* Category Tag with Fresh Green Gradient */}
            {recipe.category && (
              <View style={styles.categoryContainer}>
                <LinearGradient
                  colors={['#A5D6A7', '#81C784']} // Fresh Green gradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.categoryGradient}
                >
                  <Text style={styles.categoryText}>{recipe.category}</Text>
                </LinearGradient>
              </View>
            )}
            
            <View style={styles.recipeMetaContainer}>
              {recipe.prepTime && (
                <View style={styles.recipeMeta}>
                  <Ionicons name="time-outline" size={16} color="white" />
                  <Text style={styles.recipeMetaText}>
                    Prep: {recipe.prepTime}
                  </Text>
                </View>
              )}
              
              {recipe.cookTime && (
                <View style={styles.recipeMeta}>
                  <Ionicons name="flame-outline" size={16} color="white" />
                  <Text style={styles.recipeMetaText}>
                    Cook: {recipe.cookTime}
                  </Text>
                </View>
              )}
              
              {recipe.servings && (
                <View style={styles.recipeMeta}>
                  <Ionicons name="people-outline" size={16} color="white" />
                  <Text style={styles.recipeMetaText}>
                    Serves: {recipe.servings}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Description */}
        {recipe.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>
        )}
        
        {/* Progress Bar (when cooking) */}
        {completedSteps.some(Boolean) && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {completedSteps.filter(Boolean).length} of {completedSteps.length} steps completed
            </Text>
          </View>
        )}
        
        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <IngredientList 
            ingredients={recipe.ingredients} 
            editable={true}
          />
        </View>
        
        {/* Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <StepList 
            steps={recipe.steps} 
            onStepComplete={toggleStepCompletion}
            autoScrollToNextStep={true}
            onRegenerateImage={regenerateStepImage}
          />
        </View>
        
        {/* Post-Cooking Actions */}
        {allStepsCompleted && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nice Work!</Text>
            <View style={styles.postCookingContainer}>
              {/* Rate Recipe */}
              <View style={styles.postCookingItem}>
                <Text style={styles.postCookingLabel}>How did it turn out?</Text>
                <StarRating 
                  rating={currentRating}
                  size={32}
                  isEditable={true}
                  onRatingChange={handleRating}
                  style={styles.starRating}
                />
              </View>
              
              {/* Save Recipe */}
              <View style={styles.postCookingItem}>
                <Text style={styles.postCookingLabel}>Save for later</Text>
                <SaveButton 
                  recipe={recipe}
                  size="large"
                  variant={isSaved ? "primary" : "outline"}
                  style={styles.saveButton}
                  showText={true}
                />
              </View>
              
              {/* Edit or Create Variation */}
              <View style={styles.postCookingActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={openEditModal}
                  accessibilityLabel="Create variation"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={['#A5D6A7', '#81C784']} // Fresh Green gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="git-branch-outline" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Create Variation</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={createNewRecipe}
                  accessibilityLabel="Create new recipe"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={['#FF8C61', '#F96E43']} // Sunrise Orange gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="add-outline" size={20} color="white" />
                    <Text style={styles.actionButtonText}>New Recipe</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {/* Related Recipes - Soft Peach Theme */}
        <View style={styles.relatedRecipesSection}>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <RecipeCarousel 
            title=""
            recipes={relatedRecipes}
            onRecipePress={viewRelatedRecipe}
            showViewAll={true}
            viewAllRoute="/recipes/recommended"
          />
        </View>
        
        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
      
      {/* Share Modal */}
      {recipe && (
        <ShareModal
          recipe={recipe}
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
      
      {/* Edit Ingredients Modal */}
      {recipe && (
        <EditIngredients
          recipe={recipe}
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedRecipeData) => {
            setRecipe(updatedRecipeData); // Update local state
            // Potentially update in savedRecipesStore if it's a saved recipe
            const existingSaved = savedRecipes.find(r => r.id === updatedRecipeData.id);
            if (existingSaved) {
              // savedRecipesStore.updateRecipe(updatedRecipeData.id, updatedRecipeData); // If an update action exists
              console.log("Recipe updated locally. Consider implementing an update action in savedRecipesStore.");
            }
            setShowEditModal(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  headerGradient: {
    height: Platform.OS === 'ios' ? 100 : 90,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 250,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderHero: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  categoryGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  recipeMetaText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  relatedRecipesSection: {
    paddingTop: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: colors.backgroundAlt,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ingredientsList: {
    marginBottom: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  postCookingContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  postCookingItem: {
    marginBottom: 20,
  },
  postCookingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  starRating: {
    justifyContent: 'center',
  },
  saveButton: {
    alignSelf: 'flex-start',
  },
  postCookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  stepContainer: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepCheckbox: {
    marginLeft: 'auto',
  },
  stepImage: {
    width: '100%',
    height: 180,
  },
  stepInstruction: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    padding: 16,
  },
  completedStepInstruction: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  timerButtonText: {
    color: colors.primary,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTimerButtonText: {
    color: colors.secondary,
  }
});
