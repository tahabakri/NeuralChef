import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';

import RecipeCard from '@/components/RecipeCard';
import RecipeFilter, { RecipeFilterOptions } from '@/components/RecipeFilter';
import colors from '@/constants/colors';

// Define trending recipes with types from RecipeCard component
interface TrendingRecipe {
  id: string;
  title: string;
  image: string;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  tags?: string[];
  saved?: boolean;
}

export default function PopularScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trendingRecipes, setTrendingRecipes] = useState<TrendingRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<TrendingRecipe[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<RecipeFilterOptions>({
    sortBy: 'newest',
    dateFilter: 'all',
    tagsOnly: false,
    savedOnly: false,
    selectedTags: [],
  });

  // Load trending recipes
  useEffect(() => {
    loadTrendingRecipes();
  }, []);

  // Apply filters when filter options change
  useEffect(() => {
    applyFilters();
  }, [filterOptions, trendingRecipes]);

  const loadTrendingRecipes = async () => {
    setIsLoading(true);
    try {
      // Simulate API fetch delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample trending recipes data
      const recipes: TrendingRecipe[] = [
        {
          id: 'trend-1',
          title: 'Avocado Toast with Poached Eggs',
          image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop',
          cookTime: 20,
          difficulty: 'Easy',
          rating: 4.8,
          tags: ['breakfast', 'healthy', 'quick'],
          saved: false,
        },
        {
          id: 'trend-2',
          title: 'Creamy Tuscan Chicken Pasta',
          image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop',
          cookTime: 35,
          difficulty: 'Medium',
          rating: 4.7,
          tags: ['dinner', 'pasta', 'italian'],
          saved: true,
        },
        {
          id: 'trend-3',
          title: 'Berry Smoothie Bowl',
          image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&auto=format&fit=crop',
          cookTime: 15,
          difficulty: 'Easy',
          rating: 4.5,
          tags: ['breakfast', 'smoothie', 'vegan'],
          saved: false,
        },
        {
          id: 'trend-4',
          title: 'Crispy Baked Salmon',
          image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&auto=format&fit=crop',
          cookTime: 30,
          difficulty: 'Medium',
          rating: 4.9,
          tags: ['dinner', 'seafood', 'healthy'],
          saved: true,
        },
        {
          id: 'trend-5',
          title: 'Thai Coconut Curry Soup',
          image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=800&auto=format&fit=crop',
          cookTime: 45,
          difficulty: 'Medium',
          rating: 4.6,
          tags: ['soup', 'thai', 'spicy'],
          saved: false,
        },
        {
          id: 'trend-6',
          title: 'Classic Beef Burger',
          image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&auto=format&fit=crop',
          cookTime: 25,
          difficulty: 'Easy',
          rating: 4.4,
          tags: ['burger', 'bbq', 'american'],
          saved: false,
        },
        {
          id: 'trend-7',
          title: 'Mediterranean Falafel Bowl',
          image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop',
          cookTime: 40,
          difficulty: 'Medium',
          rating: 4.7,
          tags: ['mediterranean', 'vegetarian', 'healthy'],
          saved: true,
        },
      ];
      
      setTrendingRecipes(recipes);
      setFilteredRecipes(recipes);
      
      // Extract all unique tags
      const tags = [...new Set(recipes.flatMap(recipe => recipe.tags || []))];
      setAllTags(tags);
    } catch (error) {
      console.error('Error loading trending recipes:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trendingRecipes];
    
    // Apply tag filters
    if (filterOptions.selectedTags.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.tags?.some(tag => filterOptions.selectedTags.includes(tag))
      );
    }
    
    // Apply saved only filter
    if (filterOptions.savedOnly) {
      filtered = filtered.filter(recipe => recipe.saved);
    }
    
    // Apply sorting
    switch (filterOptions.sortBy) {
      case 'oldest':
        // In real app, would sort by date
        filtered = [...filtered].reverse();
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      default: // 'newest', keep original order
        break;
    }
    
    setFilteredRecipes(filtered);
  };

  const handleFilterChange = (options: RecipeFilterOptions) => {
    setFilterOptions(options);
  };

  const handleRecipePress = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/recipe/[id]',
      params: { id: recipeId }
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTrendingRecipes();
  };

  const renderRecipeItem = ({ item }: { item: TrendingRecipe }) => (
    <View style={styles.recipeCardContainer}>
      <RecipeCard 
        recipe={item} 
        type="vertical" 
        onPress={() => handleRecipePress(item.id)}
        onSaveToggle={() => console.log('Toggle save for', item.id)}
        backgroundComponent={
          <LinearGradient
            colors={['#FFCDB2', '#FFB4A2']} // Soft Peach gradient
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Popular Recipes</Text>
        <Text style={styles.headerSubtitle}>Discover trending recipes from our community</Text>
      </View>
      
      {/* Filter row */}
      <View style={styles.filterContainer}>
        <RecipeFilter 
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          allTags={allTags}
        />
      </View>
      
      {/* Recipe grid */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading trending recipes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No recipes found with the selected filters.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFCDB2', // Light peach background
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  recipeCardContainer: {
    width: '48%',
    marginVertical: 10,
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 