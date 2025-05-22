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
import { Recipe as SavedRecipeType } from '@/services/recipeService'; // Assuming Recipe type is from recipeService
import { useMealPlannerStore } from '@/stores/mealPlannerStore';

// Constants & Utils
import colors from '@/constants/colors';
import { todayRecipes } from '@/constants/sampleRecipes';

// Components
import GreetingHeader from '@/components/home/GreetingHeader';
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

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const [weeklyCookingGoal, setWeeklyCookingGoal] = useState(5);
  const [cookedMealsThisWeek, setCookedMealsThisWeek] = useState(2);
  const [currentTodaysPicks, setCurrentTodaysPicks] = useState<RecipeCardRecipe[]>([]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
    const unsubscribe = NetworkManager.addListener(setIsOffline);
    const picks = todayRecipes.slice(0, 5).map(prepareRecipeForCard);
    setCurrentTodaysPicks(picks);
    return () => {
      unsubscribe();
    };
  }, []);

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

  const getFormattedTimestamp = () =>
    new Date().toLocaleTimeString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const meals = [
    ...getMealsForDateAndType(todayKey, 'breakfast'),
    ...getMealsForDateAndType(todayKey, 'lunch'),
    ...getMealsForDateAndType(todayKey, 'dinner')
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient colors={[colors.softPeachStart, colors.softPeachEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          >
            <View style={styles.header}>
              <LinearGradient
                colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
                style={[styles.headerGradient, { paddingTop: insets.top }]}
              >
                <GreetingHeader greeting={getGreeting()} subTitle="What would you like to cook?" timestamp={getFormattedTimestamp()} />
                <PrimaryActions onAddIngredientsPress={() => router.push('/input')} onSurpriseMePress={() => router.push('/generate')} />
              </LinearGradient>
            </View>

            <QuickCookCard
              title="Quick Cook"
              recipeName="Try this Creamy Broccoli Pasta"
              durationText="Ready in 20 minutes"
              imageUrl="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9"
              onNavigate={() => router.push('/recipe/1')}
            />

            <TodaysPlanSummary meals={meals} isLoading={isLoading} onViewAllPress={() => router.push('/meal-planner')} onAddMealPress={() => router.push('/meal-planner')} onMealPress={handleRecipePress} />

            <WeeklyCookingGoal
              goal={weeklyCookingGoal}
              completedCount={cookedMealsThisWeek}
              motivationalText="Keep it up! You're making great progress toward your goal."
              onEditGoalPress={() => {}}
              onMarkMealCookedPress={() => setCookedMealsThisWeek(prev => Math.min(prev + 1, weeklyCookingGoal))}
            />

            <SavedRecipesPreview 
              recipes={currentTodaysPicks.map(p => ({ ...p, saved: savedRecipes.some(s => s.id === p.id) }))} 
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
  header: { minHeight: 280, backgroundColor: colors.background },
  headerGradient: { flex: 1, position: 'relative', paddingBottom: 16 }
});
