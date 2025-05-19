import React from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import RecipeView from '@/components/RecipeView';
import LoadingOverlay from '@/components/LoadingOverlay';
import Button from '@/components/Button';
import { useRecipe, useRecipeLoading, useRecipeError } from '@/stores/recipeStore';
import { type Recipe as ServiceRecipe, getUserFriendlyErrorMessage, Difficulty, type Ingredient } from '@/services/recipeService';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import colors from '@/constants/colors';
import { useUndoStore } from '@/stores/undoStore';
import BackArrow from '@/components/BackArrow';

export default function RecipeScreen() {
  const router = useRouter();
  const recipe = useRecipe();
  const recipeLoading = useRecipeLoading();
  const error = useRecipeError();
  const { savedRecipes, saveRecipe, removeSavedRecipe, isSaved } = useSavedRecipesStore();
  const { setCurrentScreen } = useUndoStore();
  
  // Set current screen for undo functionality
  React.useEffect(() => {
    setCurrentScreen('recipe');
  }, [setCurrentScreen]);
  
  // Navigate to input
  const handleNewRecipe = () => {
    router.push('/input');
  };
  
  // Navigate back
  const handleBack = () => {
    router.back();
  };
  
  // Show loading screen while recipe is being loaded
  if (recipeLoading) {
    return <LoadingOverlay message="Loading recipe..." />;
  }
  
  // Show error message if there was an error
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>{getUserFriendlyErrorMessage(error)}</Text>
          <Button 
            title="Create New Recipe"
            onPress={handleNewRecipe}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  // Show empty state if there's no recipe
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No Recipe Found</Text>
          <Text style={styles.errorMessage}>Let's start by creating a recipe with your ingredients.</Text>
          <Button 
            title="Create Recipe"
            onPress={handleNewRecipe}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.backContainer}>
        <BackArrow />
      </View>
      <RecipeView
        recipe={{
          id: recipe.id,
          title: recipe.title,
          description: recipe.description || '', // Ensure description is not undefined
          ingredients: recipe.ingredients.map(ing => `${ing.amount || ''} ${ing.unit || ''} ${ing.name}`.trim()),
          steps: recipe.steps.map(s => ({ instruction: s.instruction })),
          heroImage: recipe.heroImage,
          cookTime: recipe.cookTime ? `${recipe.cookTime} min` : undefined,
          prepTime: 'N/A',
          servings: 4, // Default servings as it's not in store recipe
          rating: recipe.rating,
          category: recipe.tags?.[0] // Use first tag as category
        }}
        isSaved={isSaved(recipe.title)}
        onBack={handleBack}
        onToggleSave={() => {
          const recipeIsSaved = isSaved(recipe.title);
          if (recipeIsSaved) {
            removeSavedRecipe(recipe.title);
          } else {
            // Transform recipe to ServiceRecipe for saving
            const recipeToSave: ServiceRecipe = {
              id: recipe.id,
              title: recipe.title,
              description: recipe.description || '',
              cookTime: recipe.cookTime,
              ingredients: recipe.ingredients,
              heroImage: recipe.heroImage,
              steps: recipe.steps,
              difficulty: 'Medium' as Difficulty, // Default difficulty
              rating: recipe.rating || 3.5, // Default rating if not available
              tags: recipe.tags || []
            };
            saveRecipe(recipeToSave);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorButton: {
    minWidth: 200,
  },
  backContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    zIndex: 10,
  }
});
