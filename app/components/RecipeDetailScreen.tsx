import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Recipe } from '@/services/recipeService';
import { useRecipeStore } from '@/stores/recipeStore';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import colors from '@/constants/colors';

// Import our custom components
import StarRating from '@/components/StarRating';
import IngredientList from '@/components/IngredientList';
import StepList from '@/components/StepList';
import SaveButton from '@/components/SaveButton';
import ShareModal from '@/components/ShareModal';
import EditIngredients from '@/components/EditIngredients';
import RecipeCarousel from '@/components/RecipeCarousel';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipeId = params.id as string;
  
  // States
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  
  // Get store hooks
  const { recipe: storeRecipe, generateRecipe } = useRecipeStore();
  const { savedRecipes, isSaved, updateRecipe } = useSavedRecipesStore();
  
  // Load recipe on mount
  useEffect(() => {
    const loadRecipe = async () => {
      setLoading(true);
      
      try {
        // If we have a recipeId, try to find it in savedRecipes
        if (recipeId) {
          const savedRecipe = savedRecipes.find(r => r.id === recipeId);
          
          if (savedRecipe) {
            setRecipe(savedRecipe);
            
            // Set user rating if available
            if (savedRecipe.rating) {
              setUserRating(savedRecipe.rating);
            }
            
            // Load similar recipes
            loadSimilarRecipes(savedRecipe);
          } else if (storeRecipe && storeRecipe.id === recipeId) {
            // Use the current recipe from the store
            setRecipe(storeRecipe);
            loadSimilarRecipes(storeRecipe);
          } else {
            // Recipe not found
            Alert.alert(
              'Recipe Not Found',
              'The requested recipe could not be found.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
        } else if (storeRecipe) {
          // No ID provided, use current recipe from store
          setRecipe(storeRecipe);
          loadSimilarRecipes(storeRecipe);
        } else {
          // No recipe available
          Alert.alert(
            'Recipe Not Found',
            'No recipe is currently loaded.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } catch (error) {
        console.error('Error loading recipe:', error);
        Alert.alert(
          'Error',
          'An error occurred while loading the recipe.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    };
    
    loadRecipe();
  }, [recipeId, storeRecipe, savedRecipes]);
  
  // Load similar recipes based on current recipe
  const loadSimilarRecipes = (currentRecipe: Recipe) => {
    // In a real app, you would fetch similar recipes from an API
    // For this demo, we'll use matching tags or randomly select from saved recipes
    
    const matchingRecipes = savedRecipes.filter(r => 
      r.id !== currentRecipe.id && // Not the current recipe
      (
        // Match by tags
        (currentRecipe.tags && r.tags && 
          r.tags.some(tag => currentRecipe.tags?.includes(tag))) ||
        // Or match by category
        (currentRecipe.category && r.category === currentRecipe.category)
      )
    );
    
    if (matchingRecipes.length > 0) {
      // Use up to 5 matching recipes
      setSimilarRecipes(matchingRecipes.slice(0, 5));
    } else {
      // If no matching recipes, use random ones from saved recipes
      const randomRecipes = savedRecipes
        .filter(r => r.id !== currentRecipe.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      setSimilarRecipes(randomRecipes);
    }
  };
  
  // Handle user rating change
  const handleRatingChange = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserRating(rating);
    
    if (recipe) {
      const updatedRecipe = {
        ...recipe,
        rating: rating
      };
      
      // Update the recipe in the store with the new rating
      updateRecipe(recipe.id, updatedRecipe);
      setRecipe(updatedRecipe);
    }
  };
  
  // Handle share button press
  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowShareModal(true);
  };
  
  // Handle edit ingredients button press
  const handleEditIngredients = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowEditModal(true);
  };
  
  // Handle recipe update after regeneration
  const handleRecipeUpdate = (updatedRecipe: Recipe) => {
    setRecipe(updatedRecipe);
  };
  
  // Handle step completion
  const handleStepComplete = (index: number, completed: boolean) => {
    // You could save step completion status to the recipe if needed
  };
  
  // Loading state
  if (loading || !recipe) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with hero image */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ 
            uri: recipe.heroImage || 
            'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=2070&auto=format&fit=crop' 
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        
        {/* Recipe title and rating */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={userRating || recipe.rating || 0}
              size={22}
              isEditable={true}
              onRatingChange={handleRatingChange}
            />
            
            <Text style={styles.ratingText}>
              {userRating || recipe.rating || 0}
            </Text>
          </View>
          
          <View style={styles.metaInfoContainer}>
            {recipe.prepTime && (
              <View style={styles.metaInfo}>
                <Ionicons name="time-outline" size={16} color="white" />
                <Text style={styles.metaInfoText}>Prep: {recipe.prepTime}</Text>
              </View>
            )}
            
            {recipe.cookTime && (
              <View style={styles.metaInfo}>
                <Ionicons name="flame-outline" size={16} color="white" />
                <Text style={styles.metaInfoText}>Cook: {recipe.cookTime}</Text>
              </View>
            )}
            
            {recipe.servings && (
              <View style={styles.metaInfo}>
                <Ionicons name="people-outline" size={16} color="white" />
                <Text style={styles.metaInfoText}>Serves: {recipe.servings}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* Main content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Description */}
        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}
        
        {/* Ingredients list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <IngredientList 
            ingredients={recipe.ingredients} 
            editable={false}
          />
        </View>
        
        {/* Instructions / Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Steps</Text>
          <StepList 
            steps={recipe.steps} 
            onStepComplete={handleStepComplete}
          />
        </View>
        
        {/* Similar recipes */}
        {similarRecipes.length > 0 && (
          <View style={styles.section}>
            <RecipeCarousel 
              title="You May Also Like" 
              recipes={similarRecipes}
            />
          </View>
        )}
        
        {/* Bottom spacing for content */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <SaveButton 
          recipe={recipe} 
          size="medium"
          variant="primary"
          showText={true}
        />
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color={colors.text} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditIngredients}
          >
            <Ionicons name="create-outline" size={22} color={colors.text} />
            <Text style={styles.actionButtonText}>Edit & Regenerate</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Modals */}
      {showShareModal && (
        <ShareModal 
          recipe={recipe}
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
      
      {showEditModal && (
        <EditIngredients
          recipe={recipe}
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleRecipeUpdate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins-Regular',
  },
  heroContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 32,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'Poppins-Bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Poppins-Bold',
  },
  metaInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaInfoText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Poppins-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 24,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
}); 