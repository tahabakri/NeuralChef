import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  ImageSourcePropType,
  ImageBackground,
  ViewStyle,
  StyleProp,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '@/constants/typography';

import { Recipe as ServiceRecipe } from '@/services/recipeService';

// Define recipe interface extending the service Recipe type
export interface Recipe extends Omit<ServiceRecipe, 'cookTime' | 'rating' | 'steps' | 'ingredients'> {
  image?: string | ImageSourcePropType;
  cookTime: number; // Required for display
  rating: number; // Required for display
  saved?: boolean;
  imageUrl?: string;
  servings?: number;
  steps?: ServiceRecipe['steps']; // Make steps optional
  ingredients?: ServiceRecipe['ingredients']; // Make ingredients optional
}

// Helper function to ensure required display properties
export const prepareRecipeForCard = (recipe: Partial<Recipe> & Pick<Recipe, 'id' | 'title' | 'difficulty' | 'tags'>): Recipe => ({
  ...recipe,
  cookTime: recipe.cookTime || 0,
  rating: recipe.rating || 0,
  ingredients: recipe.ingredients || [],
  steps: recipe.steps || [],
});

interface RecipeCardProps {
  recipe: Recipe;
  type?: 'featured' | 'horizontal' | 'vertical'; // Different display types
  onSaveToggle?: (id: string) => void;
  onPress?: (id: string) => void; // Add onPress handler
  style?: ViewStyle; // Style prop for the container
  backgroundComponent?: React.ReactNode; // Custom background component
  large?: boolean;
  selectable?: boolean; // Whether the card can be selected for bulk actions
  selected?: boolean; // Whether the card is currently selected
  onLongPress?: (id: string) => void; // Handle long press for selection
  isNew?: boolean; // Add this property
}

// Placeholder image when no image is available
const PLACEHOLDER_IMAGE = require('@/assets/images/empty-recipe.png');
// Default cook time when none is provided
const DEFAULT_COOK_TIME = '15–20 min';

// Add a NewBadge component
const NewBadge = () => (
  <View style={styles.newBadge}>
    <Text style={styles.newBadgeText}>New</Text>
  </View>
);

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  type = 'vertical', 
  onSaveToggle, 
  onPress, 
  style, 
  backgroundComponent,
  large = false,
  selectable = false,
  selected = false,
  onLongPress,
  isNew = false
}) => {
  // Handle save button press
  const handleSavePress = () => {
    if (onSaveToggle) {
      onSaveToggle(recipe.id);
    }
  };

  // Handle card press
  const handlePress = () => {
    if (onPress) {
      onPress(recipe.id);
    }
  };

  // Handle long press for selection
  const handleLongPress = () => {
    if (selectable && onLongPress) {
      onLongPress(recipe.id);
    }
  };

  // Format cook time to display (e.g. 45 -> "45 min", 60 -> "1 hr")
  const formatCookTime = (minutes: number): string => {
    // Handle undefined, NaN, or invalid values
    if (minutes === undefined || minutes === null || isNaN(minutes) || minutes <= 0) {
      return DEFAULT_COOK_TIME;
    }
    
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

  // Get image source with fallback to placeholder
  const getImageSource = () => {
    if (!recipe.image && !recipe.imageUrl) {
      return PLACEHOLDER_IMAGE;
    }
    const imageSource = recipe.imageUrl || recipe.image;
    return typeof imageSource === 'string' ? { uri: imageSource } : imageSource;
  };

  // Create card component based on the card wrapper
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (onPress) {
      return (
        <TouchableOpacity 
          style={[
            type === 'featured' ? styles.featuredContainer : 
            type === 'horizontal' ? styles.horizontalContainer : 
            styles.verticalContainer, 
            style,
            selected && styles.selectedCard
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.8}
        >
          {children}
          {selected && (
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={[
        type === 'featured' ? styles.featuredContainer : 
        type === 'horizontal' ? styles.horizontalContainer : 
        styles.verticalContainer, 
        style,
        selected && styles.selectedCard
      ]}>
        {children}
        {selected && (
          <View style={styles.selectionIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
        )}
      </View>
    );
  };

  // Featured recipe card (large, with overlay text)
  if (type === 'featured') {
    return (
      <CardWrapper>
        {backgroundComponent}
        <Image
          source={getImageSource()}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          style={styles.featuredOverlayGradient}
        />
        
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredContent}>
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{recipe.difficulty}</Text>
              </View>
              {recipe.tags && recipe.tags[0] && (
                <View style={[styles.tag, styles.secondaryTag]}>
                  <Text style={styles.tagText}>{recipe.tags[0]}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.featuredTitle}>{recipe.title}</Text>
            
            <View style={styles.metadataContainer}>
              <View style={styles.metadataItem}>
                <Ionicons name="time-outline" size={14} color="white" />
                <Text style={styles.metadataText}>{formatCookTime(recipe.cookTime)}</Text>
              </View>
              
              <View style={styles.metadataItem}>
                <Ionicons name="star" size={14} color="white" />
                <Text style={styles.metadataText}>{recipe.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
          
          {onSaveToggle && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={recipe.saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </CardWrapper>
    );
  }

  // Horizontal recipe card (for lists)
  if (type === 'horizontal') {
    return (
      <CardWrapper>
        {backgroundComponent}
        <Image
          source={getImageSource()}
          style={styles.horizontalImage}
          resizeMode="cover"
        />
        
        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>{recipe.title}</Text>
          
          <View style={styles.horizontalMetadata}>
            <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
            <View style={styles.metadataSeparator} />
            <View style={styles.horizontalMetadataItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.horizontalMetadataText}>{formatCookTime(recipe.cookTime)}</Text>
            </View>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.ratingText}>{recipe.rating.toFixed(1)}</Text>
          </View>
        </View>
        
        {onSaveToggle && (
          <TouchableOpacity
            style={styles.horizontalSaveButton}
            onPress={handleSavePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={recipe.saved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={recipe.saved ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </CardWrapper>
    );
  }

  // Vertical recipe card (grid view)
  return (
    <CardWrapper>
      {backgroundComponent}
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.verticalImage}
          resizeMode="cover"
        />
        {isNew && <NewBadge />}
        {onSaveToggle && (
          <TouchableOpacity
            style={styles.verticalSaveButton}
            onPress={handleSavePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={recipe.saved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={recipe.saved ? colors.primary : 'white'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.verticalContent}>
        <Text style={styles.verticalTitle} numberOfLines={2}>{recipe.title}</Text>
        
        <View style={styles.verticalMetadata}>
          <View style={styles.verticalMetadataItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.verticalMetadataText}>{formatCookTime(recipe.cookTime)}</Text>
          </View>
          
          <View style={styles.verticalMetadataItem}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.verticalMetadataText}>{recipe.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  // Featured Recipe Card Styles
  featuredContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 32,
    backgroundColor: 'transparent',
  },
  featuredOverlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  featuredContent: {
    flex: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  secondaryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  featuredTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Poppins-Medium',
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  
  // Horizontal Recipe Card Styles
  horizontalContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  horizontalImage: {
    width: 100,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  horizontalMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  metadataSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 6,
  },
  horizontalMetadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalMetadataText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
    fontFamily: 'Poppins-Medium',
  },
  horizontalSaveButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Vertical Recipe Card Styles
  verticalContainer: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  verticalImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  verticalSaveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalContent: {
    padding: 12,
  },
  verticalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  verticalMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verticalMetadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalMetadataText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default RecipeCard;
