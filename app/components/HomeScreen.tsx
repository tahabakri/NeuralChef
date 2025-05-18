import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import SearchBar from '@/components/SearchBar';
import RecipeCard from '@/components/RecipeCard';
import IngredientInput from '@/components/IngredientInput';
import { useRecipeStore } from '@/stores/recipeStore';
import { Recipe } from '@/services/recipeService';

// Adapter for RecipeCard component which expects a different Recipe type
const adaptRecipeForCard = (recipe: Recipe): any => {
  return {
    ...recipe,
    image: recipe.heroImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    cookTime: typeof recipe.cookTime === 'string' 
      ? parseInt(recipe.cookTime.replace(/[^0-9]/g, '') || '30') 
      : 30,
    difficulty: recipe.difficulty || 'Medium',
    rating: recipe.rating || 4.5,
    saved: false
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { fetchTodayRecipes, fetchRecommendedRecipes, todayRecipes, recommendedRecipes } = useRecipeStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showIngredientInput, setShowIngredientInput] = useState(false);

  // Get user's name - would come from a user store in a real app
  const userName = 'Chef';

  // Get current time to display appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Initial data fetch
  useEffect(() => {
    loadData();
  }, []);

  // Load recipes data
  const loadData = async () => {
    try {
      await Promise.all([
        fetchTodayRecipes(),
        fetchRecommendedRecipes()
      ]);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push({
        pathname: '/search',
        params: { query }
      } as any); // Cast as any to bypass TypeScript route validation
    }
  };

  // Navigate to recipe detail
  const handleRecipePress = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/recipe',
      params: { id: recipeId }
    });
  };

  // Show ingredient input modal
  const handleAddIngredients = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowIngredientInput(true);
  };

  // Handle ingredient input complete
  const handleIngredientInputComplete = () => {
    setShowIngredientInput(false);
    // Navigate to generate screen if ingredients were added
    router.push('/generate' as any); // Cast as any to bypass TypeScript route validation
  };

  // Close ingredient input modal
  const handleIngredientInputClose = () => {
    setShowIngredientInput(false);
  };

  // Render recipe item in the carousel
  const renderTodayRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity 
      style={[styles.todayRecipeCard, { width: width * 0.85 }]}
      onPress={() => handleRecipePress(item.id || '')}
      activeOpacity={0.9}
    >
      <RecipeCard recipe={adaptRecipeForCard(item)} type="featured" />
    </TouchableOpacity>
  );

  // Render recipe item in the recommended list
  const renderRecommendedRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recommendedRecipeContainer}
      onPress={() => handleRecipePress(item.id || '')}
      activeOpacity={0.7}
    >
      <RecipeCard recipe={adaptRecipeForCard(item)} type="horizontal" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.nameText}>{userName}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile' as any)}
          >
            <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} placeholder="Search recipes, ingredients..." />

        {/* Quick Action Button */}
        <TouchableOpacity
          style={styles.addIngredientsButton}
          onPress={handleAddIngredients}
        >
          <Ionicons name="add-circle" size={24} color={colors.white} style={styles.addIcon} />
          <Text style={styles.addIngredientsText}>Create a Recipe with Your Ingredients</Text>
        </TouchableOpacity>

        {/* Today's Recipes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Recipes</Text>
            <TouchableOpacity onPress={() => router.push('/recipes/today' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={todayRecipes}
            renderItem={renderTodayRecipe}
            keyExtractor={(item) => item.id || String(Math.random())}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.todayRecipesContainer}
            snapToInterval={width * 0.85 + 16}
            decelerationRate="fast"
            pagingEnabled={false}
          />
        </View>

        {/* Recommended Recipes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity onPress={() => router.push('/recipes/recommended' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Using a View instead of FlatList for recommended recipes to avoid nested scrolling issues */}
          <View style={styles.recommendedContainer}>
            {recommendedRecipes.slice(0, 4).map(recipe => (
              <TouchableOpacity
                key={recipe.id || String(Math.random())}
                style={styles.recommendedRecipeContainer}
                onPress={() => handleRecipePress(recipe.id || '')}
                activeOpacity={0.7}
              >
                <RecipeCard recipe={adaptRecipeForCard(recipe)} type="horizontal" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Ingredient Input Modal */}
      {showIngredientInput && (
        <IngredientInput
          onComplete={handleIngredientInputComplete}
          onClose={handleIngredientInputClose}
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
  scrollContent: {
    paddingVertical: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  profileButton: {
    padding: 4,
  },
  addIngredientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addIcon: {
    marginRight: 8,
  },
  addIngredientsText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  todayRecipesContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  todayRecipeCard: {
    marginRight: 16,
    height: 220,
  },
  recommendedContainer: {
    paddingHorizontal: 16,
  },
  recommendedRecipeContainer: {
    marginBottom: 16,
  },
}); 