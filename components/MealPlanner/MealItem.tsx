import React from 'react'; // Removed useState as btnScale animation is on the empty state button only
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { MealItemProps, MealType } from './types';
import CachedImage from '@/components/CachedImage'; // Added CachedImage

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner'
};

// Updated to use text emojis as per feedback
const MEAL_TYPE_EMOJIS: Record<MealType, string> = {
  breakfast: '☀️',
  lunch: '🍴',
  dinner: '🌙'
};

export default function MealItem({
  mealType,
  meal,
  onAddRecipe,
  onRecipePress,
  onRemoveRecipe,
  onChangeRecipe,
}: MealItemProps) {
  // btnScale for animation is now only on the empty state's add button
  const emptyAddBtnScale = useSharedValue(1);

  const handleAddPressEmptyState = () => {
    emptyAddBtnScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onAddRecipe();
  };

  const handleRecipePress = () => {
    if (meal) {
      onRecipePress(meal.recipeId);
    }
  };

  const handleRemovePress = () => {
    if (meal) {
      onRemoveRecipe(meal.id);
    }
  };

  const handleChangePress = () => {
    if (meal) {
      onChangeRecipe(meal.id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.mealTypeEmoji}>{MEAL_TYPE_EMOJIS[mealType]}</Text>
          <Text style={styles.mealTypeText}>{MEAL_TYPE_LABELS[mealType]}</Text>
        </View>
        {/* Reminder badge removed */}
      </View>

      {meal ? (
        <TouchableOpacity
          style={styles.contentContainerPlanned}
          onPress={handleRecipePress}
          accessibilityLabel={`View details for ${meal.recipe.title}`}
          accessibilityRole="button"
        >
          {meal.recipe.image && (
            <CachedImage
              source={meal.recipe.image}
              style={styles.recipeImage}
              placeholder={<View style={{ flex: 1, backgroundColor: colors.backgroundAlt }} />} // Keep placeholder simple
            />
          )}
          <View style={styles.mealInfo}>
            <Text style={styles.recipeName} numberOfLines={1}>
              {meal.recipe.title}
            </Text>
            {meal.recipe.cookTime && (
              <Text style={styles.cookTime}>
                <Ionicons name="time-outline" size={typography.bodySmall.fontSize || 14} color={colors.textSecondary} />{' '}
                {meal.recipe.cookTime} mins
              </Text>
            )}
          </View>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePress}
              accessibilityLabel="Change recipe"
            >
              <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.textSecondary} />
              {/* <Text style={styles.actionButtonText}>Change</Text> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRemovePress}
              accessibilityLabel="Remove recipe"
            >
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : (
        <Animated.View style={[styles.emptyStateContainer, { transform: [{ scale: emptyAddBtnScale }] }]}>
          <TouchableOpacity
            style={styles.addRecipeButton}
            onPress={handleAddPressEmptyState}
            accessibilityLabel="Add a recipe"
            accessibilityRole="button"
          >
            <View style={styles.addRecipeIconContainer}>
              <Ionicons name="add" size={20} color={colors.white} />
            </View>
            <Text style={styles.addRecipeButtonText}>Add a recipe</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white, 
    borderRadius: 16, // Assuming spacing.borderRadius.lg is 16
    marginBottom: 12, // spacing.md equivalent
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 }, // Subtle shadow
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12, // Slightly more padding
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundAlt, // Softer divider
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeEmoji: {
    fontSize: 20, // Standard emoji size
    marginRight: 8, // spacing.sm equivalent
    color: colors.textSecondary, // As per feedback
  },
  mealTypeText: {
    ...(typography.subtitle1 || { fontFamily: 'Poppins-Medium', fontSize: 18 }), // Use subtitle1
    color: colors.text,
  },
  contentContainerPlanned: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  recipeImage: {
    width: 56, // Standardized size
    height: 56,
    borderRadius: 8, // spacing.borderRadius.md equivalent
    marginRight: 12, // spacing.md equivalent
  },
  mealInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  recipeName: {
    ...(typography.bodyLarge || { fontFamily: 'OpenSans-Regular', fontSize: 18 }), // Use bodyLarge
    color: colors.text,
    marginBottom: 4, // spacing.xs equivalent
  },
  cookTime: {
    ...(typography.bodySmall || { fontFamily: 'OpenSans-Regular', fontSize: 14 }), // Use bodySmall
    color: colors.textSecondary,
    flexDirection: 'row', // To align icon and text
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8, // spacing.sm equivalent
  },
  // actionButtonText removed as we are using icons
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24, // spacing.xl equivalent
    paddingHorizontal: 16, // spacing.lg equivalent
  },
  addRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // spacing.sm + spacing.xs
    paddingHorizontal: 16, // spacing.lg
    borderRadius: 20, // Pill shape
    // No background color on the button itself, only on the icon container
  },
  addRecipeIconContainer: {
    width: 32, // Slightly larger for better touch
    height: 32,
    borderRadius: 16, // Half of width/height
    backgroundColor: colors.accentOrange, // As per feedback
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // spacing.sm + spacing.xs
  },
  addRecipeButtonText: {
    ...(typography.bodyMedium || { fontFamily: 'OpenSans-Regular', fontSize: 16 }), // Use bodyMedium
    color: colors.accentOrange,
  },
});
