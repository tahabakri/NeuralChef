import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Pressable, Alert, Share, Animated, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ChevronLeft, Clock, Users, Flame, Heart, Share2, TimerOff, Bookmark, BarChart, Star, ChevronDown, ChevronUp, Coffee, CircleCheck, ChefHat } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import Reanimated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, interpolate, useAnimatedScrollHandler } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import Button from '@/components/Button';import RecipeStep from '@/components/RecipeStep';import IngredientsList from '@/components/IngredientList';import LoadingOverlay from '@/components/LoadingOverlay';import CategoryTag from '@/components/CategoryTag';
import colors from '@/constants/colors';
import { useRecipeStore, getUserFriendlyErrorMessage } from '@/stores/recipeStore';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';

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

export default function RecipeScreen() {
  const { recipe, isLoading, error, clearRecipe, addToFavorites, removeFromFavorites, isFavorite } = useRecipeStore();
  const { saveRecipe, removeSavedRecipe, isSaved } = useSavedRecipesStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRecipeSaved, setIsRecipeSaved] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [showNutrition, setShowNutrition] = useState(true);
  const [ratingValue, setRatingValue] = useState(0);
  const [hasCooked, setHasCooked] = useState(false);
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

  useEffect(() => {
    if (recipe) {
      setIsFavorited(isFavorite(recipe.title));
      setIsRecipeSaved(isSaved(recipe.title));
    }
  }, [recipe, isFavorite, isSaved]);

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
  
  const handleToggleSave = async () => {
    if (!recipe) return;
    
    try {
      if (isRecipeSaved) {
        await removeSavedRecipe(recipe.title);
        setIsRecipeSaved(false);
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        Alert.alert('Recipe Removed', 'Recipe removed from your saved collection');
      } else {
        await saveRecipe(recipe);
        setIsRecipeSaved(true);
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        Alert.alert('Recipe Saved', 'Recipe added to your saved collection');
      }
    } catch (error) {
      console.error('Failed to update saved recipe:', error);
    }
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
    // Using the hooks that were moved to the top level
    return (
      <View style={[styles.container, styles.emptyStateContainer]}>
        <LinearGradient
          colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.emptyContainer}>
          <Reanimated.View style={[styles.emptyImageContainer, animatedImageStyle]}>
            <Image
              source={require('@/assets/images/empty-plate.png')}
              style={styles.emptyImage}
              contentFit="contain"
            />
          </Reanimated.View>
          <Text style={styles.emptyTitle}>No Recipe Yet</Text>
          <Text style={styles.emptyMessage}>
            Go to the Create tab to generate a recipe with your ingredients.
          </Text>
          <Reanimated.View style={animatedButtonStyle}>
            <Button 
              title="Create Recipe" 
              onPress={() => router.push('/')} 
              style={styles.emptyButton}
              variant="gradient"
              icon={<ChefHat size={18} color="white" style={{ marginRight: 8 }} />}
              accessibilityLabel="Create a new recipe"
            />
          </Reanimated.View>
        </View>
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
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutritionInfo.calories}</Text>
                    </View>
                  )}
                  {recipe.nutritionInfo.protein && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutritionInfo.protein}</Text>
                    </View>
                  )}
                  {recipe.nutritionInfo.carbs && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                      <Text style={styles.nutritionValue}>{recipe.nutritionInfo.carbs}</Text>
                    </View>
                  )}
                  {recipe.nutritionInfo.fat && (
                    <View style={styles.nutritionItem}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyStateContainer: {
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 24, // Increased from original
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
  stickyHeaderActions: {
    flexDirection: 'row',
  },
  stickyActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginTop: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  totalTimePill: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)', // Subtle highlight for total time
  },
  pillText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  pillHighlight: {
    fontWeight: '600',
    color: colors.text,
  },
  nutritionContainer: {
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 12,
  },
  nutritionItem: {
    width: '50%',
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  ingredientsList: {
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
    marginTop: 8,
    marginRight: 8,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  copyButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  copyButtonText: {
    fontSize: 16,
    color: colors.accentBlue,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  iMadeThisButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iMadeThisButtonActive: {
    backgroundColor: colors.success,
  },
  iMadeThisContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iMadeThisText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  relatedRecipesSection: {
    marginBottom: 24,
  },
  relatedRecipesContainer: {
    paddingBottom: 8,
  },
  relatedRecipeCard: {
    width: 160,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  relatedRecipeTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  newRecipeButton: {
    marginTop: 32,
    borderRadius: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  emptyImageContainer: {
    width: 180,
    height: 180,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: '100%',
    height: '100%',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 180,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButton: {
    minWidth: 120,
  },
});