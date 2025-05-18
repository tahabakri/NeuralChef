"use client";

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import GreetingHeader from '@/components/home/GreetingHeader';
import SearchHeader from '@/components/home/SearchHeader';
import RecommendedRecipes from '@/components/home/RecommendedRecipes';
import colors from '@/constants/colors';

// Using a local component instead of importing SurpriseButton to avoid module not found error
import { 
  TouchableOpacity, 
  Text, 
  View as ViewComponent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import typography from '@/constants/typography';

// Local SurpriseButton component
const SurpriseButton = ({ onPress }: { onPress?: () => void }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to generate random recipe
      router.push('/');
    }
  };

  return (
    <ViewComponent style={surpriseStyles.container}>
      <TouchableOpacity 
        style={surpriseStyles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FCE38A', '#F38181']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={surpriseStyles.gradient}
        >
          <Ionicons 
            name="shuffle" 
            size={20} 
            color="#FFFFFF" 
            style={surpriseStyles.icon} 
          />
          <Text style={surpriseStyles.text}>Surprise Me</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ViewComponent>
  );
};

const surpriseStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});

// Mock data for recipes (replacing previous recipe type with compatible one)
export interface HomeRecipe {
  id: string;
  title: string;
  description: string;
  heroImage?: string; // Changed from imageUrl to heroImage and made optional
  cookTime: string; // Changed from number to string
  prepTime: string; // Added prepTime
  servings: number;
  ingredients: string[]; // Added ingredients
  steps: { // Added steps
    instruction: string;
    imageUrl?: string;
    hasTimer?: boolean;
    timerDuration?: number;
  }[];
  tags?: string[]; // Made tags optional to align with Recipe
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD'; // Added difficulty
  rating?: number; // Added rating
  author?: string; // Added author
}

const mockTodayRecipes: HomeRecipe[] = [
  {
    id: '1',
    title: 'Vegetable Stir Fry',
    description: 'Quick and healthy vegetable stir fry with soy sauce and ginger.',
    heroImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3',
    cookTime: "20 min",
    prepTime: "10 min",
    servings: 2,
    ingredients: ["Broccoli", "Carrots", "Bell Pepper", "Soy Sauce", "Ginger"],
    steps: [{ instruction: "Chop vegetables." }, { instruction: "Stir-fry in a wok." }],
    tags: ['vegetarian', 'quick', 'healthy'],
    difficulty: "Easy",
    rating: 4.5,
    author: "Chef John"
  },
  {
    id: '2',
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta dish with eggs, cheese, and pancetta.',
    heroImage: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-4.0.3',
    cookTime: "25 min",
    prepTime: "10 min",
    servings: 4,
    ingredients: ["Spaghetti", "Eggs", "Pancetta", "Pecorino Cheese", "Black Pepper"],
    steps: [{ instruction: "Cook spaghetti." }, { instruction: "Prepare carbonara sauce." }, { instruction: "Combine and serve." }],
    tags: ['pasta', 'italian', 'dinner'],
    difficulty: "Medium",
    rating: 4.8,
    author: "Chef Maria"
  },
  {
    id: '3',
    title: 'Berry Smoothie Bowl',
    description: 'Refreshing smoothie bowl packed with antioxidants and topped with granola.',
    heroImage: 'https://images.unsplash.com/photo-1611315764615-3e788573f31e?ixlib=rb-4.0.3',
    cookTime: "5 min",
    prepTime: "5 min",
    servings: 1,
    ingredients: ["Mixed Berries", "Banana", "Almond Milk", "Granola"],
    steps: [{ instruction: "Blend berries, banana, and almond milk." }, { instruction: "Pour into a bowl and top with granola." }],
    tags: ['breakfast', 'vegan', 'healthy'],
    difficulty: "Easy",
    rating: 4.2,
    author: "Healthy Living"
  }
];

const mockRecommendedRecipes: HomeRecipe[] = [
  {
    id: '4',
    title: 'Avocado Toast',
    description: 'Simple avocado toast with poached egg and chili flakes.',
    heroImage: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e9?ixlib=rb-4.0.3',
    cookTime: "10 min",
    prepTime: "5 min",
    servings: 1,
    ingredients: ["Bread", "Avocado", "Egg", "Chili Flakes"],
    steps: [{ instruction: "Toast bread." }, { instruction: "Mash avocado and spread on toast." }, { instruction: "Top with poached egg and chili flakes." }],
    tags: ['breakfast', 'quick', 'vegetarian'],
    difficulty: "Easy",
    rating: 4.6,
    author: "Quick Bites"
  },
  {
    id: '5',
    title: 'Greek Salad',
    description: 'Fresh Mediterranean salad with feta cheese and olives.',
    heroImage: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?ixlib=rb-4.0.3',
    cookTime: "0 min",
    prepTime: "15 min",
    servings: 2,
    ingredients: ["Cucumber", "Tomatoes", "Feta Cheese", "Olives", "Red Onion", "Olive Oil"],
    steps: [{ instruction: "Chop vegetables." }, { instruction: "Combine all ingredients and drizzle with olive oil." }],
    tags: ['salad', 'healthy', 'lunch'],
    difficulty: "Easy",
    rating: 4.3,
    author: "Salad Bar"
  },
  {
    id: '6',
    title: 'Chocolate Brownies',
    description: 'Rich and fudgy chocolate brownies with walnuts.',
    heroImage: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3',
    cookTime: "30 min",
    prepTime: "15 min",
    servings: 8,
    ingredients: ["Flour", "Sugar", "Cocoa Powder", "Butter", "Eggs", "Walnuts"],
    steps: [{ instruction: "Mix dry ingredients." }, { instruction: "Mix wet ingredients." }, { instruction: "Combine and bake." }],
    tags: ['dessert', 'baking', 'chocolate'],
    difficulty: "Medium",
    rating: 4.9,
    author: "Sweet Treats"
  }
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [todayRecipes, setTodayRecipes] = useState(mockTodayRecipes);
  const [recommendedRecipes, setRecommendedRecipes] = useState(mockRecommendedRecipes);

  const handleSearch = (query: string) => {
    router.push({
      pathname: '/',
      params: { query }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerContainer}>
          <GreetingHeader onGetStartedPress={() => {}} />
          <SearchHeader onSearch={handleSearch} />
        </View>
        
        <View style={styles.recipesContainer}>
          <RecommendedRecipes
            title="Today's Recipes"
            recipes={todayRecipes}
            large={true}
            onSeeAllPress={() => router.push('/')}
          />
          
          <SurpriseButton />
          
          <RecommendedRecipes
            title="Recommended For You"
            recipes={recommendedRecipes}
            large={false}
            onSeeAllPress={() => router.push('/')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Account for tab bar height
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  recipesContainer: {
    paddingVertical: 16,
  },
});
