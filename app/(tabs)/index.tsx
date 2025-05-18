"use client";

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Text, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { SearchHeader } from '@/components/home';
import { Recipe } from '@/services/recipeService';
import { useRecipeStore } from '@/stores/recipeStore';
import colors from '@/constants/colors';
import { todayRecipes } from '@/constants/sampleRecipes';
import RecommendedRecipes from '@/components/home/RecommendedRecipes';
import TagSelector from '@/components/TagSelector';
import Card from '@/components/Card';
import PulseButton from '@/components/PulseButton';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { popularCombinations } from '@/constants/ingredients';

// Categories for filtering
const categories = ['All', 'Dinner', 'Breakfast', 'Lunch', 'Dessert', 'Snack'];

export default function HomeScreen() {
  const router = useRouter();
  const { setRecipe } = useRecipeStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const insets = useSafeAreaInsets();

  const handleRecipePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const selectedRecipe = todayRecipes.find((recipe: Recipe) => recipe.id === id);
    if (selectedRecipe) {
      setRecipe(selectedRecipe);
      router.push("/recipe" as any);
    }
  };

  const handleSearch = (query: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/search" as any);
  };

  const handleSeeAllPress = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(section === 'today' ? "/popular" : "/recommended" as any);
  };

  const handleCategorySelect = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const handleCreateRecipe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/create-recipe" as any);
  };

  // Featured recipe is the highest rated recipe
  const featuredRecipe = [...todayRecipes].sort((a, b) => 
    (b.rating || 0) - (a.rating || 0)
  )[0];

  const navigateToInputScreen = () => {
    router.push('/input');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>What would you like to cook today?</Text>
        </View>

        {/* Input Ingredients Section */}
        <View style={styles.inputSection}>
          <TouchableOpacity 
            style={styles.inputButton}
            onPress={navigateToInputScreen}
            activeOpacity={0.8}
          >
            <View style={styles.inputButtonContent}>
              <Ionicons name="search-outline" size={22} color={colors.primary} />
              <Text style={styles.inputButtonText}>Enter ingredients</Text>
            </View>
            <View style={styles.inputOptions}>
              <View style={styles.inputOption}>
                <Ionicons name="mic-outline" size={18} color={colors.textSecondary} />
              </View>
              <View style={styles.inputOption}>
                <Ionicons name="camera-outline" size={18} color={colors.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Recipe Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Recipe</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.featuredRecipeCard}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=3024&auto=format&fit=crop' }}
              style={styles.featuredRecipeImage}
              resizeMode="cover"
            />
            <View style={styles.featuredRecipeOverlay}>
              <View style={styles.featuredRecipeContent}>
                <View style={styles.featuredRecipeTag}>
                  <Text style={styles.featuredRecipeTagText}>Easy</Text>
                </View>
                <Text style={styles.featuredRecipeTitle}>Garlic Butter Chicken</Text>
                <View style={styles.featuredRecipeMeta}>
                  <View style={styles.featuredRecipeMetaItem}>
                    <Ionicons name="time-outline" size={14} color="white" />
                    <Text style={styles.featuredRecipeMetaText}>30 min</Text>
                  </View>
                  <View style={styles.featuredRecipeMetaItem}>
                    <Ionicons name="star" size={14} color="white" />
                    <Text style={styles.featuredRecipeMetaText}>4.8</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Popular Ingredient Combinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedScrollContent}
          >
            {popularCombinations.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.recommendedCard}
                onPress={() => {
                  router.push({
                    pathname: '/recipe',
                    params: { ingredients: item.ingredients.join(',') }
                  });
                }}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.recommendedImage}
                  resizeMode="cover"
                />
                <View style={styles.recommendedOverlay}>
                  <Text style={styles.recommendedTitle}>{item.name}</Text>
                  <Text style={styles.recommendedIngredients}>
                    {item.ingredients.slice(0, 3).join(', ')}
                    {item.ingredients.length > 3 ? '...' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Ingredients Button (Bottom) */}
        <TouchableOpacity 
          style={styles.createRecipeButton}
          onPress={navigateToInputScreen}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color="white" style={styles.createRecipeIcon} />
          <Text style={styles.createRecipeText}>Create Custom Recipe</Text>
        </TouchableOpacity>

        {/* Bottom Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
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
  inputButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  inputOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  featuredRecipeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featuredRecipeImage: {
    width: '100%',
    height: '100%',
  },
  featuredRecipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  featuredRecipeContent: {
    padding: 16,
  },
  featuredRecipeTag: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  featuredRecipeTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredRecipeTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredRecipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredRecipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  featuredRecipeMetaText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  recommendedScrollContent: {
    paddingRight: 8,
  },
  recommendedCard: {
    width: 180,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  recommendedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  recommendedTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendedIngredients: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  createRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  createRecipeIcon: {
    marginRight: 8,
  },
  createRecipeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
