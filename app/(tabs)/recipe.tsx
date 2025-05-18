import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import RecipeView from '@/components/RecipeView';
import LoadingOverlay from '@/components/LoadingOverlay';
import Button from '@/components/Button';
import { useRecipe, useRecipeLoading, useRecipeError, getUserFriendlyErrorMessage } from '@/stores/recipeStore';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import colors from '@/constants/colors';

export default function RecipeScreen() {
  const router = useRouter();
  
  // Get recipe from store using dedicated selectors
  const recipe = useRecipe();
  const recipeLoading = useRecipeLoading(); // Matches original variable name 'recipeLoading'
  const error = useRecipeError();
  const { savedRecipes, saveRecipe, removeSavedRecipe, isSaved } = useSavedRecipesStore();
  
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
      <RecipeView 
        recipe={recipe}
        isSaved={isSaved(recipe.title)}
        onBack={handleBack}
        onToggleSave={(recipeId) => {
          const recipeIsSaved = isSaved(recipe.title);
          if (recipeIsSaved) {
            removeSavedRecipe(recipe.title);
          } else {
            saveRecipe(recipe);
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
});
