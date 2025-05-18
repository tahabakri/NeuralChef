import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { useRecipeStore, RecipeError } from '@/stores/recipeStore';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import ErrorState from '@/components/ErrorState';
import LoadingOverlay from '@/components/LoadingOverlay';
import colors from '@/constants/colors';
import { NetworkManager } from '@/components/OfflineBanner';
import { generateRecipe } from '@/services/recipeService';
import { LinearGradient } from 'expo-linear-gradient';

function GenerateScreen() {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const { ingredients } = useIngredientsStore();
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
    if (isOffline) {
      // Handle offline state
      return;
    }
    
    if (ingredients.length === 0) {
      // Redirect back to input if no ingredients
      router.replace('/input');
      return;
    }
    
    // Start recipe generation
    generateRecipeFromIngredients();
  }, []);
  
  const generateRecipeFromIngredients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Extract ingredient names for generation
      const ingredientNames = ingredients.map(ing => ing.name);
      
      // Stage 1: Generate recipe text using Gemini AI
      setGenerationStage('text');
      
      // Generate the recipe
      const generatedRecipe = await generateRecipe(ingredientNames);
      
      if (!generatedRecipe) {
        throw new Error('Failed to generate recipe');
      }
      
      // Stage 2: Generate images for steps using Runware AI
      setGenerationStage('images');
      
      // In a real implementation, this would call an image generation service
      // Wait a bit to simulate image generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stage 3: Complete - store recipe and navigate
      setGenerationStage('complete');
      
      // Mark as having a new recipe
      setHasNewRecipe(true);
      
      // Navigate to recipe screen
      router.replace(`/recipe/${generatedRecipe.id || ''}`);
    } catch (err) {
      console.error('Failed to generate recipe:', err);
      
      // Set error state
      setError({
        type: err instanceof Error && err.message.includes('network') ? 'network' : 'generation',
        message: err instanceof Error ? err.message : 'Failed to generate recipe',
        details: err instanceof Error ? err.stack : undefined,
        timestamp: Date.now()
      });
      
      setIsLoading(false);
    }
  };
  
  // Retry generating the recipe
  const handleRetry = () => {
    generateRecipeFromIngredients();
  };
  
  // Go back to input screen
  const handleGoBack = () => {
    router.replace('/input');
  };
  
  // Get loading message based on generation stage
  const getLoadingMessage = (): string => {
    switch (generationStage) {
      case 'text':
        return 'Crafting your recipe...';
      case 'images':
        return 'Creating vivid recipe images...';
      case 'complete':
        return 'Finalizing your culinary masterpiece...';
      default:
        return 'Preparing ingredients...';
    }
  };
  
  // If there's an error, show error screen
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Stack.Screen options={{
          title: 'Recipe Generation',
          headerShown: true,
          headerBackVisible: false,
        }} />
        
        <View style={styles.errorContainer}>
          <ErrorState
            title="Couldn't generate a recipe"
            message="We couldn't create a recipe with these ingredients. Please try again or use different ingredients."
            retryButtonText="Try Again"
            onRetry={handleRetry}
          />
          
          <View style={styles.backButtonContainer}>
            <LinearGradient
              colors={['#FF8C61', '#F96E43']} // "Sunrise Orange" gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.gradientButtonText} onPress={handleGoBack}>
                Go Back to Ingredients
              </Text>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // If offline, show offline error
  if (isOffline) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Stack.Screen options={{
          title: 'Offline Mode',
          headerShown: true,
          headerBackVisible: false,
        }} />
        
        <View style={styles.errorContainer}>
          <ErrorState
            title="Offline Mode"
            message="Recipe generation requires an internet connection. Please connect to continue."
            retryButtonText="Try Again"
            onRetry={handleRetry}
          />
          
          <View style={styles.backButtonContainer}>
            <LinearGradient
              colors={['#FF8C61', '#F96E43']} // "Sunrise Orange" gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.gradientButtonText} onPress={handleGoBack}>
                Go Back to Ingredients
              </Text>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Loading screen during generation
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen options={{
        title: 'Creating Recipe',
        headerShown: true,
        headerBackVisible: false,
      }} />
      
      <LoadingOverlay message={getLoadingMessage()} />
      
      <View style={styles.content}>
        <Text style={styles.ingredientsText}>
          Using {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default GenerateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  ingredientsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backButtonContainer: {
    marginTop: 16,
    width: '100%',
  },
  gradientButton: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 16,
    alignItems: 'center',
  },
  gradientButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
}); 