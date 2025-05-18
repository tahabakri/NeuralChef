import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  Alert,
  RefreshControl,
  SafeAreaView,
  Image,
  Share,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as StatusBarAPI from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

import SearchBar from '@/components/SearchBar';
import RecipeFilter, { RecipeFilterOptions } from '@/components/RecipeFilter';
import DeleteAction from '@/components/DeleteAction';
import RecipeCard from '@/components/RecipeCard';
import colors from '@/constants/colors';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { Recipe } from '@/services/recipeService';

const { width } = Dimensions.get('window');

// Define specific types for filter options to match RecipeFilter.tsx
type SortByType = 'newest' | 'oldest' | 'name' | 'rating';
type DateFilterType = 'all' | 'today' | 'week' | 'month';

interface SavedScreenFilterOptions extends Omit<RecipeFilterOptions, 'sortBy' | 'dateFilter'> {
  sortBy: SortByType;
  dateFilter: DateFilterType;
}

const defaultFilterOptions: SavedScreenFilterOptions = {
  sortBy: 'newest',
  dateFilter: 'all',
  tagsOnly: false,
  savedOnly: true, // On the saved tab, this is always true
  selectedTags: [],
};

// Adapter to convert service Recipe to RecipeCard Recipe
const adaptRecipeForCard = (serviceRecipe: Recipe): import('@/components/RecipeCard').Recipe => {
  let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'; // Default difficulty
  if (serviceRecipe.difficulty) {
    const lowerDifficulty = serviceRecipe.difficulty.toLowerCase();
    if (lowerDifficulty === 'easy' || lowerDifficulty === 'medium' || lowerDifficulty === 'hard') {
      difficulty = lowerDifficulty as 'Easy' | 'Medium' | 'Hard';
    }
  }

  return {
    id: serviceRecipe.id || `recipe-${serviceRecipe.title}-${Math.random()}`,
    title: serviceRecipe.title,
    image: serviceRecipe.heroImage || serviceRecipe.steps?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1542010589005-d1eacc3918f2', // Ensure image is a string or ImageSourcePropType
    cookTime: Number(serviceRecipe.cookTime?.replace(/[^0-9]/g, '') || '30'), // Ensure cookTime is number
    difficulty: difficulty,
    rating: serviceRecipe.rating || 4.5, // Ensure rating is number
    saved: true, // This is the saved screen, so always true
    tags: serviceRecipe.tags,
    ingredients: serviceRecipe.ingredients,
  };
};

export default function SavedScreen() {
  const router = useRouter();

  // Get store data and methods
  const { 
    savedRecipes, 
    filteredRecipes, 
    searchRecipes, 
    getAllTags,
    applyFilters: applyStoreFilters, // Renamed to avoid conflict
    resetFilters,
    removeSavedRecipe 
  } = useSavedRecipesStore();

  // State for this screen
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<SavedScreenFilterOptions>(defaultFilterOptions);
  const [refreshing, setRefreshing] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Reference for open swipeable
  const swipeableRef = useRef<Swipeable | null>(null);
  const openedSwipeableIndex = useRef<number | null>(null);
  
  // Initialize the screen
  useEffect(() => {
    // Load all tags
    setAllTags(getAllTags());
    
    // Init filter by applying default store filters
    applyStoreFilters({
      searchText: '',
      sortBy: defaultFilterOptions.sortBy,
      dateFilter: defaultFilterOptions.dateFilter,
      tagsOnly: defaultFilterOptions.tagsOnly,
      tags: defaultFilterOptions.selectedTags,
    });
  }, [getAllTags, applyStoreFilters]);
  
  // Update tags when saved recipes change
  useEffect(() => {
    setAllTags(getAllTags());
  }, [savedRecipes, getAllTags]);

  // Handle search changes with debouncing
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    
    // Update filters with search text
    applyStoreFilters({
      searchText: text,
      sortBy: filterOptions.sortBy,
      dateFilter: filterOptions.dateFilter,
      tagsOnly: filterOptions.tagsOnly,
      tags: filterOptions.selectedTags,
    });
  }, [applyStoreFilters, filterOptions]);

  // Handle filter changes
  const handleFilterChange = useCallback((options: RecipeFilterOptions) => { // Explicitly type options
    const newFilterOptions: SavedScreenFilterOptions = {
      ...options, // options is RecipeFilterOptions from RecipeFilter.tsx
      savedOnly: true, // Ensure savedOnly remains true for this screen
    };
    setFilterOptions(newFilterOptions);
    
    // Apply all filters including current search
    applyStoreFilters({
      searchText: searchQuery,
      sortBy: newFilterOptions.sortBy,
      dateFilter: newFilterOptions.dateFilter,
      tagsOnly: newFilterOptions.tagsOnly,
      tags: newFilterOptions.selectedTags,
    });
  }, [applyStoreFilters, searchQuery]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Reset to defaults
    const newOptions = { ...defaultFilterOptions, selectedTags: [] };
    setFilterOptions(newOptions);
    setSearchQuery('');
    // applyStoreFilters should handle resetting store's internal filters if needed, or use resetFilters
    applyStoreFilters({ 
      searchText: '', 
      sortBy: newOptions.sortBy,
      dateFilter: newOptions.dateFilter,
      tagsOnly: newOptions.tagsOnly,
      tags: newOptions.selectedTags,
    });
    
    setRefreshing(false);
  }, [applyStoreFilters]);

  // Handle recipe press - navigate to recipe screen
  const handleRecipePress = useCallback((recipe: Recipe) => {
    // Close any open swipeable first
    if (openedSwipeableIndex.current !== null && swipeableRef.current) {
      swipeableRef.current.close();
      openedSwipeableIndex.current = null;
    }
    
    router.push({
      pathname: "/recipe/[id]", // Corrected path for dynamic route
      params: { id: recipe.id || `recipe-${recipe.title}-${Date.now()}` }
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
  
  // Share recipe
  const handleShareRecipe = useCallback(async (recipe: Recipe) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const result = await Share.share({
        title: recipe.title,
        message: `Check out this recipe for ${recipe.title}! ${recipe.description || ''}`,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to share recipe');
    }
  }, []);

  // Render swipeable recipe card
  const renderSwipeableRecipeItem = useCallback(({ item, index }: { item: Recipe; index: number }) => {
    // Create the swipeable with delete action
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
      return (
        <DeleteAction
          dragX={progress}
          onPress={() => handleDeleteRecipe(item)}
        />
      );
    };
    
    // Set up the swipeable ref for the current item if it's opened
    const onSwipeableOpen = () => {
      openedSwipeableIndex.current = index;
    };
    
    // Close any other open swipeables when a new one is opened
    const onSwipeableWillOpen = () => {
      if (openedSwipeableIndex.current !== null && 
          openedSwipeableIndex.current !== index && 
          swipeableRef.current) {
        swipeableRef.current.close();
      }
    };
    
    const recipeCardData = adaptRecipeForCard(item);
    
    return (
      <Swipeable
        ref={ref => {
          // Only assign the ref if this is the opened swipeable
          if (openedSwipeableIndex.current === index) {
            swipeableRef.current = ref;
          }
        }}
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        onSwipeableOpen={onSwipeableOpen}
        onSwipeableWillOpen={onSwipeableWillOpen}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleRecipePress(item)}
          onLongPress={() => handleShareRecipe(item)}
          delayLongPress={500}
        >
          <RecipeCard 
            recipe={recipeCardData} 
            type="horizontal"
            style={{ backgroundColor: 'transparent' }}
            backgroundComponent={
              <LinearGradient
                colors={['#FFF3E0', '#FFE0B2']} // Soft Peach gradient
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            }
          />
        </TouchableOpacity>
      </Swipeable>
    );
  }, [handleRecipePress, handleDeleteRecipe, handleShareRecipe]);

  // Handle empty state
  const renderEmptyState = useCallback(() => {
    // Check if we're filtering or if there are no saved recipes at all
    const isFiltering = searchQuery.trim() !== '' || 
                        filterOptions.selectedTags.length > 0 || 
                        filterOptions.dateFilter !== 'all' ||
                        filterOptions.tagsOnly; // tagsOnly itself is a filter condition

    if (isFiltering) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Recipes Found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search or filter criteria.
          </Text>
          <TouchableOpacity 
            style={styles.clearFilterButton}
            onPress={() => handleFilterChange(defaultFilterOptions)}
          >
            <LinearGradient
              colors={['#FFA726', '#FB8C00']} // Sunrise Orange gradient
              style={[styles.clearFilterButton, { backgroundColor: 'transparent' }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    
    // If no recipes are saved at all
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bookmark-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Saved Recipes</Text>
        <Text style={styles.emptyText}>
          You haven't saved any recipes yet. Start exploring and save your favorites!
        </Text>
        <TouchableOpacity onPress={() => router.push('/')}>
          <LinearGradient
            colors={['#FFA726', '#FB8C00']} // Sunrise Orange gradient
            style={styles.exploreButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.exploreButtonText}>Explore Recipes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }, [searchQuery, filterOptions, router, handleFilterChange]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Header with Title & Search */}
        <LinearGradient
          colors={['#5D4037', '#3E2723']} // Warm Cocoa gradient
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={[styles.headerTitle, { color: colors.white }]}>Saved Recipes</Text>
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search saved recipes..."
          />
        </LinearGradient>
        
        {/* Filters */}
        <RecipeFilter 
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          allTags={allTags}
        />
        
        {/* Recipe List */}
        <FlatList
          data={filteredRecipes}
          renderItem={renderSwipeableRecipeItem}
          keyExtractor={(item) => item.id || item.title} // Ensure key is always string
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBarAPI as any).currentHeight || 24 + 16 : 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1, // Important for ListEmptyComponent to work correctly
  },
  itemSeparator: {
    height: 12, // Space between cards
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  clearFilterButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  exploreButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  }
}); 