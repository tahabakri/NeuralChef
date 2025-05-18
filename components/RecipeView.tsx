import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Share, 
  Platform,
  FlatList
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Heart, BookmarkPlus, Share2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import components
import StepList from '@/components/StepList';
import IngredientList from '@/components/IngredientList';
import StarRating from '@/components/StarRating';
import Button from '@/components/Button';
import colors from '@/constants/colors';

// Define recipe types
interface RecipeStep {
  instruction: string;
  imageUrl?: string;
  hasTimer?: boolean;
  timerDuration?: number;
}

interface Recipe {
  id?: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: RecipeStep[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  heroImage?: string;
  rating?: number;
  category?: string;
}

interface RecipeViewProps {
  recipe: Recipe;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: (recipeId: string) => void;
}

export default function RecipeView({ recipe, isSaved, onBack, onToggleSave }: RecipeViewProps) {
  const [userRating, setUserRating] = useState(recipe.rating || 0);
  
  // Handle rating change
  const handleRating = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserRating(rating);
    
    // In a real app, you would save this rating to your backend
  };
  
  // Share recipe
  const handleShareRecipe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const shareMessage = `Check out this recipe for ${recipe.title}!\n\n` +
        `🍽️ Ingredients:\n${recipe.ingredients.join('\n')}\n\n` +
        `👨‍🍳 Instructions:\n${recipe.steps.map((step, i) => 
          `${i + 1}. ${step.instruction}`).join('\n')}\n\n` +
        'Generated with ReciptAI';
      
      await Share.share({
        message: shareMessage,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };
  
  // Toggle save recipe
  const handleToggleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleSave(recipe.id || '');
  };

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
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleToggleSave}
            >
              <BookmarkPlus size={24} color={isSaved ? colors.primary : 'white'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShareRecipe}
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
          {/* Recipe info section */}
          <View style={styles.infoSection}>
            {recipe.prepTime && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Prep Time</Text>
                <Text style={styles.infoValue}>{recipe.prepTime}</Text>
              </View>
            )}
            
            {recipe.cookTime && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cook Time</Text>
                <Text style={styles.infoValue}>{recipe.cookTime}</Text>
              </View>
            )}
            
            {recipe.servings && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Servings</Text>
                <Text style={styles.infoValue}>{recipe.servings}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <IngredientList ingredients={recipe.ingredients} />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Steps</Text>
            <StepList steps={recipe.steps} />
          </View>
          
          <Button 
            title={isSaved ? "Saved to Collection" : "Save Recipe"}
            onPress={handleToggleSave}
            style={styles.saveButton}
            icon={isSaved ? "checkmark" : "bookmark"}
            variant={isSaved ? "success" : "primary"}
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
  infoSection: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 30,
  },
}); 