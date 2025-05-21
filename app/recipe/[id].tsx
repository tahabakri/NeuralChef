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
  useWindowDimensions
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

// Components
import RecipeHeader from '@/components/recipe/RecipeHeader';
import IngredientList from '@/components/recipe/IngredientList';
import StepList from '@/components/recipe/StepList';
import ProgressBar from '@/components/recipe/ProgressBar';
import NutritionalInfo from '@/components/recipe/NutritionalInfo';
import SaveButton from '@/components/recipe/SaveButton';
import TimerButton from '@/components/recipe/TimerButton';
import ErrorScreen from '@/components/recipe/ErrorScreen';

// Stores
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';

// Constants & Utils
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { getRecipeById } from '@/services/recipeService';
import { NetworkManager } from '@/components/OfflineBanner';

// Types
import { Recipe, Step, Ingredient } from '@/types/recipe';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const recipeId = Array.isArray(id) ? id[0] : id;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  // State hooks
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  
  // Animation refs and values
  const lottieRef = useRef<LottieView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerOpacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);
  
  // Store hooks
  const { saveRecipe, removeSavedRecipe, isSaved } = useSavedRecipesStore();
  
  // Check if recipe is saved
  const [saved, setSaved] = useState(false);
  
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
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Floating header for long scroll */}
      <Animated.View style={[styles.floatingHeader, headerAnimatedStyle, { paddingTop: insets.top }]}>
        <View style={styles.floatingHeaderContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.floatingHeaderTitle} numberOfLines={1}>{recipe.title}</Text>
          <SaveButton saved={saved} onPress={toggleSaveRecipe} />
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
        {/* Recipe Hero Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: recipe.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={[styles.imageGradient, { paddingTop: insets.top }]}
          >
            <TouchableOpacity onPress={handleBackPress} style={styles.backButtonTop}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.topRightButtons}>
              <SaveButton saved={saved} onPress={toggleSaveRecipe} light />
              <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                <Ionicons name="share-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* Recipe Header */}
        <View style={styles.recipeHeaderContainer}>
          <RecipeHeader
            title={recipe.title}
            difficulty={recipe.difficulty}
            cookTime={recipe.cookTime}
            servings={recipe.servings}
            rating={recipe.rating}
          />
        </View>
        
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
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          <View style={styles.sectionContent}>
            <IngredientList 
              ingredients={recipe.ingredients} 
              servings={recipe.servings}
            />
          </View>
        </View>
        
        {/* Instructions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Instructions</Text>
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
          <View style={styles.sectionContainer}>
            <NutritionalInfo 
              nutritionalInfo={{
                calories: recipe.nutritionalInfo.calories ?? 0,
                protein: recipe.nutritionalInfo.protein ?? 0,
                carbs: recipe.nutritionalInfo.carbs ?? 0,
                fat: recipe.nutritionalInfo.fat ?? 0,
                // Spread any other properties, defaulting to 0 if they are undefined
                ...Object.fromEntries(
                  Object.entries(recipe.nutritionalInfo).map(([key, value]) => [
                    key,
                    value ?? 0,
                  ])
                ),
              }}
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
      </ScrollView>
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
    paddingBottom: 20,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  backButtonTop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightButtons: {
    flexDirection: 'row',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
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
    marginHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.heading2,
    color: colors.text,
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
});
