"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  StatusBar,
  useWindowDimensions,
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Image as ExpoImage } from 'expo-image';

// Components
import RecipeHeader from '@/components/recipe/RecipeHeader'; // Re-adding the import
import IngredientList from '@/components/recipe/IngredientList';
import StepList from '@/components/recipe/StepList';
import ProgressBar from '@/components/recipe/ProgressBar';
import NutritionalInfo from '@/components/recipe/NutritionalInfo';
import SaveButton from '@/components/recipe/SaveButton';
import TimerButton from '@/components/recipe/TimerButton';
import ErrorScreen from '@/components/recipe/ErrorScreen';
import InfoPill from '@/components/recipe/InfoPill';

// Stores
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';

// Constants & Utils
import colors from '@/constants/colors';
import gradients from '@/constants/gradients'; // Import gradients
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { getRecipeById } from '@/services/recipeService';
import { NetworkManager } from '@/components/OfflineBanner';

// Types
import { Recipe, Step, Ingredient } from '@/types/recipe';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const recipeId = Array.isArray(id) ? id[0] : id;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const SCREEN_WIDTH = width;
  
  // State hooks
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const [isCookingModeActive, setIsCookingModeActive] = useState(false); // New state for cooking mode
  
  // Animation refs and values
  const lottieRef = useRef<LottieView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const nutritionalInfoRef = useRef<View>(null);
  const headerOpacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);
  
  // Store hooks
  const { saveRecipe, removeSavedRecipe, isSaved } = useSavedRecipesStore();
  
  // Check if recipe is saved
  const [saved, setSaved] = useState(false);

  // const handleAddToShoppingList = () => { // Removed
  //   // Placeholder for adding all ingredients to a shopping list
  //   if (!recipe || !recipe.ingredients) return;
    
  //   const ingredientDetails = recipe.ingredients.map(ing => {
  //     let detail = ing.name;
  //     if (ing.quantity) detail = `${ing.quantity} ${ing.unit || ''} ${detail}`;
  //     return detail.trim();
  //   });

  //   Alert.alert(
  //     "Add to Shopping List",
  //     `The following ingredients would be added:\n\n- ${ingredientDetails.join('\n- ')}\n\n(Feature coming soon!)`
  //   );
  //   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  // };

  const handleStartOrResumeCooking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCookingModeState = !isCookingModeActive;
    setIsCookingModeActive(newCookingModeState);

    if (newCookingModeState) {
      // Scroll to the first uncompleted step or top of StepList
      // For now, just an alert
      const firstUncompletedStepIndex = recipe?.steps.findIndex((_, index) => !completedSteps.includes(index));
      const targetStep = firstUncompletedStepIndex !== -1 && firstUncompletedStepIndex !== undefined ? `Step ${firstUncompletedStepIndex + 1}` : 'the steps';
      
      Alert.alert(
        "Cooking Mode Activated",
        `Focused cooking mode started. Scrolling to ${targetStep}.`
        // Later, implement actual scrolling to the step
      );
      // TODO: Implement scrolling to the relevant step
    } else {
      Alert.alert("Cooking Mode Deactivated", "You've exited focused cooking mode.");
    }
  };

  const handleMoreOptionsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Placeholder for showing options like "Edit Recipe" or "Create Variation"
    Alert.alert(
      "More Options",
      "What would you like to do?\n\n- Edit Recipe / Create Variation\n- Report an issue\n\n(Functionality coming soon!)"
    );
    // Later, this could open a modal or action sheet:
    // Example: router.push(`/recipe/${recipeId}/edit`);
  };

  const scrollToNutritionalInfo = () => {
    if (nutritionalInfoRef.current && scrollViewRef.current) {
      nutritionalInfoRef.current.measureLayout(
        scrollViewRef.current.getInnerViewNode(),
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - (insets.top + 56), animated: true }); // Adjust for floating header
        },
        () => {
          console.error('Failed to measure layout for NutritionalInfo');
        }
      );
    }
  };

  const handleTimePillPress = () => {
    // Placeholder for prep vs cook time breakdown
    // In a real app, you might fetch this data or have it in the recipe object
    Alert.alert(
      "Time Breakdown",
      `Total Cook Time: ${recipe?.cookTime} MIN\n(Prep time details not yet available)`
    );
  };
  
  useEffect(() => {
    // Subscribe to network changes
    const unsubscribeNetManager = NetworkManager.addListener(setIsOffline);
    
    if (recipeId) {
      fetchRecipeDetails(recipeId);
    }
    
    return () => {
      unsubscribeNetManager();
    };
  }, [recipeId]);
  
  useEffect(() => {
    if (recipe) {
      checkIfRecipeIsSaved();
    }
  }, [recipe]);
  
  useEffect(() => {
    if (recipe && completedSteps.length === recipe.steps.length && recipe.steps.length > 0) {
      handleAllStepsCompleted();
    }
  }, [completedSteps, recipe]);

  const fetchRecipeDetails = async (id: string) => {
    try {
      setLoading(true);
      const recipeData = await getRecipeById(id);
      
      if (!recipeData) {
        setError('Recipe not found');
        return;
      }
      
      setRecipe(recipeData);
    } catch (err) {
      console.error('Failed to fetch recipe:', err);
      setError('Failed to load the recipe');
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfRecipeIsSaved = () => {
    if (recipe) {
      const isRecipeSaved = isSaved(recipe.id);
      setSaved(isRecipeSaved);
    }
  };
  
  const handleStepToggle = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setCompletedSteps(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  const handleAllStepsCompleted = () => {
    if (allStepsCompleted) return;
    
    setAllStepsCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Start confetti animation
    confettiScale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
    
    // Play lottie animation
    if (lottieRef.current) {
      lottieRef.current.play();
    }
    
    // Scroll to bottom to show completion message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };
  
  const toggleSaveRecipe = () => {
    if (!recipe) return;
    
    if (saved) {
      removeSavedRecipe(recipe.id);
    } else {
      saveRecipe(recipe);
    }
    
    setSaved(!saved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  const handleShare = async () => {
    if (!recipe) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const shareResult = await Share.share({
        title: `${recipe.title} Recipe`,
        message: `Check out this delicious ${recipe.title} recipe I found on RecipAI! ${recipe.steps.length} steps and ready in ${recipe.cookTime} minutes.`,
        url: 'https://recipai.app/recipe/' + recipe.id,
      });
      
      if (shareResult.action === Share.sharedAction) {
        console.log('Recipe shared successfully');
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };
  
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        { translateY: withTiming(headerOpacity.value * 0, { duration: 300 }) }
      ]
    };
  });
  
  const confettiAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: confettiScale.value }
      ],
      opacity: confettiScale.value
    };
  });
  
  // Handle loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }
  
  // Handle error state
  if (error || !recipe) {
    return <ErrorScreen error={error || 'Recipe not found'} onRetry={() => fetchRecipeDetails(recipeId)} onBack={handleBackPress} />;
  }
  
  // Calculate progress
  const progress = recipe.steps.length > 0 ? completedSteps.length / recipe.steps.length : 0;

  const getFabLabel = () => {
    if (completedSteps.length === 0) return "Start Cooking";
    if (completedSteps.length > 0 && !allStepsCompleted) return "Resume Cooking";
    return ""; // Hidden if all completed or no recipe
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Floating header for long scroll */}
      <Animated.View style={[styles.floatingHeader, headerAnimatedStyle, { paddingTop: insets.top }]}>
        <View style={styles.floatingHeaderContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.headerIconButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.floatingHeaderTitle} numberOfLines={1}>{recipe.title}</Text>
          <View style={styles.headerActionsContainer}>
            <SaveButton saved={saved} onPress={toggleSaveRecipe} />
            <TouchableOpacity onPress={handleMoreOptionsPress} style={styles.headerIconButton}>
              <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          if (offsetY > 250) {
            headerOpacity.value = withTiming(1, { duration: 200 });
          } else {
            headerOpacity.value = withTiming(0, { duration: 150 });
          }
        }}
        scrollEventThrottle={16}
      >
        {/* Hero Image Section */}
        <View style={styles.heroImageContainer}>
          <ExpoImage 
            source={{ uri: recipe.image }}
            style={styles.heroImage}
            contentFit="cover"
          />
          
          {/* Overlaid Header Controls */}
          <View style={[styles.overlayControls, { paddingTop: insets.top + spacing.sm }]}>
            <TouchableOpacity 
              onPress={handleBackPress} 
              style={styles.controlButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.heroHeaderActionsContainer}>
              <SaveButton saved={saved} onPress={toggleSaveRecipe} light />
              <TouchableOpacity onPress={handleMoreOptionsPress} style={styles.controlButton}>
                <Ionicons name="ellipsis-vertical" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Content Container with White Background and Rounded Corners */}
        <View style={styles.contentContainer}>
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />
          
          {/* New Recipe Header */}
          <RecipeHeader
            title={recipe.title}
            difficulty={recipe.difficulty}
            cookTime={recipe.cookTime}
            servings={recipe.servings}
            rating={recipe.rating}
          />
          
          {/* Progress Bar - only show if there are steps */}
          {recipe.steps.length > 0 && (
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={progress} 
                completedSteps={completedSteps.length} 
                totalSteps={recipe.steps.length}
              />
            </View>
          )}
          
          {/* Ingredients Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ingredients :</Text>
            <View style={styles.sectionContent}>
              <IngredientList
                ingredients={recipe.ingredients} // This should now be Ingredient[]
                // onAddToShoppingList={handleAddToShoppingList} // Removed
                // editable={false} // Default
                // showQuantities={true} // Default
              />
            </View>
          </View>
          
          {/* Directions Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Directions :</Text>
            <View style={styles.sectionContent}>
              <StepList 
                steps={recipe.steps}
                completedSteps={completedSteps}
                onToggleStep={handleStepToggle}
              />
            </View>
          </View>
          
          {/* Nutritional Information Section */}
          {recipe.nutritionalInfo && (
            <View style={styles.sectionContainer} ref={nutritionalInfoRef}>
              <NutritionalInfo
                nutritionalInfo={
                  (() => {
                    let processedNInfo: { calories: number; protein: number; carbs: number; fat: number; [key: string]: number };
                    if (recipe.nutritionalInfo) {
                      const entries = Object.entries(recipe.nutritionalInfo).map(([key, value]) => [
                        key,
                        // Ensure the value is a number; if not, default to 0.
                        typeof value === 'number' ? value : 0,
                      ]);
                      const tempNInfo = Object.fromEntries(entries) as { [key: string]: number };
                      processedNInfo = {
                        // Ensure main properties exist and are numbers, defaulting to 0.
                        calories: tempNInfo.calories ?? 0,
                        protein: tempNInfo.protein ?? 0,
                        carbs: tempNInfo.carbs ?? 0,
                        fat: tempNInfo.fat ?? 0,
                        // Spread other properties which are already numbers or 0.
                        ...tempNInfo,
                      };
                    } else {
                      // Default structure if recipe.nutritionalInfo itself is missing.
                      processedNInfo = { calories: 0, protein: 0, carbs: 0, fat: 0 };
                    }
                    return processedNInfo;
                  })()
                }
              />
            </View>
          )}
          
          {/* Recipe Complete Section - Only show if all steps are completed */}
          {allStepsCompleted && (
            <View style={styles.completionContainer}>
              <View style={styles.confettiContainer}>
                <Animated.View style={[styles.confetti, confettiAnimatedStyle]}>
                  <LottieView
                    ref={lottieRef}
                    source={require('@/assets/animations/confetti.json')}
                    style={{ width: width * 1.5, height: width * 1.5 }}
                    loop={false}
                    autoPlay={false}
                  />
                </Animated.View>
              </View>
              <Text style={styles.completionTitle}>Recipe Completed!</Text>
              <Text style={styles.completionSubtitle}>Great job cooking {recipe.title}!</Text>
              <TouchableOpacity style={styles.shareCompletedButton} onPress={handleShare}>
                <Ionicons name="share-social" size={20} color={colors.white} />
                <Text style={styles.shareCompletedButtonText}>Share Your Achievement</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Bottom spacing for safe area */}
          <View style={{ height: insets.bottom + 20 }} />
        </View>
      </ScrollView>

      {/* Start/Resume Cooking FAB */}
      {!allStepsCompleted && recipe && recipe.steps.length > 0 && (
        <TouchableOpacity
          onPress={handleStartOrResumeCooking}
          activeOpacity={0.8}
          style={[styles.fabOuter, { bottom: insets.bottom > 0 ? insets.bottom + spacing.md : spacing.lg }]}
        >
          <LinearGradient
            colors={gradients.warmOrange.colors as [string, string]}
            style={styles.fabGradient}
            start={gradients.warmOrange.direction.start}
            end={gradients.warmOrange.direction.end}
          >
            <Ionicons 
              name={isCookingModeActive ? "close-circle-outline" : (completedSteps.length === 0 ? "play-circle-outline" : "play-forward-circle-outline")} 
              size={24} 
              color={colors.white} 
              style={styles.fabIcon} 
            />
            <Text style={styles.fabLabel}>
              {isCookingModeActive ? "Exit Mode" : getFabLabel()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
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
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Hero Image Section
  heroImageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlayControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Content Container
  contentContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    marginTop: -spacing.xl,
    paddingTop: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center', // Center the drag indicator
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.dragHandle,
    borderRadius: 2,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  // Recipe Title
  recipeTitle: { // This style might be deprecated or moved to RecipeHeader if not used elsewhere
    ...typography.title1,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  // Info Pills - This container style might be deprecated or moved
  infoPillsContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  floatingHeaderTitle: {
    ...typography.heading3,
    color: colors.text,
    flex: 1,
    textAlign: 'center', // Center title if actions take space
    marginHorizontal: spacing.sm, // Adjust margin
  },
  headerIconButton: { // Renamed from backButton for generic use
    padding: spacing.sm, // Use spacing constant
    width: 44, // Standard touch target size
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroHeaderActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: spacing.md,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    width: '100%',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.heading2, // Now correctly references the new style
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 32,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  completionTitle: {
    ...typography.heading2,
    color: colors.success,
    marginTop: 16,
  },
  completionSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
  },
  shareCompletedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  shareCompletedButtonText: {
    ...typography.bodyLarge,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
  fabOuter: { // Style for the TouchableOpacity container
    position: 'absolute',
    right: spacing.lg,
    borderRadius: 30, // Match gradient's border radius
    shadowColor: colors.shadow, // Apply shadow to the outer container
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabGradient: { // Style for the LinearGradient
    borderRadius: 30,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    marginRight: spacing.sm,
  },
  fabLabel: {
    ...typography.button,
    color: colors.white,
    fontFamily: 'Poppins-SemiBold',
  },
});
