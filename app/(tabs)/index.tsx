"use client";

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Platform,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { NetworkManager } from '@/components/OfflineBanner';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Stores
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { Recipe as SavedRecipeType } from '@/services/recipeService';
import { useMealPlannerStore } from '@/stores/mealPlannerStore';
import { Recipe as ServiceRecipe } from '@/stores/recipeStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

// Hooks
import {
  MockWeather,
  WeatherRecipeSuggestion,
  mockWeatherScenarios,
  getWeatherBasedSuggestionLogic,
} from '@/hooks/useWeatherSuggestionLogic';

// Constants & Utils
import colors from '@/constants/colors';
import { todayRecipes } from '@/constants/sampleRecipes'; // Used as availableRecipes

// Components
import WeatherBanner from '@/components/home/WeatherBanner'; // Added
import PrimaryActions from '@/components/home/PrimaryActions';
import QuickCookCard from '@/components/home/QuickCookCard';
import TodaysPlanSummary from '@/components/home/TodaysPlanSummary';
import WeeklyCookingGoal from '@/components/home/WeeklyCookingGoal';
import SavedRecipesPreview from '@/components/home/SavedRecipesPreview';
import { prepareRecipeForCard, Recipe as RecipeCardRecipe } from '@/components/RecipeCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { getMealsForDateAndType } = useMealPlannerStore();
  const { savedRecipes, saveRecipe, removeSavedRecipe, isSaved } = useSavedRecipesStore();
  const preferences = usePreferencesStore(state => ({
    dietaryProfile: state.dietaryProfile,
    allergies: state.allergies,
    dislikedIngredients: state.dislikedIngredients,
    spiceLevel: state.spiceLevel,
    cuisineTypes: state.cuisineTypes,
    cookingTimeLimit: state.cookingTimeLimit,
    maxCalories: state.maxCalories,
    portionSize: state.portionSize,
    microPreferences: state.microPreferences,
    cookingGoals: state.cookingGoals,
    mealTimePreference: state.mealTimePreference,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const [weeklyCookingGoal, setWeeklyCookingGoal] = useState(5);
  const [cookedMealsThisWeek, setCookedMealsThisWeek] = useState(2);
  const [currentTodaysPicks, setCurrentTodaysPicks] = useState<RecipeCardRecipe[]>([]);
  const [currentWeather, setCurrentWeather] = useState<MockWeather | null>(null);
  const [weatherRecipeSuggestion, setWeatherRecipeSuggestion] = useState<WeatherRecipeSuggestion | null>(null);

  useEffect(() => {
    // Initial load and network listener
    setTimeout(() => setIsLoading(false), 1000);
    const unsubscribe = NetworkManager.addListener(setIsOffline);
    const picks = todayRecipes.slice(0, 5).map(prepareRecipeForCard);
    setCurrentTodaysPicks(picks);

    // Fetch initial weather
    const fetchWeatherAndSuggest = async () => {
      try {
        // Simulate getting location (random mock for now)
        const randomMock = mockWeatherScenarios[Math.floor(Math.random() * mockWeatherScenarios.length)];
        setCurrentWeather(randomMock);
      } catch (error) {
        console.warn("Error fetching mock location/weather:", error);
        setCurrentWeather(mockWeatherScenarios[0]); // Fallback
      }
    };

    fetchWeatherAndSuggest();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Update suggestion when weather changes
    if (currentWeather) {
      const suggestion = getWeatherBasedSuggestionLogic(currentWeather, todayRecipes as ServiceRecipe[]);
      setWeatherRecipeSuggestion(suggestion);
    }
  }, [currentWeather]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRecipePress = (meal: { recipe: { id: string } }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/recipe/${meal.recipe.id}`);
  };

  const handleSavedRecipePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/recipe/${id}`);
  };

  const handleSavedPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/saved');
  };

  const handleSaveToggle = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const recipeToToggle = currentTodaysPicks.find(r => r.id === recipeId) || todayRecipes.find(r => r.id === recipeId);
    if (recipeToToggle) {
      const currentlySaved = isSaved(recipeToToggle.title); // Use title as per store logic
      if (currentlySaved) {
        removeSavedRecipe(recipeToToggle.title);
      } else {
        // The recipeToToggle can be either RecipeCardRecipe or a Recipe from sampleRecipes
        // We need to map it to SavedRecipeType
        const recipeToSave: SavedRecipeType = {
          id: recipeToToggle.id,
          title: recipeToToggle.title,
          description: recipeToToggle.description || '',
          image: (recipeToToggle as RecipeCardRecipe).imageUrl || (recipeToToggle.image as string) || '', // Handle both imageUrl and image
          cookTime: recipeToToggle.cookTime,
          prepTime: recipeToToggle.prepTime || 0, // Default to 0 if undefined
          totalTime: recipeToToggle.totalTime,
          difficulty: recipeToToggle.difficulty,
          servings: recipeToToggle.servings || 1, // Default to 1 if undefined
          rating: recipeToToggle.rating,
          ingredients: recipeToToggle.ingredients || [],
          steps: recipeToToggle.steps || [],
          tags: recipeToToggle.tags || [],
          notes: (recipeToToggle as any).notes, // Cast to any if notes is not in all types
          source: (recipeToToggle as any).source,
          author: (recipeToToggle as any).author,
          createdAt: (recipeToToggle as any).createdAt || new Date().toISOString(),
        };
        saveRecipe(recipeToSave);
      }
      // No local flag juggling needed – rely on store-driven re-render
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, chef! ☀️';
    if (hour < 18) return 'Good afternoon, chef! ☀️';
    return 'Good evening, chef! ☀️';
  };

  // Removed getFormattedTimestamp as it was used by GreetingHeader
  // const getFormattedTimestamp = () =>
  //   new Date().toLocaleTimeString('en-US', {
  //     weekday: 'long',
  //     month: 'long',
  //     day: 'numeric',
  //     hour: 'numeric',
  //     minute: 'numeric',
  //     hour12: true
  //   });

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const meals = [
    ...getMealsForDateAndType(todayKey, 'breakfast'),
    ...getMealsForDateAndType(todayKey, 'lunch'),
    ...getMealsForDateAndType(todayKey, 'dinner')
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient colors={[colors.white, colors.cardContentBg]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          >
            <View style={styles.header}>
              <LinearGradient
                colors={[colors.background, colors.background]}
                style={[styles.headerGradient, { paddingTop: insets.top }]}
              >
                {/* <GreetingHeader 
                  greeting={getGreeting()} 
                  eventMessage={eventMessage}
                  subTitle="What would you like to cook?" 
                  timestamp={getFormattedTimestamp()}
                /> */}
                {isOffline ? null : weatherRecipeSuggestion && currentWeather && (
                  <WeatherBanner
                    weatherCondition={`${currentWeather.city}: ${currentWeather.temp}°C, ${currentWeather.description}`}
                    recipeSuggestionText={`${weatherRecipeSuggestion.suggestionReason} How about ${weatherRecipeSuggestion.title}?`}
                    weatherIconName={currentWeather.iconName}
                    recipeIdToNavigate={weatherRecipeSuggestion.id}
                  />
                )}
                <PrimaryActions
                  onAddIngredientsPress={() => router.push('/input')}
                  onChefsPickPress={() => {
                    const queryParams = new URLSearchParams();
                    queryParams.append('dietaryProfile', preferences.dietaryProfile);
                    queryParams.append('allergies', JSON.stringify(preferences.allergies));
                    queryParams.append('dislikedIngredients', JSON.stringify(preferences.dislikedIngredients));
                    queryParams.append('spiceLevel', preferences.spiceLevel);
                    queryParams.append('cuisineTypes', JSON.stringify(preferences.cuisineTypes));
                    queryParams.append('cookingTimeLimit', preferences.cookingTimeLimit.toString());
                    queryParams.append('maxCalories', preferences.maxCalories.toString());
                    queryParams.append('portionSize', preferences.portionSize);
                    queryParams.append('microPreferences', JSON.stringify(preferences.microPreferences));
                    queryParams.append('cookingGoals', JSON.stringify(preferences.cookingGoals));
                    queryParams.append('mealTimePreference', preferences.mealTimePreference);
                    router.push(`/generate?${queryParams.toString()}`);
                  }} 
                />
              </LinearGradient>
            </View>

            <QuickCookCard
              introText="Need food fast? Try this!" // Added new required prop
              recipeName="Creamy Broccoli Pasta" // Kept existing, but "Try this" removed as it's in introText
              durationText="Ready in 20 minutes"
              imageUrl="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9"
              onNavigate={() => router.push('/recipe/1')}
              // Removed onSaveRecipe, isSaved, and urgencyLevel props
            />

            <TodaysPlanSummary
              meals={meals}
              isLoading={isLoading}
              onViewAllPress={() => router.push('/meal-planner')}
              onAddMealPress={() => router.push('/meal-planner')}
              onMealPress={handleRecipePress}
              onEditMealPress={(mealId) => console.log('Edit meal:', mealId)} // Placeholder
              onDeleteMealPress={(mealId) => console.log('Delete meal:', mealId)} // Placeholder
            />

            <WeeklyCookingGoal
              goal={weeklyCookingGoal}
              completedCount={cookedMealsThisWeek}
              motivationalText="Keep it up! You're making great progress toward your goal."
              onEditGoalPress={() => {}}
              onMarkMealCookedPress={() => setCookedMealsThisWeek(prev => Math.min(prev + 1, weeklyCookingGoal))}
              onViewHistoryPress={() => console.log('View history pressed')} // Placeholder
            />

            <SavedRecipesPreview
              recipes={currentTodaysPicks.map(p => ({
                ...p,
                image: p.imageUrl || (typeof p.image === 'string' ? p.image : ''), // Ensure image is a string
                saved: savedRecipes.some(s => s.id === p.id)
              } as ServiceRecipe))}
              isLoading={isLoading}
              onViewAllPress={handleSavedPress}
              onRecipePress={handleSavedRecipePress}
              onSaveToggle={handleSaveToggle}
            />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  header: { minHeight: 200, backgroundColor: colors.background }, // Adjusted minHeight
  headerGradient: { flex: 1, position: 'relative', paddingBottom: 16 }
});
