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
import Checkbox from '@/components/Checkbox';
import Timer from '@/components/Timer';
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
  const [userRating, setUserRating] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get stores
  const { currentRecipe, setRecipe: setStoreRecipe } = useRecipeStore();
  const { savedRecipes, addSavedRecipe, removeSavedRecipe } = useSavedRecipesStore();

  // If we have a recipeId in params, load that recipe
  useEffect(() => {
    setLoading(true);
    
    if (params.recipeId) {
      // In a real app you would fetch the recipe from an API or local storage
      // For now, we'll just use the current recipe from the store
      if (currentRecipe && currentRecipe.id === params.recipeId) {
        setRecipe(currentRecipe);
        initializeRecipe(currentRecipe);
      } else {
        // Try to find the recipe in saved recipes
        const saved = savedRecipes.find(r => r.id === params.recipeId);
        if (saved) {
          setRecipe(saved);
          initializeRecipe(saved);
        } else {
          // Fallback to the current recipe if we can't find the requested one
          if (currentRecipe) {
            setRecipe(currentRecipe);
            initializeRecipe(currentRecipe);
          } else {
            // No recipe found - go back
            Alert.alert('Recipe not found', 'The requested recipe could not be found.');
            router.back();
          }
        }
      }
    } else if (currentRecipe) {
      // Use the current recipe from the store if no ID is provided
      setRecipe(currentRecipe);
      initializeRecipe(currentRecipe);
    } else {
      // No recipe available - go back
      Alert.alert('No recipe selected', 'Please select a recipe first.');
      router.back();
    }
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    setLoading(false);
  }, [params.recipeId, currentRecipe]);

  // Initialize the recipe state
  const initializeRecipe = (recipe: Recipe) => {
    // Check if recipe is saved
    setIsSaved(savedRecipes.some(r => r.id === recipe.id));
    
    // Initialize completed steps
    setCompletedSteps(new Array(recipe.steps.length).fill(false));
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
  const handleRating = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserRating(rating);
    
    // In a real app, you would save this rating to your backend
    Alert.alert('Thank You!', `You rated this recipe ${rating} stars.`);
  };

  // Toggle saved state
  const toggleSaved = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!recipe) return;
    
    if (isSaved) {
      removeSavedRecipe(recipe.title);
      setIsSaved(false);
      // Show feedback toast
    } else {
      addSavedRecipe(recipe);
      setIsSaved(true);
      // Show feedback toast
    }
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

  // Edit recipe - navigate to edit screen
  const editRecipe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!recipe) return;
    
    // Set current recipe in store first
    setStoreRecipe(recipe);
    
    // Navigate to edit screen
    router.push({
      pathname: '/edit-recipe',
      params: { recipeId: recipe.id }
    });
  };

  // Create variation - generate a new similar recipe
  const createVariation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!recipe) return;
    
    Alert.alert(
      'Create Variation',
      'Do you want to create a variation of this recipe?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: () => {
            // Navigate to ingredient screen with current ingredients pre-filled
            router.push({
              pathname: '/input',
              params: { ingredients: recipe.ingredients.join(',') }
            });
          },
        },
      ]
    );
  };

  // Navigate to similar recipes
  const viewSimilarRecipes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!recipe) return;
    
    router.push({
      pathname: '/similar-recipes',
      params: { 
        tags: recipe.tags?.join(','), 
        category: recipe.category 
      }
    });
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleSaved}
            accessibilityLabel={isSaved ? "Remove from saved recipes" : "Save recipe"}
            accessibilityRole="button"
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={shareRecipe}
            accessibilityLabel="Share recipe"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
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
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            
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
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={`ingredient-${index}`} style={styles.ingredientItem}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          
          {recipe.steps.map((step, index) => (
            <View key={`step-${index}`} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.stepCheckbox}
                  onPress={() => toggleStepCompletion(index)}
                  accessibilityLabel={`Mark step ${index + 1} as ${completedSteps[index] ? 'incomplete' : 'complete'}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: completedSteps[index] }}
                >
                  <Checkbox checked={completedSteps[index]} />
                </TouchableOpacity>
              </View>
              
              {step.imageUrl && (
                <Image
                  source={{ uri: step.imageUrl }}
                  style={styles.stepImage}
                  resizeMode="cover"
                />
              )}
              
              <Text style={[
                styles.stepInstruction, 
                completedSteps[index] && styles.completedStepInstruction
              ]}>
                {step.instruction}
              </Text>
              
              {step.hasTimer && step.timerDuration && (
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={() => startTimer(index, step.timerDuration || 0)}
                  disabled={activeTimer !== null}
                  accessibilityLabel={`Start ${step.timerDuration} minute timer for step ${index + 1}`}
                  accessibilityRole="button"
                >
                  <Ionicons 
                    name="timer-outline" 
                    size={18} 
                    color={activeTimer === index ? colors.secondary : colors.primary} 
                  />
                  <Text style={[
                    styles.timerButtonText,
                    activeTimer === index && styles.activeTimerButtonText
                  ]}>
                    {activeTimer === index ? 'Timer Running' : `Set ${step.timerDuration} min Timer`}
                  </Text>
                </TouchableOpacity>
              )}
              
              {activeTimer === index && step.timerDuration && (
                <Timer
                  duration={step.timerDuration * 60} // Convert minutes to seconds
                  onComplete={() => handleTimerComplete(index)}
                />
              )}
            </View>
          ))}
        </View>
        
        {/* Nutrition Info */}
        {recipe.nutritionInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Information</Text>
            <View style={styles.nutritionContainer}>
              {recipe.nutritionInfo.calories && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionInfo.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
              )}
              
              {recipe.nutritionInfo.protein && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionInfo.protein}</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
              )}
              
              {recipe.nutritionInfo.carbs && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionInfo.carbs}</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
              )}
              
              {recipe.nutritionInfo.fat && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionInfo.fat}</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Rate Recipe Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate This Recipe</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={`star-${star}`}
                onPress={() => handleRating(star)}
                style={styles.starButton}
                accessibilityLabel={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                accessibilityRole="button"
              >
                <Ionicons
                  name={userRating >= star ? "star" : "star-outline"}
                  size={32}
                  color={userRating >= star ? colors.secondary : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={editRecipe}
            accessibilityLabel="Edit recipe"
            accessibilityRole="button"
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.variationButton]}
            onPress={createVariation}
            accessibilityLabel="Create variation"
            accessibilityRole="button"
          >
            <Ionicons name="git-branch-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Variation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.similarButton]}
            onPress={viewSimilarRecipes}
            accessibilityLabel="View similar recipes"
            accessibilityRole="button"
          >
            <Ionicons name="albums-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Similar</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    width: '100%',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
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
  },
  nutritionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  starButton: {
    padding: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  variationButton: {
    backgroundColor: colors.secondary,
  },
  similarButton: {
    backgroundColor: colors.tertiary,
  },
}); 