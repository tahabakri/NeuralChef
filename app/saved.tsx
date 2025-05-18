import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  GestureResponderEvent,
  SafeAreaView,
} from 'react-native';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { useRouter } from 'expo-router';
import RecipeCard from '@/components/RecipeCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DeleteAction from '@/components/DeleteAction';
import ConfirmModal from '@/components/ConfirmModal';
import ShareModal from '@/components/ShareModal';
import colors from '@/constants/colors';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Recipe } from '@/services/recipeService';
import { GradientCard } from '@/components/common/GradientCard';

/**
 * Saved Recipes Screen
 * Displays recipes saved by the user
 */
export default function SavedScreen() {
  const router = useRouter();
  const { savedRecipes, filteredRecipes, loadSavedRecipes, removeSavedRecipe, applyFilters, resetFilters } = useSavedRecipesStore();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const scrollY = useSharedValue(0);

  // Load saved recipes on mount
  useEffect(() => {
    loadSavedRecipes();
  }, []);

  // Handle scroll for header animation
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animation styles
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
    };
  });

  // Handle recipe selection
  const handleRecipePress = (recipeId: string) => {
    const recipe = savedRecipes.find(r => r.id === recipeId);
    if (recipe) {
      router.push({
        pathname: '/recipe',
        params: { recipeId: recipe.id }
      });
    }
  };

  // Handle long press to show share modal
  const handleRecipeLongPress = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const recipe = savedRecipes.find(r => r.id === recipeId);
    if (recipe) {
      setSelectedRecipe(recipe);
      setShowShareModal(true);
    }
  };

  // Handle delete action
  const handleDeletePress = (recipeId: string) => {
    const recipe = savedRecipes.find(r => r.id === recipeId);
    if (recipe) {
      setSelectedRecipe(recipe);
      setShowDeleteModal(true);
    }
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedRecipe) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      removeSavedRecipe(selectedRecipe.title);
      setShowDeleteModal(false);
    }
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      resetFilters();
    } else {
      applyFilters({ searchText: text });
    }
  };

  // Close all open swipeables
  const closeOpenSwipeables = (except?: string) => {
    swipeableRefs.current.forEach((ref, key) => {
      if (key !== except && ref.close) {
        ref.close();
      }
    });
  };

  // Render recipe card
  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    // Adapt the recipe to match RecipeCard component requirements
    const adaptedRecipe = {
      id: item.id || '',
      title: item.title,
      image: item.heroImage || item.steps[0]?.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352',
      cookTime: item.cookTime ? parseInt(item.cookTime, 10) || 30 : 30,
      difficulty: item.difficulty || 'Medium',
      rating: item.rating || 4.5,
      description: item.description,
      saved: true,
      tags: item.tags || [],
      ingredients: item.ingredients,
      servings: item.servings,
    };

    return (
      <Swipeable
        ref={(ref: Swipeable) => {
          if (ref && item.id) {
            swipeableRefs.current.set(item.id, ref);
          }
        }}
        renderRightActions={(progress, dragX) => (
          <DeleteAction
            dragX={dragX}
            onPress={() => handleDeletePress(item.id || '')}
          />
        )}
        onSwipeableOpen={() => closeOpenSwipeables(item.id)}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleRecipePress(item.id || '')}
          onLongPress={() => handleRecipeLongPress(item.id || '')}
          delayLongPress={300}
        >
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={['#FFEBE7', '#FFD8D0']} // Soft Peach gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />
            <RecipeCard
              recipe={adaptedRecipe}
              type="horizontal"
              style={styles.card}
              backgroundComponent={null}
            />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark" size={80} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Saved Recipes</Text>
      <Text style={styles.emptyText}>
        Recipes you save will appear here for easy access
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.replace('/')}
      >
        <LinearGradient
          colors={['#A5D6A7', '#81C784']} // Fresh Green gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.browseButtonGradient}
        >
          <Text style={styles.browseButtonText}>Browse Recipes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render search header
  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, headerStyle]}>
      <Text style={styles.sectionTitle}>
        {savedRecipes.length > 0
          ? `${savedRecipes.length} Saved Recipe${savedRecipes.length !== 1 ? 's' : ''}`
          : 'Saved Recipes'}
      </Text>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={22} color={colors.text} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.FlatList
        data={filteredRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id || item.title}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={renderHeader}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Remove Recipe"
        message={`Are you sure you want to remove "${selectedRecipe?.title}" from your saved recipes?`}
        confirmText="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        isDestructive={true}
      />
      
      {/* Share Modal */}
      {selectedRecipe && (
        <ShareModal
          recipe={selectedRecipe}
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  list: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeCuisine: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  browseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  browseButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
    minHeight: '100%',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    backgroundColor: 'transparent',
  },
}); 