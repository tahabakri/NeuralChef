import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, FlatList, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import RecipeCard, { prepareRecipeForCard, Recipe } from '@/components/RecipeCard';
import { useRecipeStore } from '@/stores/recipeStore';
import SearchBar from '@/components/SearchBar';
import TagFilter from '@/components/TagFilter';
import BulkActionBar from '@/components/BulkActionBar';
import EmptyStateAnimation from '@/components/EmptyStateAnimation';
import { FontAwesome } from '@expo/vector-icons';

// Extend Recipe type to include createdAt
interface RecipeWithTimestamp extends Recipe {
  createdAt?: string; // Changed to string to match expected type
}

export default function SavedScreen() {
  const router = useRouter();
  const { recipes } = useRecipeStore();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  
  // Mock saved recipes for now - in a real app, you would have a "saved" flag or collection
  const savedRecipes = recipes.filter(recipe => recipe.id.startsWith('1')) as RecipeWithTimestamp[];
  
  // Get all unique tags from saved recipes
  const allTags = Array.from(
    new Set(savedRecipes.flatMap(recipe => recipe.tags || []))
  );

  // Filter recipes based on search query and selected tags
  const filteredRecipes = savedRecipes
    .filter(recipe => {
      const matchesSearch = searchQuery === '' || 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => recipe.tags?.includes(tag));
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'oldest':
          // Parse string to number for comparison, fallback to current time
          return (parseInt(a.createdAt || `${Date.now()}`, 10)) - (parseInt(b.createdAt || `${Date.now()}`, 10));
        case 'newest':
        default:
          return (parseInt(b.createdAt || `${Date.now()}`, 10)) - (parseInt(a.createdAt || `${Date.now()}`, 10));
      }
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
    setSelectedRecipes(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
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
    setViewType(prev => prev === 'list' ? 'grid' : 'list');
  };

  // Handle sort change
  const handleSortChange = (sort: 'newest' | 'oldest' | 'alphabetical') => {
    setSortBy(sort);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortBy('newest');
  };

  // If no saved recipes
  if (savedRecipes.length === 0) {
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
      {/* Header with search and actions */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <SearchBar 
            placeholder="Search saved recipes..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.iconButton} 
            onPress={toggleSelectionMode}
          >
            <FontAwesome 
              name={isSelectionMode ? "check-square-o" : "square-o"} 
              size={22} 
              color={colors.primary} 
            />
          </Pressable>
          <Pressable 
            style={styles.iconButton} 
            onPress={toggleViewType}
          >
            <FontAwesome 
              name={viewType === 'grid' ? "list" : "th-large"} 
              size={22} 
              color={colors.primary} 
            />
          </Pressable>
        </View>
      </View>
      
      {/* Tag filters */}
      <TagFilter
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
      />
      
      {/* Sort options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <Pressable
          style={[styles.sortOption, sortBy === 'newest' && styles.sortOptionActive]}
          onPress={() => handleSortChange('newest')}
        >
          <Text style={[styles.sortText, sortBy === 'newest' && styles.sortTextActive]}>
            Newest
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sortOption, sortBy === 'oldest' && styles.sortOptionActive]}
          onPress={() => handleSortChange('oldest')}
        >
          <Text style={[styles.sortText, sortBy === 'oldest' && styles.sortTextActive]}>
            Oldest
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sortOption, sortBy === 'alphabetical' && styles.sortOptionActive]}
          onPress={() => handleSortChange('alphabetical')}
        >
          <Text style={[styles.sortText, sortBy === 'alphabetical' && styles.sortTextActive]}>
            A-Z
          </Text>
        </Pressable>
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
          renderItem={({ item }) => {
            const cardStyle: ViewStyle = viewType === 'grid' ? styles.gridCard : styles.listCard;
            
            return (
              <RecipeCard
                recipe={prepareRecipeForCard(item)}
                type={viewType === 'grid' ? 'vertical' : 'horizontal'}
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
              />
            );
          }}
          contentContainerStyle={viewType === 'grid' ? styles.gridContent : styles.listContent}
        />
      )}

      {/* Bulk action bar */}
      {isSelectionMode && (
        <BulkActionBar
          visible={isSelectionMode}
          selectedCount={selectedRecipes.length}
          onCancel={toggleSelectionMode}
          onDelete={() => {
            // Handle delete logic here
            handleBulkActionComplete();
          }}
          onShare={() => {
            // Handle share logic here
            handleBulkActionComplete();
          }}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  tagFilter: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sortLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginRight: 8,
  },
  sortOption: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
  },
  sortOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  sortText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  sortTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: 16,
  },
  gridContent: {
    padding: 8,
  },
  listCard: {
    marginBottom: 12,
  },
  gridCard: {
    margin: 8,
    flex: 1,
    maxWidth: '50%',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
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
    color: colors.text,
    marginBottom: 8,
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
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  resetButtonText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
});
