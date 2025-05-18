import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { GeneratedRecipe } from '@/utils/mockRecipeGeneration';

interface RecipeScreenProps {
  recipe: GeneratedRecipe;
  onBackPress?: () => void;
  onSave?: (recipe: GeneratedRecipe) => void;
  onCreateNew?: () => void;
}

const RecipeScreen: React.FC<RecipeScreenProps> = ({
  recipe,
  onBackPress,
  onSave,
  onCreateNew,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe for ${recipe.title}! Ingredients: ${recipe.ingredients.join(', ')}`,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  // Calculate total time
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  
  // Determine category tag
  let category = 'Dinner';
  if (recipe.tags && recipe.tags.length > 0) {
    if (recipe.tags.includes('breakfast')) category = 'Breakfast';
    else if (recipe.tags.includes('lunch')) category = 'Lunch';
    else if (recipe.tags.includes('dinner')) category = 'Dinner';
    else if (recipe.tags.includes('dessert')) category = 'Dessert';
    else if (recipe.tags.includes('snack')) category = 'Snack';
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      {/* Gradient Header */}
      <LinearGradient 
        colors={['#607D8B', '#CFD8DC']} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.rightButtons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => onSave && onSave(recipe)}>
                <Ionicons name="bookmark-outline" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          
          <View style={styles.recipeMetaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="white" />
              <Text style={styles.metaText}>{totalTime} min</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={18} color="white" />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="fitness-outline" size={18} color="white" />
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Recipe Content */}
      <ScrollView style={styles.contentContainer}>
        {/* Description */}
        <Text style={styles.descriptionText}>{recipe.description}</Text>
        
        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
        
        {/* Nutrition Facts Section (if available) */}
        {recipe.nutritionFacts && (
          <View style={styles.nutritionContainer}>
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            <View style={styles.nutritionGrid}>
              {recipe.nutritionFacts.calories !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionFacts.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
              )}
              
              {recipe.nutritionFacts.protein !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionFacts.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
              )}
              
              {recipe.nutritionFacts.carbs !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionFacts.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
              )}
              
              {recipe.nutritionFacts.fat !== undefined && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionFacts.fat}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps</Text>
          {recipe.steps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
              </View>
              
              {step.imageUrl && (
                <Image 
                  source={{ uri: step.imageUrl }} 
                  style={[styles.stepImage, { width: screenWidth - 48 }]} 
                  resizeMode="cover"
                />
              )}
              
              {step.durationMinutes && (
                <View style={styles.stepTimingContainer}>
                  <Ionicons name="time-outline" size={16} color="#607D8B" />
                  <Text style={styles.stepTiming}>{step.durationMinutes} min</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        
        {/* Additional Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsList}>
              {recipe.tags.map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={[styles.actionButtonsContainer, { paddingBottom: insets.bottom || 16 }]}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]} 
          onPress={() => onSave && onSave(recipe)}
        >
          <Text style={styles.saveButtonText}>Save Recipe</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.createNewButton]} 
          onPress={onCreateNew}
        >
          <Text style={styles.createNewButtonText}>Create New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContent: {
    marginTop: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryContainer: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  nutritionContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
  },
  stepItem: {
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#607D8B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepInstruction: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  stepImage: {
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  stepTimingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepTiming: {
    marginLeft: 4,
    color: '#607D8B',
    fontSize: 14,
  },
  tagsContainer: {
    marginVertical: 16,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: '#F1F8E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createNewButton: {
    backgroundColor: '#FF9800',
  },
  createNewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipeScreen; 