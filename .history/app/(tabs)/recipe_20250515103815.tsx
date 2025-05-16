import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Pressable, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ChevronLeft, Clock, Users, Flame, Heart, Share2, TimerOff } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import Button from '@/components/Button';
import RecipeStep from '@/components/RecipeStep';
import IngredientsList from '@/components/IngredientList';
import LoadingOverlay from '@/components/LoadingOverlay';
import colors from '@/constants/colors';
import { useRecipeStore } from '@/stores/recipeStore';

export default function RecipeScreen() {
  const { recipe, isLoading, error, clearRecipe, addToFavorites, removeFromFavorites, isFavorite } = useRecipeStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (recipe) {
      setIsFavorited(isFavorite(recipe.title));
    }
  }, [recipe, isFavorite]);

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
      
      Alert.alert('Copied', 'Ingredients copied to clipboard');
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
  
  const handleShareRecipe = async () => {
    if (!recipe) return;
    
    try {
      const ingredientsList = recipe.ingredients.map(ingredient => `• ${ingredient}`).join('\n');
      const stepsList = recipe.steps.map((step, index) => `${index + 1}. ${step.instruction}`).join('\n\n');
      
      const shareText = `${recipe.title}\n\n${recipe.description}\n\n` +
        `Prep Time: ${recipe.prepTime} | Cook Time: ${recipe.cookTime} | Servings: ${recipe.servings}\n\n` +
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
          <Text style={styles.errorMessage}>{error}</Text>
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
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=2076&auto=format&fit=crop' }}
            style={styles.emptyImage}
            contentFit="cover"
          />
          <Text style={styles.emptyTitle}>No Recipe Yet</Text>
          <Text style={styles.emptyMessage}>
            Go to the Create tab to generate a recipe with your ingredients.
          </Text>
          <Button 
            title="Create Recipe" 
            onPress={() => router.push('/')} 
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  const totalTime = calculateTotalTime();

  return (
    <View style={styles.container}>
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: recipe.steps[0]?.imageUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={handleToggleFavorite}>
            <Heart 
              size={24} 
              color="white" 
              fill={isFavorited ? 'white' : 'none'} 
            />
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={handleShareRecipe}>
            <Share2 size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <View style={styles.dragHandle} />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            setHeaderVisible(offsetY > 50);
          }}
          scrollEventThrottle={16}
        >
          {/* Sticky header if needed */}
          {headerVisible && (
            <View style={styles.stickyHeader}>
              <Text style={styles.stickyTitle} numberOfLines={1}>{recipe.title}</Text>
            </View>
          )}
          
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
          
          {/* Info Pills */}
          <View style={styles.pillsContainer}>
            <View style={styles.pill}>
              <Clock size={16} color={colors.accentBlue} />
              <Text style={styles.pillText}>
                <Text style={styles.pillHighlight}>{recipe.prepTime}</Text> prep
              </Text>
            </View>
            
            <View style={styles.pill}>
              <Flame size={16} color={colors.accentOrange} />
              <Text style={styles.pillText}>
                <Text style={styles.pillHighlight}>{recipe.cookTime}</Text> cook
              </Text>
            </View>
            
            {totalTime && (
              <View style={styles.pill}>
                <TimerOff size={16} color={colors.success} />
                <Text style={styles.pillText}>
                  <Text style={styles.pillHighlight}>{totalTime}</Text> total
                </Text>
              </View>
            )}
            
            <View style={styles.pill}>
              <Users size={16} color={colors.accentYellow} />
              <Text style={styles.pillText}>
                <Text style={styles.pillHighlight}>{recipe.servings}</Text> servings
              </Text>
            </View>
          </View>
          
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
          
          <Button
            title="Create New Recipe"
            onPress={handleNewRecipe}
            style={styles.newRecipeButton}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    height: 280,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: colors.card,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 100,
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    fontSize: 28,
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
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  pillHighlight: {
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
  newRecipeButton: {
    marginTop: 32,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    minWidth: 200,
    borderRadius: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorButton: {
    minWidth: 200,
    borderRadius: 16,
  },
});