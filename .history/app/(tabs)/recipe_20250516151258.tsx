import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Pressable, Alert, Share, Animated, FlatList, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ChevronLeft, Clock, Users, Flame, Heart, Share2, TimerOff, Bookmark, BarChart, Star, ChevronDown, ChevronUp, Coffee, CircleCheck, ChefHat, HelpCircle, Sparkles } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import Reanimated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, interpolate, useAnimatedScrollHandler } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import Button from '@/components/Button';
import PulseButton from '@/components/PulseButton';
import EmptyStateAnimation from '@/components/EmptyStateAnimation';
import TutorialModal from '@/components/TutorialModal';
import RecipeStep from '@/components/RecipeStep';
import IngredientsList from '@/components/IngredientList';
import LoadingOverlay from '@/components/LoadingOverlay';
import CategoryTag from '@/components/CategoryTag';
import TagSelector from '@/components/TagSelector';
import colors from '@/constants/colors';
import { useRecipeStore, getUserFriendlyErrorMessage } from '@/stores/recipeStore';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { useUserStore } from '@/stores/userStore';

// Define styles at the beginning before they're used
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  heroImageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  heroTitleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  actionButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.card,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.dragHandle,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  stickyHeaderContainer: {
    height: 'auto',
    overflow: 'hidden',
  },
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stickyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  metaDataRow: {
    flexDirection: 'row',
    marginVertical: 12,
    justifyContent: 'space-between',
  },
  metaDataItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaDataLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  metaDataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  copyButtonText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 13,
    marginLeft: 4,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nutritionToggle: {
    padding: 4,
  },
  nutritionContainer: {
    marginTop: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nutritionItem: {
    fontSize: 15,
    color: colors.text,
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    marginTop: 24,
    marginBottom: 32,
  },
  emptyStateDescription: {
    fontSize: 15,
    textAlign: 'center',
    color: colors.textLight,
    marginBottom: 48,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  iMadeThisButton: {
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  iMadeThisButtonActive: {
    backgroundColor: colors.success,
  },
  iMadeThisContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iMadeThisText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 12,
    alignSelf: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 4,
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  tutorialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  relatedRecipesSection: {
    marginVertical: 16,
  },
  relatedRecipesContainer: {
    paddingBottom: 12,
  },
  relatedRecipeCard: {
    width: 160,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  relatedRecipeImage: {
    width: '100%',
    height: '100%',
  },
  relatedRecipeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  relatedRecipeTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  newRecipeButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  servingsAdjustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  servingsButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyImageContainer: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    marginBottom: 20,
    width: '100%',
  },
  quickStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  quickStartText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  stickyHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyActionButton: {
    marginLeft: 12,
    padding: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: 6,
  },
  pillHighlight: {
    fontWeight: '600',
    color: colors.text,
  },
  totalTimePill: {
    backgroundColor: colors.backgroundAlt,
  },
  nutritionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionIcon: {
    marginRight: 8,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
});

// Mock data for related recipes
const RELATED_RECIPES = [
  {
    id: 'rel1',
    title: 'Blueberry Pancakes',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'rel2',
    title: 'Belgian Waffles',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f35b6?q=80&w=2025&auto=format&fit=crop'
  },
  {
    id: 'rel3',
    title: 'French Toast',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1547&auto=format&fit=crop'
  },
];

export default function RecipeScreen() {  const { recipe, isLoading, error, clearRecipe, addToFavorites, removeFromFavorites, isFavorite } = useRecipeStore();  const { saveRecipe, removeSavedRecipe, isSaved, updateRecipeTags } = useSavedRecipesStore();  const userProfile = useUserStore(state => state.profile);    const [isFavorited, setIsFavorited] = useState(false);  const [isRecipeSaved, setIsRecipeSaved] = useState(false);  const [headerVisible, setHeaderVisible] = useState(false);  const [showNutrition, setShowNutrition] = useState(true);  const [ratingValue, setRatingValue] = useState(0);  const [hasCooked, setHasCooked] = useState(false);  const [showTutorial, setShowTutorial] = useState(false);  const [recipeTags, setRecipeTags] = useState<string[]>([]);
  
  const router = useRouter();
  
  // Parallax effect
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  
  // Animated styles for parallax
  const heroImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-300, 0, 300],
            [150, 0, -150]
          ),
        },
      ],
    };
  });
  
  // These animations will be used for the empty state
  // Moved up from the conditional to follow React Hooks rules
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  
  // Create animated styles at the top level 
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  // Set up animations with a guard to only run when there's no recipe
  useEffect(() => {
    // Only apply animations when in empty state
    if (!recipe && !isLoading && !error) {
      // Pulse animation
      scale.value = withRepeat(
        withTiming(1.05, { 
          duration: 1500,
          easing: Easing.inOut(Easing.ease)
        }),
        -1, // Infinite repeat
        true // Reverse
      );
      
      // Subtle floating animation
      translateY.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1000 }),
          withTiming(5, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [recipe, isLoading, error, scale, translateY]);

    useEffect(() => {    if (recipe) {      setIsFavorited(isFavorite(recipe.title));      setIsRecipeSaved(isSaved(recipe.title));            // Set recipe tags if available      if (recipe.tags) {        setRecipeTags(recipe.tags);      } else {        setRecipeTags([]);      }    }  }, [recipe, isFavorite, isSaved]);    // Update tags in the store when they change  useEffect(() => {    if (recipe && isRecipeSaved) {      updateRecipeTags(recipe.title, recipeTags);    }  }, [recipeTags, recipe, isRecipeSaved]);

  const handleNewRecipe = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    clearRecipe();
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  const handleCopyIngredients = async () => {
    if (!recipe) return;
    
    try {
      await Clipboard.setStringAsync(recipe.ingredients.join('\n'));
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Show toast instead of alert
      Toast.show({
        type: 'success',
        text1: 'Ingredients copied!',
        text2: 'The ingredients list has been copied to your clipboard.',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Failed to copy ingredients:', error);
      Alert.alert('Error', 'Failed to copy ingredients to clipboard');
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!recipe) return;
    
    try {
      if (isFavorited) {
        await removeFromFavorites(recipe.title);
        setIsFavorited(false);
      } else {
        await addToFavorites(recipe);
        setIsFavorited(true);
      }
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };
  
  const handleToggleSave = async () => {    if (!recipe) return;        try {      if (isRecipeSaved) {        await removeSavedRecipe(recipe.title);        setIsRecipeSaved(false);                if (Platform.OS !== 'web') {          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);        }                Alert.alert('Recipe Removed', 'Recipe removed from your saved collection');      } else {        // Add current tags to the recipe before saving        const recipeWithTags = {          ...recipe,          tags: recipeTags        };        await saveRecipe(recipeWithTags);        setIsRecipeSaved(true);                if (Platform.OS !== 'web') {          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);        }                Alert.alert('Recipe Saved', 'Recipe added to your saved collection');      }    } catch (error) {      console.error('Failed to update saved recipe:', error);    }  };
  
  // Insert handleTagsChange function for TagSelector
  const handleTagsChange = (tags: string[]) => {
    setRecipeTags(tags);
  };
  
  const handleShareRecipe = async () => {
    if (!recipe) return;
    
    try {
      const ingredientsList = recipe.ingredients.map(ingredient => `• ${ingredient}`).join('\n');
      const stepsList = recipe.steps.map((step, index) => `${index + 1}. ${step.instruction}`).join('\n\n');
      const totalTime = calculateTotalTime();
      
      const shareText = `${recipe.title}\n\n${recipe.description}\n\n` +
        `Prep Time: ${recipe.prepTime} | Cook Time: ${recipe.cookTime} | Total Time: ${totalTime} | Servings: ${recipe.servings}\n\n` +
        `INGREDIENTS:\n${ingredientsList}\n\n` +
        `DIRECTIONS:\n${stepsList}\n\n` +
        `Shared from ReciptAI`;
        
      await Share.share({
        message: shareText,
        title: recipe.title
      });
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Failed to share recipe:', error);
    }
  };

  const handleRateRecipe = (rating: number) => {
    setRatingValue(rating);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Toast.show({
      type: 'success',
      text1: 'Recipe Rated',
      text2: `You've rated this recipe ${rating} stars!`,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };
  
  const handleMarkAsCooked = () => {
    setHasCooked(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Toast.show({
      type: 'success',
      text1: 'Recipe Completed',
      text2: 'Great job! Recipe marked as cooked.',
      position: 'bottom',
      visibilityTime: 2000,
    });
  };
  
  const handleDemoRecipe = () => {
    // Logic to load a demo recipe would go here
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Close the tutorial modal if it's open
    setShowTutorial(false);
    
    // Navigate to the Create tab with some pre-filled ingredients
    router.push({
      pathname: '/',
      params: { preset: 'pancakes' }
    });
  };
  
  const calculateTotalTime = () => {
    if (!recipe) return '';
    
    // Extract numeric values from prepTime and cookTime
    const prepTimeMatch = recipe.prepTime.match(/(\d+)/);
    const cookTimeMatch = recipe.cookTime.match(/(\d+)/);
    
    if (!prepTimeMatch || !cookTimeMatch) {
      return '';
    }
    
    const prepMinutes = parseInt(prepTimeMatch[0], 10);
    const cookMinutes = parseInt(cookTimeMatch[0], 10);
    const totalMinutes = prepMinutes + cookMinutes;
    
    // Convert to hours and minutes if needed
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      if (minutes === 0) {
        return `${hours} hr`;
      } else {
        return `${hours} hr ${minutes} min`;
      }
    } else {
      return `${totalMinutes} min`;
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=2029&auto=format&fit=crop' }}
            style={styles.errorImage}
            contentFit="cover"
          />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{getUserFriendlyErrorMessage(error)}</Text>
          <Button 
            title="Try Again" 
            onPress={handleNewRecipe} 
            style={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Creating your recipe..." />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.container, styles.emptyStateContainer]}>
        <LinearGradient
          colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.emptyContainer}>
          {/* Use our custom animation component instead of the previous implementation */}
          <EmptyStateAnimation 
            style={styles.emptyImageContainer} 
            size={200}
          />
          
          <Text style={styles.emptyTitle}>
            No Recipe Yet{userProfile?.name ? `, ${userProfile.name}` : ''}
          </Text>
          <Text style={styles.emptyMessage}>
            Go to the Create tab to generate a recipe with your ingredients.
          </Text>
          
          {/* Using our custom PulseButton component instead of Reanimated.View with Button */}
          <PulseButton 
            title="Get Started" 
            onPress={() => router.push('/')} 
            style={styles.emptyButton}
            gradientColors={['#28A745', '#F4A261']}
            icon={<ChefHat size={18} color="white" style={{ marginRight: 8 }} />}
            accessibilityLabel="Create a new recipe"
            accessibilityHint="Navigates to the Create tab to generate a recipe"
          />
          
          {/* Quick Start Option */}
          <Pressable 
            style={styles.quickStartButton}
            onPress={handleDemoRecipe}
            accessibilityLabel="Try a quick recipe suggestion"
          >
            <Sparkles size={16} color={colors.secondary} style={{ marginRight: 8 }} />
            <Text style={styles.quickStartText}>Try Quick Recipe</Text>
          </Pressable>
          
          {/* Tutorial Link */}
          <Pressable 
            style={styles.helpButton}
            onPress={() => setShowTutorial(true)}
            accessibilityLabel="Need help? Tap to learn how to use the app"
          >
            <HelpCircle size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.helpButtonText}>Need Help?</Text>
          </Pressable>
        </View>
        
        {/* Tutorial Modal */}
        <TutorialModal
          visible={showTutorial}
          onClose={() => setShowTutorial(false)}
          onStartDemo={handleDemoRecipe}
        />
      </View>
    );
  }

  const totalTime = calculateTotalTime();

  return (
    <View style={styles.container}>
      {/* Hero Image Section with Parallax */}
      <View style={styles.heroContainer}>
        <Reanimated.View style={[styles.heroImageWrapper, heroImageAnimatedStyle]}>
          <Image
            source={{ uri: recipe.heroImage || recipe.steps[0]?.imageUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop' }}
            style={styles.heroImage}
            contentFit="cover"
          />
        </Reanimated.View>
        
        {/* Enhanced gradient overlay for better readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
          style={styles.heroGradient}
          pointerEvents="none"
        />
        
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Pressable 
            style={styles.actionButton} 
            onPress={handleToggleSave}
            onLongPress={() => Alert.alert('Save Recipe', 'Save this recipe to your collection')}
          >
            <Bookmark 
              size={24} 
              color="white"
              fill={isRecipeSaved ? 'white' : 'none'}
            />
          </Pressable>
          
          <Pressable 
            style={styles.actionButton} 
            onPress={handleToggleFavorite}
            onLongPress={() => Alert.alert('Favorite', 'Add this recipe to your favorites')}
          >
            <Heart 
              size={24} 
              color="white" 
              fill={isFavorited ? 'white' : 'none'} 
            />
          </Pressable>
          
          <Pressable 
            style={styles.actionButton} 
            onPress={() => {
              Alert.alert('Rate Recipe', 'How would you rate this recipe?', [
                { text: '1 ★', onPress: () => handleRateRecipe(1) },
                { text: '2 ★★', onPress: () => handleRateRecipe(2) },
                { text: '3 ★★★', onPress: () => handleRateRecipe(3) },
                { text: '4 ★★★★', onPress: () => handleRateRecipe(4) },
                { text: '5 ★★★★★', onPress: () => handleRateRecipe(5) },
                { text: 'Cancel', style: 'cancel' }
              ]);
            }}
            onLongPress={() => Alert.alert('Rate Recipe', 'Rate this recipe from 1 to 5 stars')}
          >
            <Star size={24} color="white" fill={ratingValue > 0 ? 'white' : 'none'} />
          </Pressable>
          
          <Pressable 
            style={styles.actionButton} 
            onPress={handleShareRecipe}
            onLongPress={() => Alert.alert('Share Recipe', 'Share this recipe with friends')}
          >
            <Share2 size={24} color="white" />
          </Pressable>
        </View>

        {/* Hero title overlay */}
        <View style={styles.heroTitleContainer}>
          {recipe.category && (
            <CategoryTag category={recipe.category} size="small" />
          )}
          <Text style={styles.heroTitle}>{recipe.title}</Text>
          <Text style={styles.heroSubtitle}>{recipe.description}</Text>
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <View style={styles.dragHandle} />
        
        <Reanimated.ScrollView 
          contentContainerStyle={styles.scrollContent}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          stickyHeaderIndices={[0]}
        >
          {/* Sticky header */}
          <View style={styles.stickyHeaderContainer}>
            {headerVisible && (
              <View style={styles.stickyHeader}>
                <Text style={styles.stickyTitle} numberOfLines={1}>{recipe.title}</Text>
                <View style={styles.stickyHeaderActions}>
                  <Pressable style={styles.stickyActionButton} onPress={handleToggleSave}>
                    <Bookmark 
                      size={20} 
                      color={colors.primary} 
                      fill={isRecipeSaved ? colors.primary : 'none'}
                    />
                  </Pressable>
                  <Pressable style={styles.stickyActionButton} onPress={handleToggleFavorite}>
                    <Heart 
                      size={20} 
                      color={colors.primary} 
                      fill={isFavorited ? colors.primary : 'none'} 
                    />
                  </Pressable>
                  <Pressable style={styles.stickyActionButton} onPress={handleShareRecipe}>
                    <Share2 size={20} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
          
          {/* Info Pills with icons in subtle background */}
          <View style={styles.pillsContainer}>
            <View style={styles.pill}>
              <Clock size={18} color={colors.accentBlue} />
              <Text style={styles.pillText}>
                <Text style={styles.pillHighlight}>{recipe.prepTime}</Text> prep
              </Text>
            </View>
            
            <View style={styles.pill}>
              <Flame size={18} color={colors.accentOrange} />
              <Text style={styles.pillText}>
                <Text style={styles.pillHighlight}>{recipe.cookTime}</Text> cook
              </Text>
            </View>
            
            {totalTime && (
              <View style={[styles.pill, styles.totalTimePill]}>
                <TimerOff size={18} color={colors.success} />
                <Text style={styles.pillText}>
                  <Text style={styles.pillHighlight}>{totalTime}</Text> total
                </Text>
              </View>
            )}
            
            <View style={styles.pill}>
              <Users size={18} color={colors.accentYellow} />
              <Text style={styles.pillText}>
                <Text style={styles.pillHighlight}>{recipe.servings}</Text> servings
              </Text>
            </View>

            <View style={styles.pill}>
              <Coffee size={18} color={colors.secondary} />
              <Text style={styles.pillText}>
                <Text style={styles.pillHighlight}>8 pancakes</Text> yield
              </Text>
            </View>
          </View>
          
          {/* Collapsible Nutritional Information */}
          {recipe.nutritionInfo && (
            <View style={styles.nutritionContainer}>
              <Pressable 
                style={styles.nutritionHeader}
                onPress={() => setShowNutrition(!showNutrition)}
              >
                <View style={styles.nutritionTitleContainer}>
                  <BarChart size={20} color={colors.text} style={styles.nutritionIcon} />
                  <Text style={styles.nutritionTitle}>Nutrition Information</Text>
                </View>
                {showNutrition ? 
                  <ChevronUp size={20} color={colors.textSecondary} /> : 
                  <ChevronDown size={20} color={colors.textSecondary} />
                }
              </Pressable>
              
              {showNutrition && (
                <View style={styles.nutritionGrid}>
                  {recipe.nutritionInfo.calories && (
                    <View>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutritionInfo.calories}</Text>
                    </View>
                  )}
                  {recipe.nutritionInfo.protein && (
                    <View>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutritionInfo.protein}</Text>
                    </View>
                  )}
                  {recipe.nutritionInfo.carbs && (
                    <View>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutritionInfo.carbs}</Text>
                    </View>
                  )}
                  {recipe.nutritionInfo.fat && (
                    <View>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutritionInfo.fat}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          
          {/* Ingredients Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <IngredientsList ingredients={recipe.ingredients} />
            
            {/* Copy Ingredients */}
            <Pressable onPress={handleCopyIngredients} style={styles.copyButton}>
              <Text style={styles.copyButtonText}>Copy Ingredients</Text>
            </Pressable>
          </View>
          
          {/* Directions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Directions</Text>
            {recipe.steps.map((step, index) => (
              <RecipeStep
                key={index}
                number={index + 1}
                instruction={step.instruction}
                imageUrl={step.imageUrl}
              />
            ))}
          </View>
          
          {/* Tags Section */}
          <View style={styles.section}>
            <TagSelector
              recipeTags={recipeTags}
              recipeTitle={recipe.title}
              ingredients={recipe.ingredients}
              onTagsChange={handleTagsChange}
            />
          </View>

          {/* "I Made This!" button */}
          <Pressable 
            style={[styles.iMadeThisButton, hasCooked && styles.iMadeThisButtonActive]}
            onPress={handleMarkAsCooked}
            disabled={hasCooked}
          >
            {hasCooked ? (
              <View style={styles.iMadeThisContent}>
                <CircleCheck size={20} color="white" />
                <Text style={styles.iMadeThisText}>Recipe Completed!</Text>
              </View>
            ) : (
              <Text style={styles.iMadeThisText}>I Made This!</Text>
            )}
          </Pressable>
          
          {/* Related Recipes Section */}
          <View style={styles.relatedRecipesSection}>
            <Text style={styles.sectionTitle}>Related Recipes</Text>
            <FlatList 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedRecipesContainer}
              data={RELATED_RECIPES}
              keyExtractor={(item) => item.id}
              renderItem={({item: relatedRecipe}) => (
                <Pressable 
                  style={styles.relatedRecipeCard}
                  onPress={() => {
                    // In a real app, you would navigate to the related recipe
                    Alert.alert('Coming Soon', 'This feature will be available soon!');
                  }}
                >
                  <Image
                    source={{ uri: relatedRecipe.image }}
                    style={styles.relatedRecipeImage}
                    contentFit="cover"
                  />
                  <View style={styles.relatedRecipeOverlay}>
                    <Text style={styles.relatedRecipeTitle}>{relatedRecipe.title}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>

          <Button
            title="Create New Recipe"
            onPress={handleNewRecipe}
            style={styles.newRecipeButton}
            variant="gradient"
          />
        </Reanimated.ScrollView>
      </View>

      {/* Toast for notifications */}
      <Toast />
    </View>
  );
}