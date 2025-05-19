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
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { ChevronLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useMealPlannerStore } from '@/stores/mealPlannerStore';
import { Recipe } from '@/services/recipeService';
import { 
  WeekCalendar, 
  MealItem, 
  RecipeSelector, 
  ReminderSelector 
} from '@/components/MealPlanner';
import { MealType, ScheduledMeal } from '@/components/MealPlanner/types';

export default function MealPlannerScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    selectedDate, 
    setSelectedDate, 
    getNextWeekDates, 
    getMealsForDateAndType,
    scheduleMeal,
    toggleMealNotification,
    setMealReminderTime
  } = useMealPlannerStore();

  const [recipeSelectorVisible, setRecipeSelectorVisible] = useState(false);
  const [reminderSelectorVisible, setReminderSelectorVisible] = useState(false);
  const [currentMealType, setCurrentMealType] = useState<MealType>('breakfast');
  const [currentMealId, setCurrentMealId] = useState<string>('');
  const [weekDates, setWeekDates] = useState<string[]>([]);

  useEffect(() => {
    setWeekDates(getNextWeekDates());
  }, [selectedDate, getNextWeekDates]);

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

  const renderMealItem = (mealType: MealType) => {
    const meal = getMealsForType(mealType)[0]; // Assuming one meal per type per day
    return (
      <MealItem 
        key={mealType}
        mealType={mealType}
        meal={meal}
        onPress={() => handleAddMeal(mealType)}
        onItemPress={(selectedMeal: ScheduledMeal) => {
          router.push(`/recipe/${selectedMeal.recipeId}`);
        }}
        onSetReminderPress={(selectedMeal: ScheduledMeal) => {
          setCurrentMealType(mealType);
          setCurrentMealId(selectedMeal.id);
          setReminderSelectorVisible(true);
        }}
      />
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.softPeachStart, colors.softPeachEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.softPeachStart} />
        <Stack.Screen 
        options={{
          title: 'Meal Planner',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.softPeachStart,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            color: colors.text,
          }
        }} 
      />

      <View style={styles.header}>
        <Text style={styles.dateText}>
          {getFormattedDate()}
        </Text>
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
      ) : (
        <ScrollView style={styles.mealsContainer}>
          {renderMealItem('breakfast')}
          {renderMealItem('lunch')}
          {renderMealItem('dinner')}
        </ScrollView>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Scheduling meal...</Text>
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
    alignItems: 'center',
  },
  dateText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginVertical: 5,
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
