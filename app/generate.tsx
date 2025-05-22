import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack, Link, useLocalSearchParams } from 'expo-router';
import { useRecipeStore, RecipeError } from '@/stores/recipeStore';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import ErrorState from '@/components/ErrorState';
import GenerationProgress from '@/components/GenerationProgress';
import RecipePreview from '@/components/RecipePreview';
import Button from '@/components/Button';
import BackArrow from '@/components/BackArrow';
import colors from '@/constants/colors';
import { NetworkManager } from '@/components/OfflineBanner';
import { generateRecipe, RecipeErrorType, Recipe } from '@/services/recipeService';
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
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  
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
      // Cleanup function - no need to clear ingredients here
    };
  }, [params, isOffline, storeIngredients, setStoreIngredients, router]);
  
  const generateRecipeFromIngredients = async (ingredientNames: string[], isRandom: boolean = false, mealType: string = 'any') => {
    try {
      setIsLoading(true);
      setError(null);
      setGeneratedRecipe(null);
      setGenerationStage('initial');
      
      // Stage 1: Generate recipe text
      setGenerationStage('text');
      
      const recipePayload = isRandom 
        ? { random: true, mealType } 
        : { ingredients: ingredientNames, mealType };

      const recipe = await generateRecipe(recipePayload);
      
      if (!recipe) {
        throw new Error('Failed to generate recipe');
      }
      
      // Stage 2: Simulate image generation
      setGenerationStage('images');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Shorter delay
      
      // Stage 3: Complete
      setGenerationStage('complete');
      setIsLoading(false);
      setHasNewRecipe(true);
      setGeneratedRecipe(recipe);

    } catch (err) {
      console.error('Failed to generate recipe:', err);
      setError({
        type: err instanceof Error && err.message.includes('network') ? RecipeErrorType.NETWORK_ERROR : RecipeErrorType.GENERATE_ERROR,
        message: err instanceof Error ? err.message : 'Failed to generate recipe',
        details: err instanceof Error ? err.stack : undefined,
        timestamp: Date.now()
      });
      setIsLoading(false);
    }
  };
  
  const handleRetry = () => {
    // Re-trigger generation with the current understanding of ingredients
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

  const handleViewFullRecipe = () => {
    if (generatedRecipe) {
      clearIngredients(); // Clear store on successful navigation
      router.replace(`/recipe/${generatedRecipe.id}`);
    }
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
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen options={{
        title: params.random === 'true' ? 'Surprise Me!' : 'Creating Your Recipe',
        headerShown: true,
        headerLeft: () => (
          <View style={{ marginLeft: Platform.OS === 'ios' ? 16 : 0 }}>
            <BackArrow onClick={handleCancel} />
          </View>
        ),
        headerBackVisible: false,
      }} />
      
      {isLoading ? (
        <GenerationProgress 
          stage={generationStage} 
          message={getLoadingMessage()} 
        />
      ) : generatedRecipe ? (
        <RecipePreview 
          recipe={generatedRecipe}
          onViewFullRecipe={handleViewFullRecipe}
          onTryAgain={handleRetry}
        />
      ) : null}
      
      {isLoading && (
        <View style={styles.cancelButtonContainer}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            variant="secondary"
          />
        </View>
      )}
    </SafeAreaView>
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
    padding: 20,
  },
  backButtonContainer: {
    marginTop: 16,
    width: '80%',
    maxWidth: 300,
  },
  gradientButton: {
    borderRadius: 25,
    overflow: 'hidden',
    paddingVertical: 12,
  },
  gradientButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  cancelButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: colors.cancelButtonGray || '#E0E0E0',
    paddingHorizontal: 24,
    minWidth: 120,
  },
  cancelButtonText: {
    color: colors.textTertiary,
  },
});

export default GenerateScreen;
