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
  Pressable // Added Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import spacing from '@/constants/spacing'; // Added spacing import
import { LinearGradient } from 'expo-linear-gradient';
import typography, { fontSize, lineHeight, fontFamily as appFontFamily, fontWeight as appFontWeight } from '@/constants/typography'; // Import fontSize, lineHeight, fontFamily, fontWeight

import { Recipe as ServiceRecipe, Ingredient, Step } from '@/services/recipeService';

// --- THEME DEFINITIONS ---
export type CardTheme = 'default' | 'italian' | 'asian' | 'quick' | 'dessert' | 'vegan' | 'comfort' | 'mexican' | 'bbq';

interface ThemeColors {
  cardBackground: string;
  accentColor: string;
  titleColor: string;
  textColor: string;
  tagBackground: string;
  tagTextColor: string;
  imageOverlay: [string, string]; // Changed to a tuple of two strings
  iconColor: string;
}

const defaultThemeColors: ThemeColors = {
  cardBackground: colors.white,
  accentColor: colors.primary,
  titleColor: colors.text,
  textColor: colors.textSecondary,
  tagBackground: colors.primary,
  tagTextColor: colors.white,
  imageOverlay: ['transparent', 'rgba(0, 0, 0, 0.5)'],
  iconColor: colors.textSecondary,
};

const themeDefinitions: Record<CardTheme, Partial<ThemeColors>> = {
  default: defaultThemeColors,
  italian: {
    cardBackground: '#FDF5E6', // Creamy white
    accentColor: '#D32F2F', // Strong Red
    titleColor: '#4E342E', // Dark Brown
    textColor: '#795548', // Lighter Brown
    tagBackground: '#A1887F', // Muted Brown
    tagTextColor: '#FFFFFF',
    imageOverlay: ['transparent', 'rgba(60, 20, 0, 0.6)'],
    iconColor: '#795548',
  },
  asian: {
    cardBackground: '#E8F5E9', // Light Greenish
    accentColor: '#FF7043', // Coral Orange
    titleColor: '#2E7D32', // Dark Green
    textColor: '#558B2F', // Olive Green
    tagBackground: '#66BB6A', // Medium Green
    tagTextColor: '#FFFFFF',
    imageOverlay: ['transparent', 'rgba(0, 40, 10, 0.6)'],
    iconColor: '#558B2F',
  },
  quick: {
    cardBackground: '#E3F2FD', // Light Blue
    accentColor: '#03A9F4', // Bright Blue
    titleColor: '#0277BD', // Darker Blue
    textColor: '#0288D1', // Medium Blue
    tagBackground: '#FFC107', // Amber
    tagTextColor: '#212121',
    imageOverlay: ['transparent', 'rgba(0, 80, 120, 0.5)'],
    iconColor: '#0288D1',
  },
  dessert: {
    cardBackground: '#FFF8E1', // Light Cream
    accentColor: '#EC407A', // Pink
    titleColor: '#C2185B', // Darker Pink
    textColor: '#AD1457', // Medium Pink
    tagBackground: '#F48FB1', // Lighter Pink
    tagTextColor: '#FFFFFF',
    imageOverlay: ['transparent', 'rgba(120, 30, 80, 0.5)'],
    iconColor: '#AD1457',
  },
  vegan: {
    cardBackground: '#F1F8E9', // Very Light Green
    accentColor: '#689F38', // Light Green (Lime Green family)
    titleColor: '#33691E', // Dark Green
    textColor: '#558B2F', // Olive Green
    tagBackground: '#9CCC65', // Brighter Light Green
    tagTextColor: '#212121',
    imageOverlay: ['transparent', 'rgba(30, 90, 30, 0.6)'],
    iconColor: '#558B2F',
  },
  comfort: {
    cardBackground: '#FFFDE7', // Light Yellow
    accentColor: '#FFA000', // Amber
    titleColor: '#795548', // Brown
    textColor: '#8D6E63', // Light Brown
    tagBackground: '#FFB300', // Bright Amber
    tagTextColor: '#FFFFFF',
    imageOverlay: ['transparent', 'rgba(90, 60, 10, 0.6)'],
    iconColor: '#8D6E63',
  },
  mexican: {
    cardBackground: '#FFF3E0', // Light Orange/Peach
    accentColor: '#F57C00', // Orange
    titleColor: '#D84315', // Deep Orange
    textColor: '#BF360C', // Darker Orange
    tagBackground: '#FF9800', // Bright Orange
    tagTextColor: '#FFFFFF',
    imageOverlay: ['transparent', 'rgba(100, 40, 0, 0.65)'],
    iconColor: '#BF360C',
  },
  bbq: {
    cardBackground: '#ECEFF1', // Blue Grey Light
    accentColor: '#DD2C00', // Deep Orange (like embers)
    titleColor: '#37474F', // Dark Slate Grey
    textColor: '#546E7A', // Slate Grey
    tagBackground: '#BF360C', // Dark Orange/Brown
    tagTextColor: '#FFFFFF',
    imageOverlay: ['transparent', 'rgba(40, 20, 10, 0.7)'],
    iconColor: '#546E7A',
  }
};

const getThemeColors = (themeName?: CardTheme): ThemeColors => {
  const selectedTheme = themeDefinitions[themeName || 'default'] || themeDefinitions.default;
  return { ...defaultThemeColors, ...selectedTheme };
};
// --- END THEME DEFINITIONS ---


// Define the shape of the recipe data that RecipeCard component expects internally.
export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string | ImageSourcePropType;
  imageUrl?: string;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  servings: number;
  tags: string[];
  saved?: boolean;
  theme?: CardTheme; // Added theme property
  // Optional properties from ServiceRecipe
  prepTime?: number;
  totalTime?: number;
  author?: string;
  ingredients?: Ingredient[];
  steps?: Step[];
  nutritionalInfo?: ServiceRecipe['nutritionalInfo'];
  notes?: string[];
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  heroImage?: string;
}

// Helper function to prepare recipe data for display in a card.
export const prepareRecipeForCard = (
  recipe: Partial<ServiceRecipe> & Pick<ServiceRecipe, 'id' | 'title' | 'difficulty' | 'tags'>
): Recipe => {
  let cardTheme: CardTheme = (recipe as any).theme || 'default'; // Use provided theme or default
  if (cardTheme === 'default' && recipe.tags) { // Infer if default and tags exist
    const lowerTags = recipe.tags.map(t => t.toLowerCase());
    if (lowerTags.some(tag => ['italian', 'pasta', 'pizza', 'risotto'].includes(tag))) cardTheme = 'italian';
    else if (lowerTags.some(tag => ['asian', 'chinese', 'japanese', 'thai', 'sushi', 'korean', 'vietnamese'].includes(tag))) cardTheme = 'asian';
    else if (lowerTags.some(tag => ['quick', 'easy', '15-min', '30-min', 'simple'].includes(tag))) cardTheme = 'quick';
    else if (lowerTags.some(tag => ['dessert', 'cake', 'sweet', 'chocolate', 'cookies', 'pie'].includes(tag))) cardTheme = 'dessert';
    else if (lowerTags.some(tag => ['vegan', 'plant-based', 'vegetarian'].includes(tag))) cardTheme = 'vegan'; // Vegetarian can also use vegan theme
    else if (lowerTags.some(tag => ['comfort food', 'hearty', 'stew', 'casserole', 'soup'].includes(tag))) cardTheme = 'comfort';
    else if (lowerTags.some(tag => ['mexican', 'taco', 'burrito', 'salsa', 'guacamole'].includes(tag))) cardTheme = 'mexican';
    else if (lowerTags.some(tag => ['bbq', 'grill', 'smoked', 'barbecue'].includes(tag))) cardTheme = 'bbq';
  }

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description || 'No description available.',
    image: recipe.image || PLACEHOLDER_IMAGE,
    cookTime: recipe.cookTime || 0,
    difficulty: recipe.difficulty,
    rating: recipe.rating || 0,
    servings: recipe.servings || 0,
    tags: recipe.tags,
    theme: cardTheme, // Set the determined theme

    imageUrl: (recipe as any).imageUrl,
    saved: recipe.saved,
    prepTime: recipe.prepTime,
    totalTime: recipe.totalTime,
    author: recipe.author,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    nutritionalInfo: recipe.nutritionalInfo,
    notes: recipe.notes,
    source: recipe.source,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    heroImage: recipe.heroImage,
  };
};

interface RecipeCardProps {
  recipe: Recipe;
  type?: 'featured' | 'horizontal' | 'vertical';
  variant?: 'default' | 'todaysPick'; // New variant prop
  onSaveToggle?: (id: string) => void;
  onPress?: (id: string) => void;
  style?: ViewStyle;
  backgroundComponent?: React.ReactNode;
  large?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onLongPress?: (id: string) => void;
  isNew?: boolean;
  onAddToMealPlan?: (recipeId: string) => void;
}

// Placeholder image when no image is available
const PLACEHOLDER_IMAGE = require('@/assets/images/empty-recipe.png');
// Default cook time when none is provided
const DEFAULT_COOK_TIME = '15–20 min';

// Add a NewBadge component
const NewBadge = ({ themeColors }: { themeColors: ThemeColors }) => (
  <View style={[styles.newBadge, { backgroundColor: themeColors.accentColor }]}>
    <Text style={[styles.newBadgeText, { color: themeColors.tagTextColor }]}>New</Text>
  </View>
);

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  type = 'vertical',
  variant = 'default', // Default to 'default' variant
  onSaveToggle,
  onPress,
  style,
  backgroundComponent,
  // large = false,
  selectable = false,
  selected = false,
  onLongPress,
  isNew = false
}) => {
  const themeColors = getThemeColors(recipe.theme);
  const isTodaysPickVariant = variant === 'todaysPick';

  // Handle save button press
  const handleSavePress = () => {
    if (onSaveToggle) {
      onSaveToggle(recipe.id);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(recipe.id);
    }
  };

  const handleLongPress = () => {
    if (selectable && onLongPress) {
      onLongPress(recipe.id);
    }
  };

  // Format cook time to display (e.g. 45 -> "45 min", 60 -> "1 hr")
  const formatCookTime = (minutes: number): string => {
    if (minutes === undefined || minutes === null || isNaN(minutes) || minutes <= 0) {
      return DEFAULT_COOK_TIME;
    }
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes === 0 ? `${hours} hr` : `${hours} hr ${remainingMinutes} min`;
  };

  const getImageSource = () => {
    if (!recipe.image && !recipe.imageUrl) return PLACEHOLDER_IMAGE;
    const imageSource = recipe.imageUrl || recipe.image;
    return typeof imageSource === 'string' ? { uri: imageSource } : imageSource;
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    const baseStyle =
      type === 'featured' ? styles.featuredContainer :
      type === 'horizontal' ? styles.horizontalContainer :
      isTodaysPickVariant ? styles.todaysPickCardContainer : styles.verticalContainer; // Use todaysPick specific container

    const currentCardBackground = isTodaysPickVariant ? '#FFF9F5' : themeColors.cardBackground;

    return (
      <Pressable
        style={({ pressed }: { pressed: boolean }) => [
          baseStyle,
          { backgroundColor: currentCardBackground },
          style, // User-provided style
          selected && [styles.selectedCard, { borderColor: themeColors.accentColor, backgroundColor: `${themeColors.accentColor}1A` }],
          pressed && styles.pressedCard,
          isTodaysPickVariant && styles.todaysPickCardSpecific // Additional specific styles for shadow etc.
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        accessibilityRole="button"
        accessibilityLabel={`Recipe: ${recipe.title}`}
      >
        {children}
        {selected && (
          <View style={styles.selectionIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={themeColors.accentColor} />
          </View>
        )}
      </Pressable>
    );
  };

  if (type === 'featured') {
    return (
      <CardWrapper>
        {backgroundComponent}
        <ImageBackground
          source={getImageSource()}
          style={styles.featuredImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={themeColors.imageOverlay} // No cast needed now
            style={styles.featuredOverlayGradient}
          />
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredContent}>
              <View style={styles.tagContainer}>
                <View style={[styles.tag, { backgroundColor: themeColors.tagBackground }]}>
                  <Text style={[styles.tagText, { color: themeColors.tagTextColor }]}>{recipe.difficulty}</Text>
                </View>
                {recipe.tags && recipe.tags[0] && (
                  <View style={[styles.tag, { backgroundColor: `${themeColors.tagBackground}99` }]}>
                     <Text style={[styles.tagText, { color: themeColors.tagTextColor }]}>{recipe.tags[0]}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.featuredTitle}>{recipe.title}</Text>
              <View style={styles.metadataContainer}>
                <View style={styles.metadataItem}>
                  <Ionicons name="time-outline" size={14} color={colors.white} />
                  <Text style={styles.metadataText}>{formatCookTime(recipe.cookTime)}</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Ionicons name="star" size={14} color={colors.white} />
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
                  color={colors.white} // Save icon on featured usually white for contrast
                />
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      </CardWrapper>
    );
  }

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
          <Text style={[styles.horizontalTitle, { color: themeColors.titleColor }]} numberOfLines={2}>{recipe.title}</Text>
          <View style={styles.horizontalMetadata}>
            <Text style={[styles.difficultyText, { color: themeColors.textColor }]}>{recipe.difficulty}</Text>
            <View style={[styles.metadataSeparator, {backgroundColor: themeColors.textColor}]} />
            <View style={styles.horizontalMetadataItem}>
              <Ionicons name="time-outline" size={14} color={themeColors.iconColor} />
              <Text style={[styles.horizontalMetadataText, { color: themeColors.textColor }]}>{formatCookTime(recipe.cookTime)}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={themeColors.accentColor} />
            <Text style={[styles.ratingText, { color: themeColors.accentColor }]}>{recipe.rating.toFixed(1)}</Text>
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
              color={recipe.saved ? themeColors.accentColor : themeColors.iconColor}
            />
          </TouchableOpacity>
        )}
      </CardWrapper>
    );
  }

  // Vertical recipe card (default or todaysPick)
  if (isTodaysPickVariant) {
    // TodaysPick variant specific structure
    return (
      <CardWrapper>
        {backgroundComponent}
        <Image
          source={getImageSource()}
          style={styles.todaysPickImage} // Full width image, specific height
          resizeMode="cover"
        />
        <View style={styles.todaysPickContentContainer}>
          <Text style={styles.todaysPickTitle} numberOfLines={2}>{recipe.title}</Text>
          <View style={styles.todaysPickMetadataContainer}>
            <View style={styles.verticalMetadataItem}>
              <Ionicons name="time-outline" size={fontSize.sm} color={colors.textSecondary} />
              <Text style={styles.todaysPickMetadataText}>{formatCookTime(recipe.cookTime)}</Text>
            </View>
            <View style={styles.verticalMetadataItem}>
              <Ionicons name="star" size={fontSize.sm} color={colors.accentOrange} />
              <Text style={styles.todaysPickMetadataText}>{recipe.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
        {/* Save button and New badge are omitted for todaysPick variant as per interpretation of prompt */}
      </CardWrapper>
    );
  } else {
    // Default vertical card
    return (
      <CardWrapper>
        {backgroundComponent}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={getImageSource()}
            style={styles.verticalImage}
            resizeMode="cover"
          >
            <LinearGradient // Subtle gradient for text readability if image is too light
              colors={['transparent', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.2)']}
              style={styles.verticalImageOverlay}
            />
          </ImageBackground>
          {isNew && <NewBadge themeColors={themeColors} />}
          {onSaveToggle && (
            <TouchableOpacity
              style={styles.verticalSaveButton}
              onPress={handleSavePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={recipe.saved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={colors.white} // White icon
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.verticalContent}>
          <Text style={styles.verticalTitle} numberOfLines={2}>{recipe.title}</Text>
          <View style={styles.verticalMetadata}>
            <View style={styles.verticalMetadataItem}>
              <Ionicons name="time-outline" size={fontSize.sm} color={colors.textSecondary} />
              <Text style={styles.verticalMetadataText}>{formatCookTime(recipe.cookTime)}</Text>
            </View>
            <View style={styles.verticalMetadataItem}>
              <Ionicons name="star" size={fontSize.sm} color={colors.accentOrange} />
              <Text style={styles.verticalMetadataText}>{recipe.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </CardWrapper>
    );
  }
};

const styles = StyleSheet.create({
  pressedCard: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  // Featured Recipe Card Styles
  featuredContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%', // Ensure it takes full height from parent
    ...Platform.select({
      ios: { shadowColor: colors.shadowDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, },
      android: { elevation: 6, },
    }),
  },
  featuredImage: { // Used with ImageBackground now
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end', // Aligns LinearGradient and overlay content to bottom
  },
  featuredOverlay: {
    padding: 16,
    paddingTop: 32, // More padding at top of overlay for tags/title
  },
  featuredOverlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%', // Increased height for more prominent gradient
  },
  featuredContent: {
    // Removed flex:1, content is positioned by ImageBackground's justifyContent
  },
  tagContainer: { flexDirection: 'row', marginBottom: 8, },
  tag: {
    // backgroundColor will be set by theme
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  secondaryTag: { // This style might be less relevant if primary tag bg is themed
    // backgroundColor: 'rgba(255, 255, 255, 0.3)', // Kept for now, might need theme adjustment
  },
  tagText: {
    // color will be set by theme
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium', // Reverted to explicit font name
  },
  featuredTitle: {
    color: colors.white, // Usually white for contrast on dark overlay
    fontSize: 20, // Slightly larger for featured
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold', // Reverted to explicit font name
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metadataContainer: { flexDirection: 'row', alignItems: 'center', },
  metadataItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, },
  metadataText: {
    color: colors.white, // Usually white for contrast
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Poppins-Medium', // Reverted to explicit font name
  },
  saveButton: { // For featured card
    position: 'absolute', // Position it within the overlay
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Horizontal Recipe Card Styles
  horizontalContainer: {
    flexDirection: 'row',
    // backgroundColor will be set by theme
    borderRadius: 12,
    overflow: 'hidden',
    height: 110, // Adjusted height
    ...Platform.select({
      ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, },
      android: { elevation: 4, },
    }),
  },
  horizontalImage: {
    width: 110, // Square image for horizontal
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center', // Center content vertically
  },
  horizontalTitle: {
    // color will be set by theme
    fontSize: 15, // Adjusted size
    fontWeight: '600',
    marginBottom: 6, // Adjusted spacing
    fontFamily: 'Poppins-SemiBold', // Reverted to explicit font name
  },
  horizontalMetadata: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, },
  difficultyText: {
    // color will be set by theme
    fontSize: 12,
    fontFamily: 'Poppins-Regular', // Reverted to explicit font name
  },
  metadataSeparator: {
    width: 4, // Slightly larger separator
    height: 4,
    borderRadius: 2,
    // backgroundColor will be set by theme
    marginHorizontal: 8,
  },
  horizontalMetadataItem: { flexDirection: 'row', alignItems: 'center', },
  horizontalMetadataText: {
    // color will be set by theme
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular', // Reverted to explicit font name
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, }, // Added marginTop
  ratingText: {
    // color will be set by theme (accent)
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Poppins-Medium', // Reverted to explicit font name
  },
  horizontalSaveButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center', // Center icon
  },

  // Vertical Recipe Card Styles
  verticalContainer: {
    width: '100%',
    // backgroundColor will be set by theme
    borderRadius: 12, // Consistent border radius
    overflow: 'hidden', // Important for child borderRadius and shadows
    ...Platform.select({
      ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 5, }, // Adjusted shadow
      android: { elevation: 3, }, // Adjusted elevation
    }),
  },
  imageContainer: {
    width: '100%',
    height: 150, // Increased height for better image display
    position: 'relative', // For absolute positioning of save button and badge
    // No border radius here, applied to ImageBackground or child for overflow:hidden to work
  },
  verticalImage: { // Used with ImageBackground now
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12, // Apply radius to image background
    borderTopRightRadius: 12,
    overflow: 'hidden', // Ensure gradient stays within bounds
    justifyContent: 'flex-end', // For verticalImageOverlay
  },
  verticalImageOverlay: { // Subtle gradient for text on image if needed
    height: '50%', // Covers bottom part of the image
  },
  verticalSaveButton: {
    position: 'absolute',
    top: spacing.md, // Use spacing constant
    right: spacing.md, // Use spacing constant
    width: 36,
    height: 36,
    borderRadius: 18, // Circular
    backgroundColor: colors.primary, // Mockup: reddish-orange, colors.primary is Warm Orange
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...Platform.select({ // Optional: add a slight shadow to the button
      ios: { shadowColor: colors.shadowDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, },
      android: { elevation: 4, },
    }),
  },
  verticalContent: {
    padding: spacing.md, // Use spacing constant
    backgroundColor: colors.cardContentBg, // Light peach/beige background from mockup
    borderBottomLeftRadius: spacing.borderRadius.lg, // Match overall card radius
    borderBottomRightRadius: spacing.borderRadius.lg, // Match overall card radius
  },
  verticalTitle: {
    fontFamily: 'Poppins-Bold', // As per mockup: Poppins Bold
    fontSize: fontSize.lg, // typography.bodyLarge font size (18)
    fontWeight: appFontWeight.bold, // Poppins Bold
    color: colors.textPrimary, // Dark text
    marginBottom: spacing.sm, // Use spacing constant
    minHeight: lineHeight.lg * 1.5, // Adjusted for Poppins, typically needs a bit less than 2 lines for 1 line of text
  },
  verticalMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // As per mockup
    marginTop: spacing.xs, // Use spacing constant
  },
  verticalMetadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginRight: spacing.lg, // Removed, space-between will handle spacing
  },
  verticalMetadataText: {
    fontFamily: appFontFamily.regular, 
    fontSize: fontSize.sm, 
    color: colors.textSecondary, 
    marginLeft: spacing.xs, 
  },

  // TodaysPick Variant Styles
  todaysPickCardContainer: { // Base container for TodaysPick, backgroundColor set in CardWrapper
    width: '100%',
    borderRadius: spacing.borderRadius.md, // As per prompt
    overflow: 'hidden',
  },
  todaysPickCardSpecific: { // Specific shadow for TodaysPick
    ...Platform.select({
      ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  todaysPickImage: {
    width: '100%',
    height: 160, // Midpoint of 150-180px from prompt
    borderTopLeftRadius: spacing.borderRadius.md, // Match card's top radius
    borderTopRightRadius: spacing.borderRadius.md,
  },
  todaysPickContentContainer: {
    padding: spacing.md, // As per prompt
    // Background color will be the card's overall background (#FFF9F5)
  },
  todaysPickTitle: {
    fontFamily: 'Poppins-Bold', // As per prompt
    fontSize: fontSize.lg, // Equivalent to typography.bodyLarge.fontSize
    color: colors.textPrimary, // As per prompt
    marginBottom: spacing.sm,
  },
  todaysPickMetadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // As per prompt
    marginTop: spacing.xs,
  },
  todaysPickMetadataText: {
    fontFamily: appFontFamily.regular, // OpenSans-Regular (bodySmall)
    fontSize: fontSize.sm, // bodySmall font size
    color: colors.textSecondary, // As per prompt
    marginLeft: spacing.xs,
  },

  // Common styles for selected state and new badge
  selectedCard: {
    borderWidth: 2,
    // borderColor and backgroundColor will be themed
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28, // Slightly larger
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white, // White background for icon
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Above other content
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1, },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  newBadge: {
    position: 'absolute',
    top: 10, // Adjusted position
    left: 10, // Position to left for variety
    // backgroundColor will be themed (accentColor)
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8, // Softer radius
    zIndex: 1,
  },
  newBadgeText: {
    // color will be themed (tagTextColor)
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold', // Reverted to explicit font name
    textTransform: 'uppercase',
  },
});

export default RecipeCard;
