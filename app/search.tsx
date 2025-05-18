import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SearchBar from '@/components/SearchBar';
import RecipeCard from '@/components/RecipeCard';
import FilterDropdown from '@/components/FilterDropdown';
import colors from '@/constants/colors';
import { Recipe as ServiceRecipe } from '@/services/recipeService';
import { useRecipeStore } from '@/stores/recipeStore';

// Interface that combines both recipe types
interface SearchRecipe {
  id: string;
  title: string;
  description?: string;
  image: string;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  prepTime: string;
  ingredients: string[];
  tags?: string[];
  heroImage?: string;
  servings: number;
  steps: { instruction: string }[];
}

interface SearchResults {
  recipes: SearchRecipe[];
  loading: boolean;
  error: string | null;
}

type SortOption = 'relevance' | 'time' | 'difficulty' | 'category';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = (params.query as string) || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResults>({
    recipes: [],
    loading: false,
    error: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [maxPrepTime, setMaxPrepTime] = useState(0); // in minutes
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // We're accessing plain hasNewRecipe property, which exists in RecipeStore
  const hasNewRecipe = useRecipeStore(state => state.hasNewRecipe);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  // Filter and sort results when filter options change
  useEffect(() => {
    if (searchResults.recipes.length > 0) {
      applyFiltersAndSort();
    }
  }, [sortBy, maxPrepTime, selectedDifficulty, selectedCategory]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults({
        recipes: [],
        loading: false,
        error: null,
      });
      return;
    }

    setSearchResults(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // In a real app, this would call an API endpoint
      // For now, just using sample data
      const term = searchTerm.toLowerCase();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample recipes that might match the search
      const sampleRecipes: SearchRecipe[] = [
        {
          id: `search-${Date.now()}-1`,
          title: `${searchTerm} Pasta`,
          description: `Delicious pasta dish featuring ${searchTerm}.`,
          ingredients: [searchTerm.toLowerCase(), 'pasta', 'olive oil', 'garlic', 'parmesan'],
          steps: [
            { instruction: 'Boil pasta according to package instructions.' },
            { instruction: `Prepare ${searchTerm} and combine with pasta.` },
            { instruction: 'Season and serve hot.' }
          ],
          prepTime: '10 min',
          cookTime: 20,
          servings: 2,
          difficulty: 'Easy',
          rating: 4.5,
          tags: ['pasta', 'dinner'],
          heroImage: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=2070&auto=format&fit=crop',
          image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=2070&auto=format&fit=crop'
        },
        {
          id: `search-${Date.now()}-2`,
          title: `${searchTerm} Salad`,
          description: `Fresh salad with ${searchTerm} as the star ingredient.`,
          ingredients: [searchTerm.toLowerCase(), 'lettuce', 'cucumber', 'olive oil', 'lemon juice'],
          steps: [
            { instruction: 'Wash and prepare all vegetables.' },
            { instruction: `Add ${searchTerm} and mix well.` },
            { instruction: 'Dress with olive oil and lemon juice.' }
          ],
          prepTime: '15 min',
          cookTime: 0,
          servings: 2,
          difficulty: 'Medium',
          rating: 4.2,
          tags: ['salad', 'healthy', 'lunch'],
          heroImage: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=2064&auto=format&fit=crop',
          image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=2064&auto=format&fit=crop'
        },
        {
          id: `search-${Date.now()}-3`,
          title: `${searchTerm} Roast`,
          description: `Hearty roast with ${searchTerm} flavors.`,
          ingredients: [searchTerm.toLowerCase(), 'beef', 'potatoes', 'carrots', 'herbs'],
          steps: [
            { instruction: 'Preheat oven to 350°F.' },
            { instruction: `Season meat with ${searchTerm} and herbs.` },
            { instruction: 'Roast until done to your liking.' }
          ],
          prepTime: '30 min',
          cookTime: 120,
          rating: 4.8,
          servings: 4,
          difficulty: 'Hard',
          tags: ['dinner', 'meat'],
          heroImage: 'https://images.unsplash.com/photo-1608877907149-a5c32d232714?q=80&w=2070&auto=format&fit=crop',
          image: 'https://images.unsplash.com/photo-1608877907149-a5c32d232714?q=80&w=2070&auto=format&fit=crop'
        }
      ];
      
      setSearchResults({
        recipes: sampleRecipes,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        recipes: [],
        loading: false,
        error: 'Failed to search. Please try again.',
      });
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...searchResults.recipes];
    
    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }
    
    // Apply prep time filter
    if (maxPrepTime > 0) {
      filtered = filtered.filter(recipe => {
        // Extract minutes from prepTime string (e.g., "10 min" -> 10)
        const timeMatch = recipe.prepTime.match(/(\d+)/);
        const prepTimeMinutes = timeMatch ? parseInt(timeMatch[1], 10) : 999;
        return prepTimeMinutes <= maxPrepTime;
      });
    }
    
    // Apply category filter
    if (selectedCategory !== 'all' && selectedCategory !== '') {
      filtered = filtered.filter(recipe => 
        recipe.tags?.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'time':
        filtered.sort((a, b) => {
          const aTimeMatch = a.prepTime.match(/(\d+)/);
          const bTimeMatch = b.prepTime.match(/(\d+)/);
          const aTime = aTimeMatch ? parseInt(aTimeMatch[1], 10) : 0;
          const bTime = bTimeMatch ? parseInt(bTimeMatch[1], 10) : 0;
          return aTime - bTime;
        });
        break;
      case 'difficulty':
        const difficultyOrder = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
        filtered.sort((a, b) => {
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
        break;
      case 'category':
        // Sort alphabetically by the first tag
        filtered.sort((a, b) => {
          const aTag = a.tags && a.tags.length > 0 ? a.tags[0] : '';
          const bTag = b.tags && b.tags.length > 0 ? b.tags[0] : '';
          return aTag.localeCompare(bTag);
        });
        break;
      default: // relevance - keep original order
        break;
    }
    
    setSearchResults(prev => ({ ...prev, recipes: filtered }));
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    performSearch(searchTerm);
    
    // Update URL params without full navigation
    router.setParams({ query: searchTerm });
  };
  
  const handleRecipePress = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/recipe/[id]',
      params: { id: recipeId }
    });
  };
  
  const toggleFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
  };

  const renderRecipeItem = ({ item }: { item: SearchRecipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item.id)}
      activeOpacity={0.8}
    >
      <RecipeCard recipe={item} type="horizontal" />
    </TouchableOpacity>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={48} color={colors.textSecondary} />
      {query.length > 0 ? (
        <>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            We couldn't find any recipes matching "{query}".
            Try different keywords or ingredients.
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.emptyTitle}>Search Recipes</Text>
          <Text style={styles.emptyText}>
            Search by recipe name, ingredients, or meal type
          </Text>
        </>
      )}
    </View>
  );

  const renderFilterHeader = () => {
    if (!searchResults.recipes.length) return null;
    
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={toggleFilters}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={showFilters ? "options" : "options-outline"} 
            size={20} 
            color={colors.textSecondary} 
          />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
        
        <Text style={styles.resultCount}>
          {searchResults.recipes.length} {searchResults.recipes.length === 1 ? 'recipe' : 'recipes'} found
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen options={{ 
        title: 'Search Recipes',
        headerShown: true,
        headerTitleStyle: {
          fontWeight: '600',
        }
      }} />
      
      <View style={styles.searchContainer}>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search recipes, ingredients..."
        />
      </View>
      
      {showFilters && searchResults.recipes.length > 0 && (
        <View style={styles.filtersRow}>
          <FilterDropdown
            type="dietary"
            label="Sort By"
            selectedDietaryValue={sortBy as any}
            onDietaryChange={(value) => setSortBy(value as SortOption)}
          />
          
          <FilterDropdown
            type="time"
            label="Prep Time"
            cookingTimeLimit={maxPrepTime}
            onCookingTimeLimitChange={setMaxPrepTime}
          />
          
          <FilterDropdown
            type="dietary"
            label="Difficulty"
            selectedDietaryValue={selectedDifficulty as any}
            onDietaryChange={(value) => setSelectedDifficulty(value as any)}
          />
        </View>
      )}
      
      {searchResults.loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching for recipes...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults.recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={renderFilterHeader}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  resultCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  recipeCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
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
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 