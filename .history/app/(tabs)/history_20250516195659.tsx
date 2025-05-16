import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, FlaskConical, Trash2, History, Tag, Bookmark, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import SearchBar from '@/components/SearchBar';
import RecipeFilter, { RecipeFilterOptions } from '@/components/RecipeFilter';
import CategoryTag from '@/components/CategoryTag';
import colors from '@/constants/colors';
import { useRecipeHistoryStore } from '@/stores/recipeHistoryStore';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { Recipe } from '@/services/recipeService';

const defaultFilterOptions: RecipeFilterOptions = {
  sortBy: 'newest',
  dateFilter: 'all',
  tagsOnly: false,
  savedOnly: false,
  selectedTags: [],
};

export default function HistoryScreen() {
  const router = useRouter();

  // Get store data and methods
  const { 
    history, 
    filteredHistory, 
    searchHistory, 
    getHistoryTags,
    applyHistoryFilters,
    resetHistoryFilters,
    clearHistory
  } = useRecipeHistoryStore();
  
  const { isSaved, saveRecipe } = useSavedRecipesStore();

  // State for this screen
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<RecipeFilterOptions>(defaultFilterOptions);
  const [refreshing, setRefreshing] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Initialize the screen
  useEffect(() => {
    // Load all tags
    setAllTags(getHistoryTags());
    
    // Init filter
    resetHistoryFilters();
  }, [getHistoryTags, resetHistoryFilters]);
  
  // Update tags when history changes
  useEffect(() => {
    setAllTags(getHistoryTags());
  }, [history, getHistoryTags]);

  // Handle search changes with debouncing
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    
    // Update filters with search text
    applyHistoryFilters({
      ...filterOptions,
      searchText: text
    });
  }, [applyHistoryFilters, filterOptions]);

  // Handle filter changes
  const handleFilterChange = useCallback((options: RecipeFilterOptions) => {
    setFilterOptions(options);
    
    // Apply all filters including current search
    applyHistoryFilters({
      ...options,
      searchText: searchQuery
    });
  }, [applyHistoryFilters, searchQuery]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Reset to defaults
    const newOptions = { ...defaultFilterOptions, selectedTags: [] };
    setFilterOptions(newOptions);
    setSearchQuery('');
    resetHistoryFilters();
    
    setRefreshing(false);
  }, [resetHistoryFilters]);

  // Handle recipe press
  const handleRecipePress = useCallback((recipe: Recipe) => {
    router.push({
      pathname: '/recipe',
      params: { recipeId: recipe.id }
    });
  }, [router]);

  // Clear all history
  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your recipe history? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            clearHistory();
          },
        },
      ]
    );
  }, [clearHistory]);

  // Save recipe to saved recipes
  const handleSaveRecipe = useCallback((recipe: Recipe) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    saveRecipe(recipe);
    Alert.alert('Recipe Saved', 'Recipe has been added to your saved collection');
  }, [saveRecipe]);

  // Format the relative time for display
  const getRelativeTime = useCallback((dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMin < 1) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Render a recipe card
  const renderRecipeItem = useCallback(({ item }: { item: Recipe }) => {
    const recipeIsSaved = isSaved(item.title);
    
    return (
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
            <View style={styles.timeContainer}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
            </View>
            
            {item.category && (
              <CategoryTag category={item.category} size="small" style={styles.categoryTag} />
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
        
        {!recipeIsSaved && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleSaveRecipe(item)}
          >
            <Bookmark size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }, [handleRecipePress, handleSaveRecipe, isSaved, getRelativeTime]);

  // Handle empty state
  const renderEmptyState = useCallback(() => {
    // Check if we're filtering or if there's no history at all
    const isFiltering = searchQuery.trim() !== '' || 
                       filterOptions.selectedTags.length > 0 || 
                       filterOptions.dateFilter !== 'all' ||
                       filterOptions.tagsOnly;
    
    if (isFiltering && history.length > 0) {
      // We have history but the filter returned none
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
    
    // No history at all
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=1776&auto=format&fit=crop' }}
          style={styles.emptyImage}
          contentFit="cover"
        />
        <Text style={styles.emptyTitle}>No recipe history yet</Text>
        <Text style={styles.emptyText}>
          Your recipe history will appear here as you create new recipes.
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
    history.length,
    searchQuery,
    filterOptions,
    onRefresh,
    router
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe History</Text>
        <View style={styles.headerIcons}>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory}>
              <Trash2 size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search recipe history..."
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
        data={filteredHistory}
        renderItem={renderRecipeItem}
        keyExtractor={(item, index) => item.id ?? `${item.title}-${index}`}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
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
  saveButton: {
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