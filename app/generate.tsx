import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack, Link, useLocalSearchParams } from 'expo-router';
import { useRecipeStore, RecipeError } from '@/stores/recipeStore';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import ErrorState from '@/components/ErrorState';
import LoadingOverlay from '@/components/LoadingOverlay';
import Button from '@/components/Button'; // Added for Cancel button
import BackArrow from '@/components/BackArrow'; // Added for header
import colors from '@/constants/colors';
import { NetworkManager } from '@/components/OfflineBanner';
import { generateRecipe, RecipeErrorType } from '@/services/recipeService';
import { LinearGradient } from 'expo-linear-gradient';

function GenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const { 
    ingredients: storeIngredients, 
    setIngredientsBatch: setStoreIngredients, 
    clearIngredients 
  } = useIngredientsStore();
  const { setHasNewRecipe } = useRecipeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<RecipeError | null>(null);
  const [generationStage, setGenerationStage] = useState<'initial' | 'text' | 'images' | 'complete'>('initial');
  
  // Subscribe to network status changes
  useEffect(() => {
    const unsubscribe = NetworkManager.addListener(setIsOffline);
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Start recipe generation as soon as the screen loads
  useEffect(() => {
    const initializeAndGenerate = async () => {
      if (isOffline) {
        // setError or show offline message, handled by UI
        return;
      }

      let currentIngredients: string[] = [];
      const isRandomGeneration = params.random === 'true';
      const mealType = params.mealType as string || 'any';

      if (params.ingredients) {
        try {
          const parsedIngredients = JSON.parse(params.ingredients as string);
          if (Array.isArray(parsedIngredients) && parsedIngredients.every(i => typeof i === 'string')) {
            currentIngredients = parsedIngredients;
            // Update store with these ingredients if they came from params
            // This ensures consistency if user navigates back/forth or if other parts rely on the store
            setStoreIngredients(currentIngredients.map(name => ({ id: name, name }))); // Simple ID for now
          }
        } catch (e) {
          console.error("Failed to parse ingredients from params:", e);
          // Fallback or error
        }
      } else if (!isRandomGeneration) {
        currentIngredients = storeIngredients.map(ing => ing.name);
      }

      if (currentIngredients.length === 0 && !isRandomGeneration) {
        router.replace('/input');
        return;
      }
      
      await generateRecipeFromIngredients(currentIngredients, isRandomGeneration, mealType);
    };

    initializeAndGenerate();

    return () => {
      // Clear ingredients from the store when the screen is unmounted
      // This is important to avoid stale ingredients if the user navigates away
      // and then comes back to input ingredients manually.
      // However, only clear if not coming from a flow that sets params.ingredients,
      // as that implies a specific set of ingredients for this generation attempt.
      // A more robust solution might involve a flag or checking navigation source.
      // For now, let's clear it to handle the common case of finishing generation.
      // This might need refinement based on exact back navigation behavior.
      // clearIngredients(); // Decided to clear explicitly on success/error/cancel
    };
  }, [params, isOffline, storeIngredients, setStoreIngredients, router]);
  
  const generateRecipeFromIngredients = async (ingredientNames: string[], isRandom: boolean = false, mealType: string = 'any') => {
    try {
      setIsLoading(true);
      setError(null);
      setGenerationStage('initial');
      
      // Stage 1: Generate recipe text
      setGenerationStage('text');
      
      const recipePayload = isRandom 
        ? { random: true, mealType } 
        : { ingredients: ingredientNames, mealType };

      const generatedRecipe = await generateRecipe(recipePayload);
      
      if (!generatedRecipe) {
        throw new Error('Failed to generate recipe');
      }
      
      // Stage 2: Simulate image generation
      setGenerationStage('images');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Shorter delay
      
      // Stage 3: Complete
      setGenerationStage('complete');
      setHasNewRecipe(true);
      clearIngredients(); // Clear store on successful generation
      router.replace(`/recipe/${generatedRecipe.id || ''}`);

    } catch (err) {
      console.error('Failed to generate recipe:', err);
      setError({
        type: err instanceof Error && err.message.includes('network') ? RecipeErrorType.NETWORK_ERROR : RecipeErrorType.GENERATE_ERROR,
        message: err instanceof Error ? err.message : 'Failed to generate recipe',
        details: err instanceof Error ? err.stack : undefined,
        timestamp: Date.now()
      });
      setIsLoading(false);
      // Do not clear ingredients on error, user might want to retry with same.
    }
  };
  
  const handleRetry = () => {
    // Re-trigger generation with the current understanding of ingredients
    // This logic might need to re-evaluate params vs store similar to useEffect
    let currentIngredients: string[] = [];
    const isRandomGeneration = params.random === 'true';
    const mealType = params.mealType as string || 'any';

    if (params.ingredients) {
      try {
        currentIngredients = JSON.parse(params.ingredients as string);
      } catch (e) { /* ignore */ }
    } else if (!isRandomGeneration) {
      currentIngredients = storeIngredients.map(ing => ing.name);
    }
    generateRecipeFromIngredients(currentIngredients, isRandomGeneration, mealType);
  };
  
  const handleGoBack = () => {
    clearIngredients(); // Clear store when explicitly going back
    router.replace('/input');
  };

  const handleCancel = () => {
    clearIngredients(); // Clear store on cancel
    router.replace('/'); // Navigate to Home
  };
  
  const getLoadingMessage = (): string => {
    const baseMessage = params.random === 'true' 
      ? `Finding a surprise ${params.mealType || 'meal'}...`
      : 'Crafting your recipe...';

    switch (generationStage) {
      case 'text':
        return params.random === 'true' ? baseMessage : 'Writing down the steps...';
      case 'images':
        return params.random === 'true' ? 'Adding some flair...' : 'Visualizing the dish...';
      case 'complete':
        return 'Almost ready!';
      default:
        return baseMessage;
    }
  };
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ title: 'Generation Error', headerShown: true, headerBackVisible: false }} />
        <View style={styles.errorContainer}>
          <ErrorState
            title="Couldn't Generate Recipe"
            message={error.message || "Something went wrong. Please try again."}
            retryButtonText="Try Again"
            onRetry={handleRetry}
          />
          <View style={styles.backButtonContainer}>
            <LinearGradient colors={['#FF8C61', '#F96E43']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <TouchableOpacity onPress={handleGoBack} style={{width: '100%', alignItems: 'center'}}>
                <Text style={styles.gradientButtonText}>Back to Ingredients</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  if (isOffline) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ title: 'Offline', headerShown: true, headerBackVisible: false }} />
        <View style={styles.errorContainer}>
          <ErrorState
            title="You're Offline"
            message="Recipe generation needs an internet connection. Please check your connection and try again."
            retryButtonText="Retry"
            onRetry={handleRetry} // Retry will re-check offline status
          />
          <View style={styles.backButtonContainer}>
             <LinearGradient colors={['#FF8C61', '#F96E43']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <TouchableOpacity onPress={handleGoBack} style={{width: '100%', alignItems: 'center'}}>
                <Text style={styles.gradientButtonText}>Back to Ingredients</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen options={{
        title: params.random === 'true' ? 'Surprise Me!' : 'Creating Your Recipe',
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={handleCancel} style={{ marginLeft: Platform.OS === 'ios' ? 16 : 0 }}>
            <BackArrow />
          </TouchableOpacity>
        ),
        headerBackVisible: false,
      }} />
      
      <LoadingOverlay message={getLoadingMessage()} />
      
      <View style={styles.cancelButtonContainer}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

export default GenerateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Use consistent background
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24, // Increased padding
  },
  backButtonContainer: {
    marginTop: 24, // Increased spacing
    width: '100%',
  },
  gradientButton: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20, // Adjust for platform
    left: 24, // Consistent padding
    right: 24, // Consistent padding
  },
  cancelButton: {
    backgroundColor: colors.textTertiary, // Use color from constants
    borderColor: colors.textTertiary,
  },
  cancelButtonText: {
    color: colors.textSecondary, // Contrasting text color
  },
});
