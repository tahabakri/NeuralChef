import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, BookmarkPlus, Share2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import components
import StepList from '@/components/StepList';
import IngredientList from '@/components/IngredientList';
import StarRating from '@/components/StarRating';
import SaveButton from '@/components/SaveButton';
import ErrorScreen from '@/components/ErrorScreen';

// Import stores
import { useRecipeStore, Recipe } from '@/stores/recipeStore'; // Import Recipe type
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import colors from '@/constants/colors';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipeId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  
  // Get stores
  const { selectedRecipe: currentRecipe } = useRecipeStore(); // Corrected to selectedRecipe
  const { savedRecipes, saveRecipe, removeSavedRecipe, isSaved: storeIsSaved } = useSavedRecipesStore(); // Corrected function names and aliased isSaved
  
  // State for this recipe
  const [recipe, setRecipe] = useState<Recipe | null>(null); // Typed state
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    const loadRecipe = async () => {
      setLoading(true);
      
      // If we have a matching current recipe, use it
      if (currentRecipe && currentRecipe.id === recipeId) {
        setRecipe(currentRecipe);
        setIsSaved(storeIsSaved(currentRecipe.title)); // Use title and corrected function
      } else {
        // Try to find in saved recipes
        const savedRecipe = savedRecipes.find(r => r.id === recipeId);
        if (savedRecipe) {
          setRecipe(savedRecipe); // This should be fine with typed useState
          setIsSaved(true); // Already known to be saved
        } else {
          // Recipe not found
          setRecipe(null);
          Alert.alert('Recipe Not Found', 'The requested recipe could not be found.');
          router.back();
        }
      }
      
      setLoading(false);
    };
    
    loadRecipe();
  }, [recipeId, currentRecipe, savedRecipes, storeIsSaved]); // Added storeIsSaved to dependencies
  
  // Handle rating change
  const handleRating = (rating: number) => { // Typed parameter
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserRating(rating);
    
    // In a real app, you would save this rating to your backend
    Alert.alert('Thanks for Rating', `You've rated this recipe ${rating} stars.`);
  };
  
  // Toggle save recipe
  const toggleSaveRecipe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!recipe) return; // Guard against null recipe

    if (isSaved) {
      removeSavedRecipe(recipe.title); // Use title
      // setIsSaved(false); // State will update reactively from useEffect
    } else {
      saveRecipe(recipe); // Corrected function name
      // setIsSaved(true); // State will update reactively from useEffect
    }
  };
  
  // Share recipe
  const shareRecipe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!recipe) return; // Guard against null recipe

    try {
      const ingredientsText = recipe.ingredients.map(ing => `${ing.amount} ${ing.unit || ''} ${ing.name}`).join('\n');
      const stepsText = recipe.steps.map((step: { instruction: string }, i: number) => // Typed parameters
          `${i + 1}. ${step.instruction}`).join('\n');

      const shareMessage = `Check out this recipe for ${recipe.title}!\n\n` +
        `🍽️ Ingredients:\n${ingredientsText}\n\n` + // Corrected ingredients formatting
        `👨‍🍳 Instructions:\n${stepsText}\n\n` +
        'Generated with ReciptAI';
      
      await Share.share({
        message: shareMessage,
        title: recipe.title, // recipe is confirmed not null here
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  if (loading || !recipe) {
    return <ErrorScreen message="Loading recipe..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.heroContainer}>
          {recipe.heroImage ? (
            <Image
              source={{ uri: recipe.heroImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]} />
          )}
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={toggleSaveRecipe}
            >
              <BookmarkPlus size={24} color={isSaved ? colors.primary : 'white'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={shareRecipe}
            >
              <Share2 size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.description}>{recipe.description}</Text>
            <StarRating rating={userRating} onRatingChange={handleRating} />
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <IngredientList ingredients={recipe.ingredients.map(ing => `${ing.amount || ''} ${ing.unit || ''} ${ing.name}`.trim())} />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Steps</Text>
            <StepList steps={recipe.steps} />
          </View>
          
          <SaveButton
            recipe={recipe} // Pass recipe object
            style={styles.saveButton}
            // isSaved and onPress are handled internally by SaveButton or not applicable
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#e0e0e0',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
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
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  actionButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
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
    marginLeft: 8,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 30,
  },
}); 