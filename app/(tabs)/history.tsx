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
  Alert,
} from 'react-native';
import { useRecipeHistoryStore } from '@/stores/recipeHistoryStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfirmModal from '@/components/ConfirmModal';
import BulkActionBar from '@/components/BulkActionBar';
import BulkShareModal from '@/components/BulkShareModal';
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

  // Bulk actions state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<(RecipeWithTimestamp | IngredientSet)[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

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
    
    // If we're in selection mode and our selected items are no longer in history,
    // update the selection
    if (selectionMode) {
      setSelectedItems(prev => {
        const allItemsIds = new Set(allItems.map(item => item.id));
        return prev.filter(item => allItemsIds.has(item.id));
      });
    }
  }, [history, mockIngredientSets, selectionMode]);

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
    
    // Exit selection mode
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedItems([]);
    }
    
    setRefreshing(false);
  }, [prepareHistorySections, selectionMode]);

  // Toggle item selection
  const toggleItemSelection = useCallback((item: RecipeWithTimestamp | IngredientSet) => {
    setSelectedItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  // Navigate to the recipe detail screen
  const handleItemPress = (item: RecipeWithTimestamp | IngredientSet) => {
    // In selection mode, toggle selection
    if (selectionMode) {
      toggleItemSelection(item);
      return;
    }
    
    // Normal mode, navigate
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

  // Handle long press to start selection mode
  const handleItemLongPress = (item: RecipeWithTimestamp | IngredientSet) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Enter selection mode if not already
    if (!selectionMode) {
      setSelectionMode(true);
    }
    
    // Select this item if not already selected
    setSelectedItems(prev => {
      if (!prev.some(i => i.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
  };

  // Regenerate recipe with the same ingredients
  const handleRegeneratePress = (item: RecipeWithTimestamp | IngredientSet) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if ('ingredients' in item) {
      // Navigate to generate with ingredients
      router.push({
        pathname: '/generate',
        params: { 
          ingredients: item.ingredients.join(',') 
        }
      });
    }
  };

  // Confirm clearing all history
  const confirmClearHistory = () => {
    setShowConfirmModal(true);
  };

  // Clear all history
  const handleClearHistory = () => {
    clearHistory();
    setShowConfirmModal(false);
    prepareHistorySections();
  };
  
  // Exit selection mode
  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedItems([]);
  }, []);
  
  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length === 0) return;
    
    // This is just a mock for demo purposes
    // In a real app, you would call a store method to delete items
    Alert.alert(
      'Remove History Items',
      `Are you sure you want to remove ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} from your history?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // Mock removal - in a real app you would call store methods
            // For now, we'll just exit selection mode
            exitSelectionMode();
            // Refresh the history list
            prepareHistorySections();
          },
        },
      ]
    );
  }, [selectedItems, exitSelectionMode, prepareHistorySections]);
  
  // Handle bulk share
  const handleBulkShare = useCallback(() => {
    if (selectedItems.length === 0) return;
    
    // Filter out ingredient sets and only keep recipes for sharing
    const recipesToShare = selectedItems.filter(
      (item): item is RecipeWithTimestamp => 'title' in item
    );
    
    if (recipesToShare.length > 0) {
      setShowShareModal(true);
    } else {
      Alert.alert(
        'No Recipes Selected',
        'Please select at least one recipe to share. Ingredient sets cannot be shared.'
      );
    }
  }, [selectedItems]);

  const renderSectionHeader = ({ section }: { section: HistorySection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );

  const renderHistoryItem = ({ item }: { item: RecipeWithTimestamp | IngredientSet }) => {
    // Check if the item is a recipe or an ingredient set
    const isRecipe = 'title' in item;
    // Check if the item is selected
    const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id);
    
    // Format the date
    const formattedDate = format(new Date(item.timestamp), 'MMM d, h:mm a');
    
    if (isRecipe) {
      return (
        <TouchableOpacity
          style={[
            styles.recipeItem,
            isSelected && styles.selectedItem
          ]}
          onPress={() => handleItemPress(item)}
          onLongPress={() => handleItemLongPress(item)}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <View style={styles.recipeImageContainer}>
            {item.imageUrl ? (
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.recipeImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="restaurant-outline" size={24} color={colors.textSecondary} />
              </View>
            )}
          </View>
          
          <View style={styles.recipeContent}>
            <Text style={styles.recipeTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.recipeTime}>{formattedDate}</Text>
            
            <View style={styles.recipeTagContainer}>
              {item.tags && item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.recipeTag}>
                  <Text style={styles.recipeTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      );
    } else {
      // Ingredient set
      return (
        <TouchableOpacity
          style={[
            styles.ingredientItem,
            isSelected && styles.selectedItem
          ]}
          onPress={() => handleItemPress(item)}
          onLongPress={() => handleItemLongPress(item)}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <View style={styles.ingredientContent}>
            <View style={styles.ingredientHeader}>
              <Ionicons name="basket-outline" size={18} color={colors.primary} />
              <Text style={styles.ingredientTitle}>Ingredients List</Text>
            </View>
            
            <Text style={styles.ingredientTime}>{formattedDate}</Text>
            
            <View style={styles.ingredientList}>
              {item.ingredients.slice(0, 3).map((ingredient, index) => (
                <Text key={index} style={styles.ingredientText} numberOfLines={1}>
                  • {ingredient}
                </Text>
              ))}
              {item.ingredients.length > 3 && (
                <Text style={styles.moreIngredients}>+{item.ingredients.length - 3} more</Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={() => handleRegeneratePress(item)}
          >
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.regenerateText}>Generate</Text>
          </TouchableOpacity>
          
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      );
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={require('@/assets/images/empty-plate.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptyText}>
        Your cooking and ingredient history will appear here.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/')}
      >
        <LinearGradient
          colors={['#FFA726', '#FB8C00']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.exploreButtonText}>Explore Recipes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, headerStyle]}>
      <View style={styles.headerTitleRow}>
        <Text style={styles.headerTitle}>History</Text>
        
        {selectionMode ? (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={exitSelectionMode}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={confirmClearHistory}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Animated Header */}
      {renderHeader()}
      
      {/* Section List */}
      <Animated.SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          sections.length === 0 && styles.emptyListContainer,
          selectionMode && { paddingBottom: 80 }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
      
      {/* Confirm clear history modal */}
      <ConfirmModal
        visible={showConfirmModal}
        title="Clear History"
        message="Are you sure you want to clear all your history? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearHistory}
        onCancel={() => setShowConfirmModal(false)}
      />
      
      {/* Bulk Action Bar */}
      <BulkActionBar
        visible={selectionMode}
        selectedCount={selectedItems.length}
        onCancel={exitSelectionMode}
        onDelete={handleBulkDelete}
        onShare={handleBulkShare}
      />
      
      {/* Bulk Share Modal */}
      <BulkShareModal
        recipes={selectedItems.filter((item): item is RecipeWithTimestamp => 'title' in item)}
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 + 16 : 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  recipeItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  recipeImageContainer: {
    width: 80,
    height: 80,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeContent: {
    flex: 1,
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  recipeTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  recipeTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recipeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  recipeTagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ingredientItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ingredientTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  ingredientTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ingredientList: {
    marginBottom: 12,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  moreIngredients: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  regenerateText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  exploreButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 