/**
 * Meal Planner Screen
 * 
 * This screen allows users to visually plan and schedule meals across the week.
 * Features:
 * - Weekly calendar view for date selection
 * - Add/view/edit meals for breakfast, lunch, and dinner
 * - Simplified meal slot management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  Image,
  Alert,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { format, parseISO, isSameDay, differenceInCalendarDays, addDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons'; // For flame icon
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { useMealPlannerStore } from '@/stores/mealPlannerStore';
import { Recipe } from '@/services/recipeService'; // Assuming Recipe type is defined here
import {
  WeekCalendar,
  MealItem,
  RecipeSelector,
  // ReminderSelector removed
} from '@/components/MealPlanner';
import { MealType, ScheduledMeal } from '@/components/MealPlanner/types';
// useSavedRecipesStore is not directly used here anymore, RecipeSelector will handle it.

export default function MealPlannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false); // For async operations like scheduling
  const [error, setError] = useState<string | null>(null);
  
  const {
    selectedDate,
    setSelectedDate, // This is handleDateSelect
    getNextWeekDates,
    getMealsForDateAndType,
    scheduleMeal,
    scheduledMeals, // For cooking streak and empty state
    removeMeal,
  } = useMealPlannerStore();

  const [recipeSelectorVisible, setRecipeSelectorVisible] = useState(false);
  const [currentMealType, setCurrentMealType] = useState<MealType | null>(null);
  // currentMealId is no longer needed for reminders
  
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [cookingStreak, setCookingStreak] = useState(0);

  // Update week dates when selectedDate changes
  useEffect(() => {
    setWeekDates(getNextWeekDates());
  }, [selectedDate, getNextWeekDates]);

  // Calculate cooking streak and check for empty state
  useEffect(() => {
    const today = new Date();
    let currentStreak = 0;
    if (scheduledMeals.length > 0) {
      const mealDates = scheduledMeals
        .map(meal => parseISO(meal.date))
        .sort((a, b) => b.getTime() - a.getTime()); // Sort descending

      const uniqueMealDates = mealDates.filter((date, index, self) =>
        index === self.findIndex(d => isSameDay(d, date))
      );
      
      // Check streak from today or yesterday
      let streakDate = today;
      if (!uniqueMealDates.find(d => isSameDay(d, today))) {
         // If no meal today, check if yesterday had a meal to start streak count
        if (uniqueMealDates.find(d => isSameDay(d, addDays(today, -1)))) {
            // currentStreak = 0; // No meal today, streak is 0
        } else {
            // currentStreak = 0; // No meal today or yesterday
        }
      }


      for (let i = 0; i < uniqueMealDates.length; i++) {
        if (isSameDay(uniqueMealDates[i], streakDate) || isSameDay(uniqueMealDates[i], addDays(streakDate, -1))) {
          currentStreak++;
          streakDate = uniqueMealDates[i]; // Continue from this date
           // Check for consecutive days
          if (i + 1 < uniqueMealDates.length) {
            if (differenceInCalendarDays(uniqueMealDates[i], uniqueMealDates[i+1]) !== 1) {
              break; // Not consecutive
            }
          }
        } else {
          // If the first meal date isn't today or yesterday, streak is 0 unless we adjust logic
          // For simplicity, if the most recent meal isn't today/yesterday, streak is 0.
          if (!isSameDay(uniqueMealDates[0], today) && !isSameDay(uniqueMealDates[0], addDays(today, -1))) {
            currentStreak = 0;
          }
          break; 
        }
      }
    }
    setCookingStreak(currentStreak);

    // Show empty state if no meals are scheduled for the *selected* date
    const mealsOnSelectedDate = scheduledMeals.filter(m => m.date === selectedDate);
    setShowEmptyState(mealsOnSelectedDate.length === 0);

  }, [scheduledMeals, selectedDate]);


  const getFormattedDate = useCallback(() => {
    try {
      return format(parseISO(selectedDate), 'MMMM d, yyyy');
    } catch (e) {
      // Fallback if selectedDate is invalid, though store should prevent this
      return format(new Date(), 'MMMM d, yyyy');
    }
  }, [selectedDate]);

  const getMealsForType = useCallback((mealType: MealType) => {
    return getMealsForDateAndType(selectedDate, mealType);
  }, [selectedDate, getMealsForDateAndType]);

  // Handler to open recipe selector for a specific meal slot
  const handleAddRecipeToSlot = (mealType: MealType) => {
    setCurrentMealType(mealType);
    setRecipeSelectorVisible(true);
  };

  // Handler for when a recipe is selected from the modal
  const handleRecipeSelectedFromModal = async (recipe: Recipe) => {
    if (!currentMealType) return; // Should not happen if UI is correct

    setIsLoading(true);
    setError(null);
    try {
      const newMeal: ScheduledMeal = {
        id: `${selectedDate}-${currentMealType}-${Date.now()}`, // More robust unique ID
        date: selectedDate,
        mealType: currentMealType,
        recipeId: recipe.id,
        recipe: recipe, // Embed the recipe object
        notificationsEnabled: false, // Added back, defaulting to false
      };
      await scheduleMeal(newMeal);
      setRecipeSelectorVisible(false);
      setCurrentMealType(null);
    } catch (err) {
      console.error("Failed to schedule meal:", err);
      setError('Failed to schedule meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler to remove a recipe from a slot
  const handleRemoveRecipeFromSlot = (mealId: string) => {
    Alert.alert(
      "Remove Meal",
      "Are you sure you want to remove this meal?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeMeal(mealId) }
      ]
    );
  };

  // Handler to change a recipe in a slot
  const handleChangeRecipeInSlot = (mealType: MealType, existingMealId: string) => {
    removeMeal(existingMealId); // Remove existing meal first
    handleAddRecipeToSlot(mealType); // Then open selector to add a new one
  };

  // Handler to navigate to recipe details
  const handleNavigateToRecipeDetail = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };
  
  const renderMealItemContainer = (mealType: MealType) => {
    const meal = getMealsForType(mealType)[0]; // Assuming one meal per type for simplicity

    return (
      <MealItem
        key={mealType}
        mealType={mealType}
        meal={meal}
        onAddRecipe={() => handleAddRecipeToSlot(mealType)}
        onRecipePress={(recipeId) => handleNavigateToRecipeDetail(recipeId)}
        onRemoveRecipe={(mealId) => handleRemoveRecipeFromSlot(mealId)}
        onChangeRecipe={(mealId) => handleChangeRecipeInSlot(mealType, mealId)}
        // onSetReminderPress and onSurpriseMePress are removed
      />
    );
  };

  const renderEmptyStateContent = () => (
    <View style={styles.emptyStateContainer}>
      <Image
        source={require('@/assets/images/empty-plate.png')}
        style={styles.emptyStateImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyStateTitle}>Plan your week!</Text>
      <Text style={styles.emptyStateSubtitle}>Tap on a meal slot above to add a recipe.</Text>
      {/* Optional: A button to add to the first available slot or a specific one */}
      {/* <TouchableOpacity
        style={[styles.emptyStateButton, { backgroundColor: colors.accentOrange }]}
        onPress={() => handleAddRecipeToSlot('breakfast')}
      >
        <Ionicons name="add-circle-outline" size={22} color={colors.white} style={{marginRight: 8}} />
        <Text style={[styles.emptyStateButtonText, {color: colors.white}]}>Add Breakfast</Text>
      </TouchableOpacity> */}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundAlt} />
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Your Meal Planner 🧑‍🍳",
          headerTitleStyle: {
            fontFamily: 'Poppins-SemiBold', 
            fontSize: typography?.heading2?.fontSize ?? 22, // from typography.heading2
            color: colors.text,
          },
          headerStyle: { backgroundColor: colors.backgroundAlt },
          headerShadowVisible: false,
        }}
      />

      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }} // Ensure scroll content doesn't hide behind tab bar
      >
        <Text style={styles.dateDisplayText}>
          {getFormattedDate()}
        </Text>
        {cookingStreak > 0 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color={colors.accentOrange} style={styles.streakIcon} />
            <Text style={styles.streakText}>{cookingStreak} day cooking streak!</Text>
          </View>
        )}

        <WeekCalendar
          dates={weekDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate} // setSelectedDate from store is used directly
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Meal Items Section */}
        <View style={styles.mealsListContainer}>
          {renderMealItemContainer('breakfast')}
          {renderMealItemContainer('lunch')}
          {renderMealItemContainer('dinner')}
        </View>
        
        {showEmptyState && !error && !isLoading && renderEmptyStateContent()}

      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Updating plan...</Text>
        </View>
      )}

      <RecipeSelector
        visible={recipeSelectorVisible}
        onClose={() => {
          setRecipeSelectorVisible(false);
          setCurrentMealType(null);
        }}
        onSelectRecipe={handleRecipeSelectedFromModal}
      />
      {/* ReminderSelector is removed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt ?? '#FFF9F5', // Light peach/off-white
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: spacing.md,
    fontFamily: typography?.bodyMedium?.fontFamily ?? 'Poppins-Regular',
    fontSize: typography?.bodyMedium?.fontSize ?? 16,
    color: colors.white, // More visible on dark overlay
  },
  errorContainer: {
    padding: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.lg,
    backgroundColor: colors.errorLight, // Changed to errorLight
    borderRadius: spacing.borderRadius.md,
  },
  errorText: {
    fontFamily: typography?.bodyMedium?.fontFamily ?? 'Poppins-Regular',
    fontSize: typography?.bodyMedium?.fontSize ?? 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
  },
  retryButtonText: {
    fontFamily: typography?.button?.fontFamily ?? 'Poppins-Medium',
    fontSize: typography?.button?.fontSize ?? 16,
    color: colors.white,
  },
  dateDisplayText: {
    fontFamily: 'Poppins-Medium', // As per spec
    fontSize: typography?.bodyLarge?.fontSize ?? 18, // Example size
    color: colors.text,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.accentOrangeLight ?? '#FFEADD', // Light orange
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.lg,
  },
  streakIcon: {
    marginRight: spacing.xs,
  },
  streakText: {
    fontFamily: 'Poppins-Medium',
    fontSize: typography?.bodySmall?.fontSize ?? 14,
    color: colors.accentOrange, // Orange text
  },
  mealsListContainer: { // Container for the three MealItem components
    marginVertical: spacing.md,
  },
  emptyStateContainer: {
    flex: 1, // Take up available space if meals list is short or empty
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: spacing.xl, // Add some margin from WeekCalendar
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  emptyStateTitle: {
    fontFamily: typography?.heading3?.fontFamily ?? 'Poppins-Bold',
    fontSize: typography?.heading3?.fontSize ?? 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontFamily: typography?.bodyMedium?.fontFamily ?? 'Poppins-Regular',
    fontSize: typography?.bodyMedium?.fontSize ?? 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  // Removed emptyStateButton styles as it's commented out for now
});
