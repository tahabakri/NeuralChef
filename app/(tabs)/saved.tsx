import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Bookmark, Tag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import SearchBar from '@/components/SearchBar';
import RecipeFilter, { RecipeFilterOptions } from '@/components/RecipeFilter';
import CategoryTag from '@/components/CategoryTag';
import colors from '@/constants/colors';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { Recipe } from '@/services/recipeService';

const { width } = Dimensions.get('window');

const defaultFilterOptions: RecipeFilterOptions = {
  sortBy: 'newest',
  dateFilter: 'all',
  tagsOnly: false,
  savedOnly: true, // On the saved tab, this is always true
  selectedTags: [],
};

export default function SavedScreen() {
  const router = useRouter();

  // Get store data and methods
  const { 
    savedRecipes, 
    filteredRecipes, 
    searchRecipes, 
    getAllTags,
    applyFilters,
    resetFilters,
    removeSavedRecipe 
  } = useSavedRecipesStore();

  // State for this screen
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<RecipeFilterOptions>(defaultFilterOptions);
  const [refreshing, setRefreshing] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Initialize the screen
  useEffect(() => {
    // Load all tags
    setAllTags(getAllTags());
    
    // Init filter
    resetFilters();
  }, [getAllTags, resetFilters]);
  
  // Update tags when saved recipes change
  useEffect(() => {
    setAllTags(getAllTags());
  }, [savedRecipes, getAllTags]);

  // Handle search changes with debouncing
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    
    // Update filters with search text
    applyFilters({
      ...filterOptions,
      searchText: text
    });
  }, [applyFilters, filterOptions]);

  // Handle filter changes
  const handleFilterChange = useCallback((options: RecipeFilterOptions) => {
    setFilterOptions(options);
    
    // Apply all filters including current search
    applyFilters({
      ...options,
      searchText: searchQuery
    });
  }, [applyFilters, searchQuery]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Reset to defaults
    const newOptions = { ...defaultFilterOptions, selectedTags: [] };
    setFilterOptions(newOptions);
    setSearchQuery('');
    resetFilters();
    
    setRefreshing(false);
  }, [resetFilters]);

  // Handle recipe press - navigate to recipe screen
  const handleRecipePress = useCallback((recipe: Recipe) => {
    router.push({
      pathname: '/recipe',
      params: { recipeId: recipe.id }
    });
  }, [router]);

  // Delete recipe
  const handleDeleteRecipe = useCallback((recipe: Recipe) => {
    Alert.alert(
      'Remove Recipe',
      `Are you sure you want to remove "${recipe.title}" from your saved recipes?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            removeSavedRecipe(recipe.title);
          },
        },
      ]
    );
  }, [removeSavedRecipe]);

  // Render a recipe card
  const renderRecipeItem = useCallback(({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: item.heroImage || item.steps[0]?.imageUrl || 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?q=80&w=2892&auto=format&fit=crop' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.cardGradient}
        />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardMetaContainer}>
          {item.category && (
            <CategoryTag 
              label={item.category}
              selected={true}
            />
          )}
          
          <View style={styles.cardTagsContainer}>
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagIcon}>
                <Tag size={14} color={colors.textSecondary} />
              </View>
            )}
            {item.tags && item.tags.length > 0 && (
              <Text style={styles.cardTags} numberOfLines={1}>
                {item.tags.join(', ')}
              </Text>
            )}
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRecipe(item)}
        accessibilityLabel={`Delete ${item.title} recipe`}
        accessibilityRole="button"
      >
        <Trash2 size={16} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleRecipePress, handleDeleteRecipe]);

  // Handle empty state
  const renderEmptyState = useCallback(() => {
    // Check if we're filtering or if there are no saved recipes at all
    const isFiltering = searchQuery.trim() !== '' || 
                        filterOptions.selectedTags.length > 0 || 
                        filterOptions.dateFilter !== 'all' ||
                        filterOptions.tagsOnly;
    
    if (isFiltering && savedRecipes.length > 0) {
      // We have recipes but the filter returned none
      return (
        <View style={styles.emptyContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=1818&auto=format&fit=crop' }}
            style={styles.emptyImage}
            resizeMode="cover"
          />
          <Text style={styles.emptyTitle}>No matching recipes</Text>
          <Text style={styles.emptyText}>
            No recipes match your current filters. Try adjusting your search or filters.
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={onRefresh}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // No saved recipes at all
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?q=80&w=1587&auto=format&fit=crop' }}
          style={styles.emptyImage}
          resizeMode="cover"
        />
        <Text style={styles.emptyTitle}>No saved recipes yet</Text>
        <Text style={styles.emptyText}>
          When you save recipes, they'll appear here for easy access.
        </Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.createButtonText}>Discover Recipes</Text>
        </TouchableOpacity>
      </View>
    );
  }, [
    savedRecipes.length,
    searchQuery,
    filterOptions,
    onRefresh,
    router
  ]);

  if (savedRecipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.title}>Saved Recipes</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark" size={80} color={colors.border} />
          <Text style={styles.emptyTitle}>No Saved Recipes</Text>
          <Text style={styles.emptyText}>
            Your saved recipes will appear here
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreButtonText}>Explore Recipes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Saved Recipes</Text>
      </View>
      
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id || item.title}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.recipeCard}
            onPress={() => router.push({
              pathname: '/recipe',
              params: { recipeId: item.id }
            })}
          >
            <Image 
              source={{ uri: item.heroImage || item.steps?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2' }}
              style={styles.recipeImage}
            />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <View style={styles.recipeMetaContainer}>
                <View style={styles.recipeMeta}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.recipeMetaText}>{item.cookTime || '30 min'}</Text>
                </View>
                <View style={styles.recipeMeta}>
                  <Ionicons name="star" size={14} color={colors.secondary} />
                  <Text style={styles.recipeMetaText}>{item.rating || '4.5'}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteRecipe(item)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recipeMetaText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
  },
  cardImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  cardMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardTagsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  tagIcon: {
    marginRight: 4,
  },
  cardTags: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  categoryTag: {
    marginRight: 8,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  resetButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 24,
  },
}); 