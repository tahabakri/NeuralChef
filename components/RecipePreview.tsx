import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Recipe, Ingredient } from '@/types/recipe';

interface RecipePreviewProps {
  recipe: Recipe;
  onViewFullRecipe: () => void;
  onTryAgain: () => void;
}

const { width } = Dimensions.get('window');

const RecipePreview: React.FC<RecipePreviewProps> = ({ 
  recipe,
  onViewFullRecipe,
  onTryAgain 
}) => {
  // Format cook time to display (e.g. 45 -> "45 min", 60 -> "1 hr")
  const formatCookTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${remainingMinutes} min`;
  };
  
  // Get placeholder image if none provided
  const getImageSource = () => {
    if (!recipe.image) {
      return require('@/assets/images/empty-recipe.png');
    }
    return { uri: recipe.image };
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Recipe is Ready!</Text>
      
      <View style={styles.card}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          style={styles.imageOverlay}
        />
        
        <View style={styles.content}>
          <View style={styles.metadataRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{recipe.difficulty}</Text>
            </View>
            
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={colors.white} />
              <Text style={styles.timeText}>{formatCookTime(recipe.cookTime)}</Text>
            </View>
            
            <View style={styles.servingsContainer}>
              <Ionicons name="people-outline" size={16} color={colors.white} />
              <Text style={styles.servingsText}>{recipe.servings} servings</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
        </View>
      </View>
      
      <View style={styles.ingredientsContainer}>
        <Text style={styles.ingredientsHeader}>Main Ingredients</Text>
        
        <ScrollView style={styles.ingredientList}>
          {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.ingredientText}>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </Text>
            </View>
          ))}
          {recipe.ingredients.length > 5 && (
            <Text style={styles.moreIngredientsText}>
              And {recipe.ingredients.length - 5} more ingredients...
            </Text>
          )}
        </ScrollView>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={onViewFullRecipe}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.viewButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.viewButtonText}>View Full Recipe</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={onTryAgain}
        >
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: 4,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingsText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: 4,
  },
  title: {
    ...typography.heading2,
    color: colors.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.white,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ingredientsContainer: {
    marginBottom: 20,
  },
  ingredientsHeader: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 12,
  },
  ingredientList: {
    maxHeight: 150,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientText: {
    ...typography.bodyMedium,
    color: colors.text,
    marginLeft: 8,
  },
  moreIngredientsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionsContainer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
  viewButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 12,
  },
  viewButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  tryAgainButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  tryAgainText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default RecipePreview; 