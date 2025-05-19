import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import RecipeCard, { prepareRecipeForCard } from '@/components/RecipeCard';
import TagSelector from '@/components/TagSelector';
import SearchBar from '@/components/SearchBar';
import { useRecipeStore } from '@/stores/recipeStore';

const CATEGORIES = [
  'All',
  'Quick & Easy',
  'Healthy',
  'Vegetarian',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks'
];


export default function PopularScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    popularRecipes,
    isLoading,
    fetchPopularRecipes,
  } = useRecipeStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    fetchPopularRecipes();
  }, [fetchPopularRecipes]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPopularRecipes();
    setRefreshing(false);
  }, [fetchPopularRecipes]);

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const filteredRecipes = React.useMemo(() => {
    return popularRecipes.filter(recipe => {
      if (selectedCategory !== 'All' && !recipe.tags.includes(selectedCategory.toLowerCase())) {
        return false;
      }
      if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [popularRecipes, selectedCategory, searchQuery]);

  return (
    <LinearGradient
      colors={[colors.softPeachStart, colors.softPeachEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.softPeachStart} />
        
        <Stack.Screen
          options={{
            title: 'Popular Recipes',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.softPeachStart,
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              color: colors.text,
            }
          }}
        />

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search popular recipes..."
          />
        </View>

        <TagSelector
          tags={CATEGORIES}
          selectedTag={selectedCategory}
          onSelectTag={setSelectedCategory}
          containerStyle={styles.categoriesContainer}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading popular recipes...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {filteredRecipes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No recipes found</Text>
                <Text style={styles.emptyStateSubText}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : (
              filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={prepareRecipeForCard(recipe)}
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe.id)}
                />
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  recipeCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubText: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
