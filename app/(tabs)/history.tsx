import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
  SectionList,
  Image,
} from 'react-native';
import { useRecipeHistoryStore } from '@/stores/recipeHistoryStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfirmModal from '@/components/ConfirmModal';
import colors from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Recipe } from '@/stores/recipeStore';
import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

// Define interface for ingredient set
interface IngredientSet {
  id: string;
  ingredients: string[];
  timestamp: string;
}

// Define a union type with timestamp
type RecipeWithTimestamp = Recipe & {
  timestamp: string;
};

// Define sections for our list
interface HistorySection {
  title: string;
  data: (RecipeWithTimestamp | IngredientSet)[];
  type: 'recipes' | 'ingredients';
}

export default function HistoryScreen() {
  const router = useRouter();
  const { history, clearHistory } = useRecipeHistoryStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sections, setSections] = useState<HistorySection[]>([]);
  const scrollY = useSharedValue(0);

  // Get mock ingredient sets (in a real app, this would come from the store)
  const mockIngredientSets: IngredientSet[] = [
    {
      id: 'ingredients-1',
      ingredients: ['Chicken', 'Rice', 'Broccoli', 'Soy sauce'],
      timestamp: new Date(Date.now() - 86400000).toISOString() // Yesterday
    },
    {
      id: 'ingredients-2',
      ingredients: ['Pasta', 'Tomatoes', 'Basil', 'Garlic', 'Olive oil'],
      timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: 'ingredients-3',
      ingredients: ['Bread', 'Eggs', 'Milk', 'Butter', 'Cinnamon'],
      timestamp: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    }
  ];

  // Group history items into sections
  const prepareHistorySections = useCallback(() => {
    // Combine recipes and ingredient sets
    const recipesWithDates: RecipeWithTimestamp[] = history.map(recipe => ({
      ...recipe,
      timestamp: recipe.createdAt ? recipe.createdAt.toString() : new Date().toISOString()
    }));

    // Sort all items by date (newest first)
    const allItems = [...recipesWithDates, ...mockIngredientSets].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Group by time period
    const today: (RecipeWithTimestamp | IngredientSet)[] = [];
    const thisWeek: (RecipeWithTimestamp | IngredientSet)[] = [];
    const thisMonth: (RecipeWithTimestamp | IngredientSet)[] = [];
    const older: (RecipeWithTimestamp | IngredientSet)[] = [];

    allItems.forEach(item => {
      const date = parseISO(item.timestamp);
      if (isToday(date)) {
        today.push(item);
      } else if (isThisWeek(date)) {
        thisWeek.push(item);
      } else if (isThisMonth(date)) {
        thisMonth.push(item);
      } else {
        older.push(item);
      }
    });

    // Create sections
    const newSections: HistorySection[] = [];
    
    if (today.length > 0) {
      newSections.push({ title: 'Today', data: today, type: 'recipes' });
    }
    
    if (thisWeek.length > 0) {
      newSections.push({ title: 'This Week', data: thisWeek, type: 'recipes' });
    }
    
    if (thisMonth.length > 0) {
      newSections.push({ title: 'This Month', data: thisMonth, type: 'recipes' });
    }
    
    if (older.length > 0) {
      newSections.push({ title: 'Older', data: older, type: 'recipes' });
    }

    setSections(newSections);
  }, [history, mockIngredientSets]);

  // Load and organize history when the component mounts
  useEffect(() => {
    prepareHistorySections();
  }, [prepareHistorySections]);

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
      [0, 80],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -20],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Refresh history data
    prepareHistorySections();
    setRefreshing(false);
  }, [prepareHistorySections]);

  // Navigate to the recipe detail screen
  const handleRecipePress = (item: RecipeWithTimestamp | IngredientSet) => {
    if ('ingredients' in item && !('title' in item)) {
      // This is an ingredient set
      router.push({
        pathname: '/generate',
        params: { ingredients: item.ingredients.join(',') }
      });
    } else {
      // This is a recipe
      router.push({
        pathname: '/recipe',
        params: { recipeId: item.id }
      });
    }
  };

  // Regenerate recipe with the same ingredients
  const handleRegeneratePress = (item: RecipeWithTimestamp | IngredientSet) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if ('ingredients' in item) {
      // Navigate to generate with ingredients
      router.push({
        pathname: '/generate',
        params: { 
          ingredients: Array.isArray(item.ingredients) 
            ? item.ingredients.join(',')
            : item.ingredients
        }
      });
    }
  };

  // Confirm clearing all history
  const confirmClearHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowConfirmModal(true);
  };

  // Clear all history
  const handleClearHistory = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearHistory();
    setShowConfirmModal(false);
  };

  // Render section header with the Citrus Pop gradient
  const renderSectionHeader = ({ section }: { section: HistorySection }) => (
    <View style={styles.sectionHeaderContainer}>
      <LinearGradient
        colors={['#F9ED69', '#F08A5D']} // Citrus Pop gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionGradient}
      >
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </LinearGradient>
    </View>
  );

  // Render a history item
  const renderHistoryItem = ({ item }: { item: RecipeWithTimestamp | IngredientSet }) => {
    // Check if the item is an ingredient set or a recipe
    const isIngredientSet = 'ingredients' in item && !('title' in item);
    
    return (
      <TouchableOpacity
        style={styles.historyItemContainer}
        onPress={() => handleRecipePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.historyItemContent}>
          {isIngredientSet ? (
            // Render ingredient set
            <>
              <View style={styles.ingredientSetIconContainer}>
                <Ionicons name="basket-outline" size={28} color={colors.textSecondary} />
              </View>
              
              <View style={styles.historyItemDetails}>
                <Text style={styles.ingredientSetTitle}>Ingredient Set</Text>
                <Text style={styles.ingredientList} numberOfLines={2}>
                  {(item as IngredientSet).ingredients.join(', ')}
                </Text>
                <Text style={styles.timestamp}>
                  {format(parseISO(item.timestamp), 'MMM d, yyyy • h:mm a')}
                </Text>
              </View>
            </>
          ) : (
            // Render recipe
            <>
              <View style={styles.recipeImagePlaceholder}>
                {(item as RecipeWithTimestamp).imageUrl ? (
                  <Image 
                    source={{ uri: (item as RecipeWithTimestamp).imageUrl }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="restaurant-outline" size={28} color={colors.textSecondary} />
                )}
              </View>
              
              <View style={styles.historyItemDetails}>
                <Text style={styles.recipeTitle} numberOfLines={1}>
                  {(item as RecipeWithTimestamp).title}
                </Text>
                <Text style={styles.recipeDescription} numberOfLines={2}>
                  {(item as RecipeWithTimestamp).description}
                </Text>
                <Text style={styles.timestamp}>
                  {format(parseISO(item.timestamp), 'MMM d, yyyy • h:mm a')}
                </Text>
              </View>
            </>
          )}
          
          <TouchableOpacity 
            style={styles.regenerateButton}
            onPress={() => handleRegeneratePress(item)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={80} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptyText}>
        Your recipe and ingredient history will appear here
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.replace('/')}
      >
        <LinearGradient
          colors={['#A5D6A7', '#81C784']} // Fresh Green gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButtonGradient}
        >
          <Text style={styles.createButtonText}>Create Recipe</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render header with title and clear button
  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, headerStyle]}>
      <Text style={styles.headerTitle}>
        History
      </Text>
      
      {history.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={confirmClearHistory}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Fixed Header */}
      {renderHeader()}
      
      {/* History List */}
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          renderItem={renderHistoryItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item: RecipeWithTimestamp | IngredientSet) => ('id' in item ? item.id : item.timestamp)}
          contentContainerStyle={styles.listContainer}
          stickySectionHeadersEnabled={true}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          {renderEmptyState()}
        </View>
      )}
      
      {/* Confirm Clear History Modal */}
      <ConfirmModal
        visible={showConfirmModal}
        title="Clear History"
        message="Are you sure you want to clear all your recipe and ingredient history? This cannot be undone."
        confirmText="Clear"
        onConfirm={handleClearHistory}
        onCancel={() => setShowConfirmModal(false)}
        isDestructive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 16,
    backgroundColor: colors.background,
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  clearButtonText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 24,
    minHeight: '100%',
  },
  sectionHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  sectionGradient: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyItemContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  historyItemContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  ingredientSetIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  historyItemDetails: {
    flex: 1,
  },
  ingredientSetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ingredientList: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  regenerateButton: {
    padding: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 100,
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
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  createButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 