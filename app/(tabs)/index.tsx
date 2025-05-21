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
  const { savedRecipes } = useSavedRecipesStore();

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
                <PrimaryActions onAddIngredientsPress={() => {}} onSurpriseMePress={() => router.push('/generate')} />
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

            <SavedRecipesPreview recipes={currentTodaysPicks} isLoading={isLoading} onViewAllPress={handleSavedPress} onRecipePress={handleSavedRecipePress} />
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
