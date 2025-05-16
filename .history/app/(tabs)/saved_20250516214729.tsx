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
  Image as RNImage,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, BookOpen, ChevronRight, Filter, FlaskConical, Trash2, Bookmark, Tag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import SearchBar from '@/components/SearchBar';
import RecipeFilter, { RecipeFilterOptions } from '@/components/RecipeFilter';
import CategoryTag from '@/components/CategoryTag';
import colors from '@/constants/colors';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { useRecipeHistoryStore } from '@/stores/recipeHistoryStore';
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

  // Handle recipe press
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
          contentFit="cover"
          onError={() => console.warn('Image failed to load:', item.title)}
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
            <CategoryTag category={item.category} size="small" />
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
            contentFit="cover"
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
          contentFit="cover"
        />
        <Text style={styles.emptyTitle}>No saved recipes yet</Text>
        <Text style={styles.emptyText}>
          When you save recipes, they'll appear here for easy access.
        </Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/')}
        >
          <FlaskConical size={16} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.createButtonText}>Create New Recipe</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Recipes</Text>
        <View style={styles.headerIcons}>
          <Bookmark size={20} color={colors.primary} />
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search saved recipes..."
          onClear={() => handleSearch('')}
          onDebounce={handleSearch}
        />
        
        <View style={styles.filterRow}>
          <RecipeFilter
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            allTags={allTags}
          />
        </View>
      </View>
      
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id || item.title}
        contentContainerStyle={styles.recipeList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  recipeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    height: 140,
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
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
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
  },
  tagIcon: {
    marginRight: 4,
  },
  cardTags: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryTag: {
    marginRight: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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
  },
}); 