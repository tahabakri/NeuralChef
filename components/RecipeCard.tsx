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
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '@/constants/typography';

// Define recipe interface
export interface Recipe {
  id: string;
  title: string;
  image: string | ImageSourcePropType;
  cookTime: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  tags?: string[];
  ingredients?: string[];
  saved?: boolean;
  description?: string;
  imageUrl?: string;
  servings?: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  type?: 'featured' | 'horizontal' | 'vertical'; // Different display types
  onSaveToggle?: (id: string) => void;
  onPress?: (id: string) => void; // Add onPress handler
  style?: ViewStyle; // Style prop for the container
  backgroundComponent?: React.ReactNode; // Custom background component
  large?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  type = 'vertical', 
  onSaveToggle, 
  onPress, 
  style, 
  backgroundComponent,
  large = false
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

  // Create card component based on the card wrapper
  const CardWrapper = ({ children }) => {
    if (onPress) {
      return (
        <TouchableOpacity 
          style={[type === 'featured' ? styles.featuredContainer : 
                 type === 'horizontal' ? styles.horizontalContainer : 
                 styles.verticalContainer, style]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {children}
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={[type === 'featured' ? styles.featuredContainer : 
                   type === 'horizontal' ? styles.horizontalContainer : 
                   styles.verticalContainer, style]}>
        {children}
      </View>
    );
  };

  // Featured recipe card (large, with overlay text)
  if (type === 'featured') {
    return (
      <CardWrapper>
        {backgroundComponent}
        <Image
          source={typeof recipe.image === 'string' ? { uri: recipe.image } : recipe.image}
          style={styles.featuredImage}
          resizeMode="cover"
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
          source={typeof recipe.image === 'string' ? { uri: recipe.image } : recipe.image}
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
          source={typeof recipe.image === 'string' ? { uri: recipe.image } : recipe.image}
          style={styles.verticalImage}
          resizeMode="cover"
        />
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
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  horizontalImage: {
    width: 100,
    height: '100%',
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  verticalImage: {
    width: '100%',
    height: '100%',
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
});

export default RecipeCard; 