import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RecipeCard, { Recipe as RecipeCardRecipe, prepareRecipeForCard } from '@/components/RecipeCard';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define spacing if not imported from constants
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  }
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SavedRecipesPreviewProps {
  recipes: RecipeCardRecipe[];
  isLoading: boolean;
  onViewAllPress: () => void;
  onRecipePress: (id: string) => void;
}

const SavedRecipesPreview: React.FC<SavedRecipesPreviewProps> = ({
  recipes,
  isLoading,
  onViewAllPress,
  onRecipePress
}) => {
  // Maximum number of recipes to show in preview
  const MAX_PREVIEW_COUNT = 5;
  const showViewAll = recipes && recipes.length > 3;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today's Picks for You</Text>
        {showViewAll && (
          <TouchableOpacity 
            onPress={onViewAllPress}
            accessibilityLabel="View all saved recipes"
            accessibilityRole="button"
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={colors.primary} 
          style={{ marginVertical: spacing.lg }} 
        />
      ) : !recipes || recipes.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyStateCard}
          onPress={onViewAllPress}
          accessibilityLabel="No saved recipes yet. Tap to browse and save recipes"
        >
          <Text style={styles.emptyStateText}>Save your favorite recipes</Text>
          <Ionicons name="chevron-forward-outline" size={22} color={colors.textTertiary} />
        </TouchableOpacity>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          accessibilityLabel="Scrollable list of your saved recipe previews"
        >
          {recipes.slice(0, MAX_PREVIEW_COUNT).map((recipe) => (
            <View
              key={`saved-${recipe.id}`}
              style={styles.recipeCardWrapper}
              accessible={true}
              accessibilityLabel={`Saved recipe: ${recipe.title}, ${recipe.cookTime || 'unknown'} minutes to prepare, ${recipe.difficulty || 'unknown'} difficulty`}
              accessibilityRole="button"
              accessibilityHint="Tap to view saved recipe details"
            >
              <RecipeCard
                recipe={prepareRecipeForCard(recipe)}
                onPress={() => onRecipePress(recipe.id)}
                style={styles.recipeCardItem}
                type="featured"
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + (Platform.OS === 'ios' ? 20 : 0), // Extra padding for tab bar space
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading2,
    color: colors.text, // Maps to textPrimary in the prompt
  },
  viewAllText: {
    ...typography.button,
    color: colors.primary, // Primary color
  },
  emptyStateCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateText: {
    ...typography.bodyLarge,
    color: colors.text, // Maps to textPrimary in the prompt
    flex: 1,
    marginRight: spacing.sm,
  },
  scrollViewContent: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.md, // If cards have marginRight: spacing.md
  },
  recipeCardWrapper: {
    width: SCREEN_WIDTH * 0.55, // Slightly smaller than Today's Picks
    height: 260, // Adjust as needed
    marginRight: spacing.md,
  },
  recipeCardItem: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // For image border radius and gradient overlay
  },
});

export default SavedRecipesPreview; 