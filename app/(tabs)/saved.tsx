import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { View, StyleSheet, Text, Pressable, FlatList, ViewStyle, Image, Alert, TextInput, ListRenderItemInfo } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import RecipeCard, { prepareRecipeForCard } from '@/components/RecipeCard';
import { useRecipeStore, Recipe as ServiceRecipe } from '@/stores/recipeStore'; // ServiceRecipe is the base Recipe type
import { useSavedRecipesStore } from '@/stores/savedRecipesStore'; // Import the saved recipes store
import { useMealPlannerStore, ScheduledMeal, MealType } from '@/stores/mealPlannerStore';
import SearchBar from '@/components/SearchBar';
import TagFilter from '@/components/TagFilter';
import BulkActionBar from '@/components/BulkActionBar';
import EmptyStateAnimation from '@/components/EmptyStateAnimation';
import { FontAwesome } from '@expo/vector-icons';

// Time threshold for new recipes (24 hours = 86400000ms)
const NEW_RECIPE_THRESHOLD = 86400000; // 24 hours in milliseconds

// Extend ServiceRecipe for local use if needed, ensuring compatibility
interface RecipeWithTimestamp extends ServiceRecipe {
  // All properties from ServiceRecipe are inherited.
  // Add any additional local-specific properties here if necessary,
  // but for now, we aim for direct compatibility with ServiceRecipe.
}

// Category type for filter buttons
type CategoryType = 'All' | 'Breakfast' | 'Lunch' | 'Dinner';

export default function SavedScreen() {
  const router = useRouter();
  const recipeStore = useRecipeStore(); // For hasNewRecipe, lastNewRecipeTimestamp
  const { hasNewRecipe, setHasNewRecipe, lastNewRecipeTimestamp } = recipeStore; // Rename to avoid conflict
  
  const savedRecipesStore = useSavedRecipesStore(); // Use the saved recipes store
  const mealPlannerStore = useMealPlannerStore();

  // Get saved recipes from the dedicated store
  const actualSavedRecipes = savedRecipesStore.savedRecipes;

  // Clear the new recipe notification when this screen is viewed
  useEffect(() => {
    if (hasNewRecipe) {
      // Clear the notification dot when user visits this tab
      setHasNewRecipe(false);
    }
  }, [hasNewRecipe, setHasNewRecipe]);
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [sortByOpen, setSortByOpen] = useState(false);
  type SortByType = 'newest' | 'oldest' | 'alphabetical' | 'rating' | 'prepTime';
  const [sortBy, setSortBy] = useState<SortByType>('newest');
  
  // Use actual saved recipes from the store
  // The RecipeWithTimestamp interface should be compatible with ServiceRecipe from the store
  // as savedRecipesStore uses Recipe from services/recipeService which should be the same base.
  // The store ensures createdAt is present.
  const recipesToDisplayFromStore = actualSavedRecipes.filter(
    (recipe): recipe is RecipeWithTimestamp => recipe.createdAt !== undefined
  );

  const isRecipeNew = useMemo(() => {
    const now = Date.now();
    return (recipe: RecipeWithTimestamp): boolean => {
      if (!lastNewRecipeTimestamp) return false; // No notification timestamp to compare against
      const recipeTimestamp = recipe.createdAt ? parseInt(recipe.createdAt, 10) : 0;
      if (isNaN(recipeTimestamp) || recipeTimestamp === 0) return false; // Invalid or missing createdAt

      // If the recipe's save/creation timestamp is older than the last new recipe notification, it's not "new" in this context
      if (recipeTimestamp < lastNewRecipeTimestamp) {
        return false;
      }

      // Check if the recipe was actually saved/created recently (e.g., within NEW_RECIPE_THRESHOLD)
      return (now - recipeTimestamp) < NEW_RECIPE_THRESHOLD;
    };
  }, [lastNewRecipeTimestamp]);
  
  // Get all unique tags from the actual saved recipes
  const allTags = Array.from(
    new Set(recipesToDisplayFromStore.flatMap((recipe: RecipeWithTimestamp) => recipe.tags || []))
  );

  // Filter recipes based on search query and selected category
  const filteredRecipes = recipesToDisplayFromStore // Use the initially filtered list
    .filter((recipe: RecipeWithTimestamp) => { // Add type for recipe
      const matchesSearch = searchQuery === '' || 
        (recipe.title && recipe.title.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || 
        (recipe.tags && recipe.tags.includes(selectedCategory));
      
      return matchesSearch && matchesCategory;
    });

  // Handle recipe press - either view or select
  const handleRecipePress = (recipeId: string) => {
    if (isSelectionMode) {
      handleRecipeSelection(recipeId);
    } else {
      router.push(`/recipe/${recipeId}`);
    }
  };

  // Toggle recipe selection
  const handleRecipeSelection = (recipeId: string) => {
    setSelectedRecipes((prev: string[]) => {
      if (prev.includes(recipeId)) {
        return prev.filter((id: string) => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    const wasSelectionMode = isSelectionMode;
    setIsSelectionMode((prev: boolean) => !prev);
    if (wasSelectionMode) { // Check previous state for reset logic
      setSelectedRecipes([]);
    }
  };

  // Handle bulk actions completion
  const handleBulkActionComplete = () => {
    setIsSelectionMode(false);
    setSelectedRecipes([]);
  };

  // Toggle view type (list or grid)
  const toggleViewType = () => {
    setViewType((prev: 'grid' | 'list') => (prev === 'list' ? 'grid' : 'list'));
  };

  // Handle sort change
  const handleSortChange = (sort: SortByType) => {
    setSortBy(sort);
  };

  // Handle unsave recipe
  const handleToggleSave = (recipeTitle: string, recipeId?: string) => {
      console.log(`Removing saved recipe: ${recipeTitle}`);
      savedRecipesStore.removeSavedRecipe(recipeTitle);
  
      // Ensure recipeId is handled properly
      if (!recipeId) {
        console.warn(`Recipe ID is missing for recipe: ${recipeTitle}`);
        return;
      }
  
      // If in selection mode and the unsaved recipe was selected, remove it
      if (isSelectionMode && selectedRecipes.includes(recipeId)) {
        setSelectedRecipes((prev: string[]) => prev.filter((id: string) => id !== recipeId));
      }
    };
  
  // Handle add to meal plan
  const handleAddToMealPlan = (recipeId: string) => {
    const recipeToAdd = recipesToDisplayFromStore.find((r: RecipeWithTimestamp) => r.id === recipeId);
    if (!recipeToAdd) {
      Alert.alert("Error", "Recipe not found.");
      return;
    }
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    // For simplicity, adding to 'lunch'. This could be made more dynamic.
    const mealType: MealType = 'lunch'; 
    
    const newScheduledMeal: ScheduledMeal = {
      id: `${today}-${mealType}-${recipeId}-${uuidv4()}`, // Unique ID using uuid
      date: today,
      mealType: mealType,
      recipeId: recipeId,
      recipe: recipeToAdd, // Pass the full recipe object
      notificationsEnabled: false, // Default or from user settings
    };

    mealPlannerStore.scheduleMeal(newScheduledMeal);
    Alert.alert("Success", `${recipeToAdd.title} added to your meal plan for ${mealType} on ${today}!`);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  // Render category filter button
  const renderCategoryButton = (category: CategoryType) => (
    <Pressable
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text 
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.categoryButtonTextActive
        ]}
      >
        {category}
      </Text>
    </Pressable>
  );

  // If no saved recipes
  if (recipesToDisplayFromStore.length === 0) { // Use recipesToDisplayFromStore for the initial check
    return (
      <View style={styles.emptyContainer}>
        <EmptyStateAnimation style={styles.emptyAnimation} />
        <Text style={styles.emptyText}>No saved recipes yet</Text>
        <Text style={styles.emptySubText}>
          Recipes you save will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with emoji and search */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.emoji}>😋</Text>
          <Text style={styles.headerTitle}>Saved Recipes</Text>
        </View>
        <Pressable style={styles.searchIcon}>
          <FontAwesome name="search" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchBarContainer}>
        <FontAwesome name="search" size={16} color={colors.textSecondary} style={styles.searchBarIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved recipes"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Category filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.categoryFilters}>
          {renderCategoryButton('All')}
          {renderCategoryButton('Breakfast')}
          {renderCategoryButton('Dinner')}
          {renderCategoryButton('Lunch')}
        </View>
        
        <Pressable 
          style={styles.sortByButton}
          onPress={() => setSortByOpen(!sortByOpen)}
        >
          <Text style={styles.sortByText}>Sort by</Text>
          <FontAwesome 
            name={sortByOpen ? "chevron-up" : "chevron-down"} 
            size={12} 
            color={colors.textSecondary} 
            style={styles.sortByIcon} 
          />
        </Pressable>
      </View>
      
      {/* Recipe count and view type toggle */}
      <View style={styles.recipeCountContainer}>
        <Text style={styles.recipeCount}>{filteredRecipes.length} Recipes</Text>
        <View style={styles.viewTypeToggle}>
          <Pressable
            style={[styles.viewTypeButton, viewType === 'list' && styles.viewTypeButtonActive]}
            onPress={() => setViewType('list')}
          >
            <FontAwesome name="list" size={16} color={viewType === 'list' ? colors.primary : colors.textSecondary} />
          </Pressable>
          <Pressable
            style={[styles.viewTypeButton, viewType === 'grid' && styles.viewTypeButtonActive]}
            onPress={() => setViewType('grid')}
          >
            <FontAwesome name="th-large" size={16} color={viewType === 'grid' ? colors.primary : colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Recipe list */}
      {filteredRecipes.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No recipes match your search</Text>
          <Pressable onPress={resetFilters} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          numColumns={viewType === 'grid' ? 2 : 1}
          renderItem={({ item }: ListRenderItemInfo<RecipeWithTimestamp>) => {
            const cardStyle: ViewStyle = viewType === 'grid' ? styles.gridCard : styles.listCard;
            const isNew = isRecipeNew(item);
            
            // The `prepareRecipeForCard` function processes a recipe object to format it for display in the RecipeCard component.
            // Expected input: A recipe object with properties like title, tags, and createdAt.
            // Expected output: A formatted recipe object suitable for the RecipeCard component.
            return (
              <RecipeCard
                recipe={prepareRecipeForCard(item)} // item should be RecipeWithTimestamp
                style={selectedRecipes.includes(item.id) ? {...cardStyle, ...styles.selectedCard} : cardStyle}
                onPress={() => handleRecipePress(item.id)}
                onLongPress={() => {
                  if (!isSelectionMode) {
                    setIsSelectionMode(true);
                    setSelectedRecipes([item.id]);
                  }
                }}
                selected={selectedRecipes.includes(item.id)}
                selectable={isSelectionMode}
                isNew={isNew}
                onSaveToggle={() => handleToggleSave(item.title, item.id)} // Pass title and id
                onAddToMealPlan={() => handleAddToMealPlan(item.id)}
                // Removed redundant rating, cookTime, servings props as they are in `prepareRecipeForCard(item)`
                // onCookNow is covered by the main onPress if it navigates to recipe details
              />
            );
          }}
          contentContainerStyle={viewType === 'grid' ? styles.gridContent : styles.listContent}
        />
      )}

      {/* Bulk action bar */}
      {isSelectionMode && (
        <BulkActionBar
          visible={isSelectionMode} // Add the visible prop
          onDelete={() => {
            selectedRecipes.forEach((recipeId: string) => { // Add type for recipeId
              const recipe = recipesToDisplayFromStore.find((r: RecipeWithTimestamp) => r.id === recipeId); // Use recipesToDisplayFromStore
              if (recipe) {
                savedRecipesStore.removeSavedRecipe(recipe.title);
              }
            });
            handleBulkActionComplete(); // Call only once
          }}
          onShare={() => {
            // Handle share logic here
            // Example: console.log("Sharing:", selectedRecipes);
            handleBulkActionComplete();
          }}
          onCancel={toggleSelectionMode} // Add onCancel to exit selection mode
          selectedCount={selectedRecipes.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    ...typography.titleLarge,
    color: colors.textPrimary,
  },
  searchIcon: {
    padding: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE', // Consider using colors.inputBackground or similar from your constants
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchBarIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0, 
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilters: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEEEEE', // Consider using colors.surface or similar
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary, 
  },
  categoryButtonText: {
    fontSize: 14, // Consider using typography constants
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: colors.textInverse, // Assuming primary button text is white
  },
  sortByButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortByText: {
    fontSize: 14, // Consider using typography constants
    color: colors.textSecondary,
    marginRight: 4,
  },
  sortByIcon: {
    marginTop: 2, // Adjust as needed for alignment
  },
  recipeCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recipeCount: {
    fontSize: 16, // Consider using typography constants
    fontWeight: '600', // Consider using typography constants
    color: colors.textPrimary,
  },
  viewTypeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewTypeButton: {
    padding: 8,
    marginLeft: 8,
  },
  viewTypeButtonActive: {
    // backgroundColor: colors.primaryLight, // Example active style
    // borderRadius: 8, // Example active style
  },
  listContent: {
    paddingHorizontal: 16, // Add horizontal padding for list view
    paddingBottom: 100, // Ensure space for bulk action bar
  },
  gridContent: {
    paddingHorizontal: 8, // Adjust for grid view
    paddingBottom: 100, // Ensure space for bulk action bar
  },
  listCard: { // Added for clarity, can be empty if no specific list styles
    marginBottom: 16, // Add margin for list items
  },
  gridCard: {
    margin: 8,
    flex: 1,
    // maxWidth: '48%', // Ensure two columns with a small gap
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12, // Match card's border radius if it has one
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  emptyAnimation: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  resetButton: {
    paddingVertical: 10, // Increased padding
    paddingHorizontal: 20, // Increased padding
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  resetButtonText: {
    ...typography.labelMedium, // Ensure this is defined in typography
    color: colors.primary,
    fontWeight: '600', // Make text bolder
  }
});
