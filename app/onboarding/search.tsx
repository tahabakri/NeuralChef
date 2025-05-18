import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import colors from '@/constants/colors';
import SearchHeader from '@/components/home/SearchHeader';
import { Ionicons } from '@expo/vector-icons';

// Sample data for recipe cards
const todayRecipes = [
  {
    id: 1,
    title: 'Penne pasta tomato',
    time: '30 MIN',
    difficulty: 'EASY',
    rating: 4.8,
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 2,
    title: 'Stuffed with chicken',
    time: '40 MIN',
    difficulty: 'MEDIUM',
    rating: 5.0,
    image: 'https://via.placeholder.com/150'
  }
];

// Recommendation for muffins
const recommendation = {
  id: 3,
  title: 'Muffins with cocoa cream',
  author: 'Emma Olivia',
  time: '20 Min',
  difficulty: 'EASY',
  image: 'https://via.placeholder.com/150'
};

export default function OnboardingSearch() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // For onboarding, we'll just navigate to the main app after search
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SearchHeader onSearch={handleSearch} />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today recipe</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.recipeCardContainer}
        >
          {todayRecipes.map(recipe => (
            <View key={recipe.id} style={styles.recipeCard}>
              <View style={styles.recipeImageContainer}>
                <Text style={styles.recipeTime}>{recipe.time}</Text>
                <Text style={styles.recipeDifficulty}>{recipe.difficulty}</Text>
              </View>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeRating}>{recipe.rating}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationImageContainer}>
            <TouchableOpacity style={styles.bookmarkIcon}>
              <Ionicons name="bookmark-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            <Text style={styles.recommendationAuthor}>By {recommendation.author}</Text>
            <View style={styles.recommendationMeta}>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.metaText}>{recommendation.time}</Text>
              </View>
              <View style={styles.difficultyContainer}>
                <Ionicons name="speedometer-outline" size={20} color={colors.secondary} />
                <Text style={styles.metaText}>{recommendation.difficulty}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: colors.text,
  },
  seeAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  recipeCardContainer: {
    paddingLeft: 20,
  },
  recipeCard: {
    width: 150,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImageContainer: {
    height: 100,
    backgroundColor: colors.primaryLight,
    justifyContent: 'space-between',
    padding: 10,
  },
  recipeTime: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.textLight,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  recipeDifficulty: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.textLight,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  recipeInfo: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  recipeRating: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.secondary,
  },
  recommendationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    height: 100,
  },
  recommendationImageContainer: {
    width: 100,
    backgroundColor: colors.primaryLight,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  },
  bookmarkIcon: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 5,
  },
  recommendationContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  recommendationTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.text,
  },
  recommendationAuthor: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 5,
  },
}); 