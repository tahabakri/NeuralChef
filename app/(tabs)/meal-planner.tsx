/**
 * Meal Planner Screen
 * 
 * This screen allows users to visually plan and schedule meals across the week.
 * Features:
 * - Weekly calendar view for date selection
 * - Add/view/edit meals for breakfast, lunch, and dinner
 * - AI meal suggestions
 * - Set reminders for meal preparation
 * - Weekly overview chart
 * - Generate grocery list
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  StatusBar,
  Platform,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, Plus, Sparkles, Share, ShoppingBag } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useMealPlannerStore } from '@/stores/mealPlannerStore';
import { Recipe } from '@/services/recipeService';
import { 
  WeekCalendar, 
  MealItem, 
  RecipeSelector, 
  ReminderSelector,
  WeekOverviewChart
} from '@/components/MealPlanner';
import { MealType, ScheduledMeal } from '@/components/MealPlanner/types';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';

// Define the Ingredient interface if it doesn't exist elsewhere
interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export default function MealPlannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    selectedDate, 
    setSelectedDate, 
    getNextWeekDates, 
    getMealsForDateAndType,
    scheduleMeal,
    toggleMealNotification,
    setMealReminderTime,
    scheduledMeals,
    removeMeal
  } = useMealPlannerStore();

  const { savedRecipes } = useSavedRecipesStore();

  const [recipeSelectorVisible, setRecipeSelectorVisible] = useState(false);
  const [reminderSelectorVisible, setReminderSelectorVisible] = useState(false);
  const [currentMealType, setCurrentMealType] = useState<MealType>('breakfast');
  const [currentMealId, setCurrentMealId] = useState<string>('');
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [aiSuggestingMeal, setAiSuggestingMeal] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [cookingStreak, setCookingStreak] = useState(0);

  useEffect(() => {
    setWeekDates(getNextWeekDates());
  }, [selectedDate, getNextWeekDates]);

  useEffect(() => {
    // Check if there are any meals scheduled
    setShowEmptyState(scheduledMeals.length === 0);
    
    // Calculate cooking streak (simplified simulation)
    const streakCount = Math.min(Math.floor(Math.random() * 5) + 1, 7); // Random streak between 1-7
    setCookingStreak(streakCount);
  }, [scheduledMeals]);

  const getFormattedDate = () => {
    try {
      return format(parseISO(selectedDate), 'MMMM d, yyyy');
    } catch (error) {
      return format(new Date(), 'MMMM d, yyyy');
    }
  };

  const getMealsForType = (mealType: MealType) => {
    return getMealsForDateAndType(selectedDate, mealType);
  };

  const handleAddMeal = (mealType: MealType) => {
    setCurrentMealType(mealType);
    setRecipeSelectorVisible(true);
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newMeal: ScheduledMeal = {
        id: `${selectedDate}-${currentMealType}-${recipe.id}`,
        date: selectedDate,
        mealType: currentMealType,
        recipeId: recipe.id,
        recipe,
        notificationsEnabled: false,
      };
      
      await scheduleMeal(newMeal);
      setRecipeSelectorVisible(false);
    } catch (err) {
      setError('Failed to schedule meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetReminder = (reminderTime: string) => {
    if (currentMealId) {
      setMealReminderTime(currentMealId, reminderTime);
      toggleMealNotification(currentMealId);
    }
    setReminderSelectorVisible(false);
  };

  const suggestMeal = async (mealType: MealType) => {
    setAiSuggestingMeal(true);
    setIsLoading(true);
    
    try {
      // Simulate AI suggestion by picking a random saved recipe
      if (savedRecipes.length > 0) {
        const randomIndex = Math.floor(Math.random() * savedRecipes.length);
        const suggestedRecipe = savedRecipes[randomIndex];
        
        const newMeal: ScheduledMeal = {
          id: `${selectedDate}-${mealType}-${suggestedRecipe.id}`,
          date: selectedDate,
          mealType: mealType,
          recipeId: suggestedRecipe.id,
          recipe: suggestedRecipe,
          notificationsEnabled: false,
        };
        
        await scheduleMeal(newMeal);
        Alert.alert(
          "AI Chef Suggestion", 
          `We've added ${suggestedRecipe.title} to your ${mealType}! 👨‍🍳`,
          [{ text: "Yum!", style: "default" }]
        );
      } else {
        Alert.alert(
          "No Recipes Found", 
          "Save some recipes first so our AI chef can make suggestions!",
          [{ text: "Got it", style: "default" }]
        );
      }
    } catch (err) {
      setError('Failed to suggest meal. Please try again.');
    } finally {
      setIsLoading(false);
      setAiSuggestingMeal(false);
    }
  };

  const autoPlanWeek = async () => {
    setIsLoading(true);
    
    try {
      // For each day of the week and each meal type, suggest a meal
      const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
      
      if (savedRecipes.length === 0) {
        Alert.alert(
          "No Recipes Found", 
          "Save some recipes first so our AI chef can plan your week!",
          [{ text: "Got it", style: "default" }]
        );
        setIsLoading(false);
        return;
      }
      
      for (const date of weekDates) {
        for (const mealType of mealTypes) {
          // Skip if meal already exists for this slot
          if (getMealsForDateAndType(date, mealType).length > 0) continue;
          
          // Pick a random recipe for this slot
          const randomIndex = Math.floor(Math.random() * savedRecipes.length);
          const suggestedRecipe = savedRecipes[randomIndex];
          
          const newMeal: ScheduledMeal = {
            id: `${date}-${mealType}-${suggestedRecipe.id}`,
            date: date,
            mealType: mealType,
            recipeId: suggestedRecipe.id,
            recipe: suggestedRecipe,
            notificationsEnabled: false,
          };
          
          await scheduleMeal(newMeal);
        }
      }
      
      Alert.alert(
        "Week Planned! 🎉", 
        "Your AI chef has planned your meals for the week. Enjoy!",
        [{ text: "Thanks chef!", style: "default" }]
      );
    } catch (err) {
      setError('Failed to plan week. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateGroceryList = () => {
    // Get all meals for today
    const todayMeals = scheduledMeals.filter(meal => meal.date === selectedDate);
    
    if (todayMeals.length === 0) {
      Alert.alert(
        "No Meals Planned", 
        "Add some meals to your plan first to generate a grocery list!",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
    // Collect all ingredients from today's meals
    const groceryItems: string[] = [];
    todayMeals.forEach(meal => {
      if (meal.recipe && meal.recipe.ingredients) {
        // Handle both string[] and Ingredient[] types
        const ingredients = meal.recipe.ingredients;
        ingredients.forEach(ingredient => {
          if (typeof ingredient === 'string') {
            groceryItems.push(ingredient);
          } else if (typeof ingredient === 'object') {
            // Assuming ingredient object has a name property
            groceryItems.push(ingredient.name);
          }
        });
      }
    });
    
    // Remove duplicates
    const uniqueGroceryItems = Array.from(new Set(groceryItems));
    
    Alert.alert(
      "Today's Grocery List", 
      uniqueGroceryItems.join('\n'),
      [
        { 
          text: "Share List", 
          onPress: () => Alert.alert("Sharing functionality would go here") 
        },
        { 
          text: "Close", 
          style: "cancel" 
        }
      ]
    );
  };

  const renderMealItem = (mealType: MealType) => {
    const meal = getMealsForType(mealType)[0]; // Assuming one meal per type per day
    return (
      <MealItem 
        key={mealType}
        mealType={mealType}
        meal={meal}
        onPress={() => meal ? 
          router.push(`/recipe/${meal.recipeId}`) : 
          handleAddMeal(mealType)
        }
        onItemPress={(selectedMeal: ScheduledMeal) => {
          router.push(`/recipe/${selectedMeal.recipeId}`);
        }}
        onSetReminderPress={(selectedMeal: ScheduledMeal) => {
          setCurrentMealType(mealType);
          setCurrentMealId(selectedMeal.id);
          setReminderSelectorVisible(true);
        }}
        onRemovePress={(selectedMeal: ScheduledMeal) => {
          Alert.alert(
            "Remove Meal",
            `Are you sure you want to remove ${selectedMeal.recipe?.title} from your ${mealType}?`,
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Remove",
                style: "destructive",
                onPress: () => removeMeal(selectedMeal.id)
              }
            ]
          );
        }}
        onSuggestPress={() => suggestMeal(mealType)}
        isAiSuggesting={aiSuggestingMeal}
      />
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Image 
          source={require('@/assets/images/winking-chef.png')} 
          style={styles.emptyStateImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyStateTitle}>
          No meals planned yet. Your kitchen misses you! 🍳
        </Text>
        <Text style={styles.emptyStateSubtitle}>
          Plan your meals for the week and never wonder "what's for dinner?" again.
        </Text>
        <View style={styles.emptyStateButtons}>
          <TouchableOpacity 
            style={[styles.emptyStateButton, styles.primaryButton]}
            onPress={autoPlanWeek}
          >
            <Sparkles size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>Let AI Plan My Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.emptyStateButton, styles.secondaryButton]}
            onPress={() => handleAddMeal('lunch')}
          >
            <Plus size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Add First Meal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[colors.softBlueStart, colors.softBlueEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.softBlueStart} />
        <Stack.Screen 
          options={{
            headerShown: false,
          }} 
        />

        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.titleContainer}>
              <Image 
                source={require('@/assets/images/chef.png')} 
                style={styles.chefIcon}
              />
              <Text style={styles.headerTitle}>Your Meal Planner 🧑‍🍳</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={() => handleAddMeal('breakfast')}
              >
                <Plus size={18} color={colors.primary} />
                <Text style={styles.headerActionText}>Add Meal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerActionButton, styles.aiButton]}
                onPress={autoPlanWeek}
              >
                <Sparkles size={18} color={colors.white} />
                <Text style={styles.aiButtonText}>AI Suggest</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.dateText}>
            {getFormattedDate()}
          </Text>
          {cookingStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {cookingStreak} day cooking streak!</Text>
            </View>
          )}
        </View>

        <WeekCalendar
          dates={weekDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setError(null)}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : showEmptyState ? (
          renderEmptyState()
        ) : (
          <ScrollView style={styles.mealsContainer} showsVerticalScrollIndicator={false}>
            {renderMealItem('breakfast')}
            {renderMealItem('lunch')}
            {renderMealItem('dinner')}
            
            {/* Weekly Overview Section */}
            <View style={styles.weeklyOverviewContainer}>
              <Text style={styles.weeklyOverviewTitle}>Weekly Overview</Text>
              <View style={styles.chartContainer}>
                {weekDates.length > 0 ? (
                  <WeekOverviewChart 
                    dates={weekDates} 
                    scheduledMeals={scheduledMeals} 
                  />
                ) : (
                  <View style={styles.emptyChartContainer}>
                    <Text style={styles.emptyChartText}>Chart will be displayed here</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Bottom spacing */}
            <View style={{height: 100}} />
          </ScrollView>
        )}

        {/* Bottom CTA Buttons */}
        <View style={[
          styles.bottomButtonsContainer, 
          {paddingBottom: Platform.OS === 'ios' ? 16 + insets.bottom : 16}
        ]}>
          <TouchableOpacity 
            style={styles.bottomButton}
            onPress={autoPlanWeek}
          >
            <Sparkles size={20} color={colors.white} />
            <Text style={styles.bottomButtonText}>Auto-Plan My Week</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bottomButton, styles.secondaryBottomButton]}
            onPress={generateGroceryList}
          >
            <ShoppingBag size={20} color={colors.primary} />
            <Text style={styles.secondaryBottomButtonText}>Today's Grocery List</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                {aiSuggestingMeal ? "Chef is getting creative..." : "Scheduling meal..."}
              </Text>
            </View>
          </View>
        )}

        <RecipeSelector
          visible={recipeSelectorVisible}
          onClose={() => setRecipeSelectorVisible(false)}
          onSelectRecipe={handleSelectRecipe}
        />

        <ReminderSelector
          visible={reminderSelectorVisible}
          onClose={() => setReminderSelectorVisible(false)}
          onSetReminder={handleSetReminder}
          mealType={currentMealType}
        />
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContent: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
    marginLeft: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chefIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  headerActionText: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  aiButton: {
    backgroundColor: colors.primary,
  },
  aiButtonText: {
    marginLeft: 4,
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginVertical: 5,
  },
  streakBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  weeklyOverviewContainer: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weeklyOverviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  chartContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.cardAlt,
  },
  emptyChartContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
  },
  emptyChartText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyStateButtons: {
    width: '100%',
    gap: 12,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    gap: 10,
  },
  bottomButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  secondaryBottomButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryBottomButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});
