import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Heart, Clock, Share2 } from 'lucide-react-native';

import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Components
import BackArrow from '@/components/BackArrow';
import RecipeHeader from '@/components/RecipeHeader';
import SaveButton from '@/components/SaveButton';
import ImageStep from '@/components/ImageStep';
import NutritionalInfo from '@/components/NutritionalInfo';
import IngredientList from '@/components/IngredientList';
import StepList from '@/components/StepList';
import ProgressBar from '@/components/ProgressBar';
import ShareModal from '@/components/ShareModal';
import StarRating from '@/components/StarRating'; // Imported StarRating
import LottieIllustration from '@/components/LottieIllustration';
import Button from '@/components/Button';

// Stores & Services
// import { type Recipe as ServiceRecipe } from '@/services/recipeService'; // Commenting out as we use local mock
import { getMockRecipeById } from '@/utils/mockRecipes'; // Import the mock recipe getter

// Mock data structure for a recipe
interface Ingredient {
  id?: string; // Added optional id
  name: string;
  amount?: string;
  unit?: string;
}

interface RecipeStep {
  id?: string; // Added optional id
  step: number;
  description: string;
  completed?: boolean;
}

// Removed the duplicate, non-exported Recipe interface.
// The exported one below is now the single source of truth.

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string; // Changed from imageUrl to image
  ingredients: Ingredient[];
  steps: RecipeStep[];
  cookTime: number;
  prepTime?: number; // Added optional prepTime
  servings: number;
  difficulty?: string; // Added optional difficulty
  cuisine?: string; // Added optional cuisine
  isSaved?: boolean; // Added optional isSaved
  mealType?: string; // Added optional mealType
  calories?: number;
  protein?: number;
  rating?: number;
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2]); // Steps 1 and 2 are completed

  useEffect(() => {
    const loadRecipe = () => {
      setIsLoading(true);
      setError(null);
      if (!id) {
        setError("Recipe ID is missing.");
        setIsLoading(false);
        setRecipe(null);
        return;
      }

      // Simulate API call delay
      setTimeout(() => {
        try {
          const foundRecipe = getMockRecipeById(id);
          if (foundRecipe) {
            setRecipe(foundRecipe);
          } else {
            setError(`Recipe with ID "${id}" not found.`);
            setRecipe(null);
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load recipe details.');
          setRecipe(null);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    };

    loadRecipe();
  }, [id]);

  const toggleStepCompletion = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter(step => step !== stepNumber));
    } else {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Recipe...</Text>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error || 'Recipe not found.'}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // Calculate progress percentage
  const progress = completedSteps.length / recipe.steps.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" /> 
      
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#333" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity style={styles.headerButton}>
                <Heart size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Share2 size={24} color="#333" />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: { backgroundColor: '#FFF8EC' },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image 
          source={{ uri: recipe.image }} // Changed from recipe.imageUrl
          style={styles.recipeImage}
          resizeMode="cover"
        />
        
        <View style={styles.contentContainer}>
          <TouchableOpacity style={styles.nutritionCard}>
            <View>
              <Text style={styles.sectionTitle}>Nutritional Info</Text>
              <Text style={styles.nutritionText}>
                {recipe.calories} kcal • {recipe.protein} g protein
              </Text>
            </View>
            <ChevronLeft 
              size={24} 
              color="#999" 
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.ingredientText}>{ingredient.name}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>6 Steps</Text>
          <View style={styles.stepsList}>
            {recipe.steps.map((step) => (
              <TouchableOpacity 
                key={step.step} 
                style={styles.stepItem}
                onPress={() => toggleStepCompletion(step.step)}
              >
                <View style={[
                  styles.stepCheckbox, 
                  completedSteps.includes(step.step) && styles.stepCheckboxChecked
                ]}>
                  {completedSteps.includes(step.step) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{step.description}</Text>
                  {step.step === 2 && (
                    <View style={styles.timeIndicator}>
                      <Clock size={16} color="#555" />
                      <Text style={styles.timeText}>5 min</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {completedSteps.length} of {recipe.steps.length} steps completed ({Math.round(progress * 100)}%)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8EC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF8EC',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerRightContainer: {
    flexDirection: 'row',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  recipeImage: {
    width: '100%',
    height: 300,
  },
  contentContainer: {
    padding: 16,
  },
  nutritionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDF3',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  nutritionText: {
    fontSize: 18,
    color: '#555',
  },
  ingredientsList: {
    marginBottom: 24,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  bulletPoint: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 18,
    color: '#333',
  },
  stepsList: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepCheckboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
