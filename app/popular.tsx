import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import colors from '@/constants/colors';
import GradientCard from '@/components/common/GradientCard';
import { LinearGradient } from 'expo-linear-gradient';
import gradients from '@/constants/gradients';

/**
 * Popular Recipes Screen
 * Shows trending and popular recipes
 */
export default function PopularScreen() {
  const router = useRouter();

  // Mock popular recipes data
  const popularRecipes = [
    { 
      id: '1', 
      title: 'Chicken Parmesan', 
      cuisine: 'Italian', 
      likes: 1245,
      difficulty: 'Medium'
    },
    { 
      id: '2', 
      title: 'Beef Wellington', 
      cuisine: 'British', 
      likes: 987,
      difficulty: 'Hard'
    },
    { 
      id: '3', 
      title: 'Pad Thai', 
      cuisine: 'Thai', 
      likes: 876,
      difficulty: 'Easy'
    },
    { 
      id: '4', 
      title: 'Lamb Biryani', 
      cuisine: 'Indian', 
      likes: 720,
      difficulty: 'Medium'
    },
    { 
      id: '5', 
      title: 'Greek Salad', 
      cuisine: 'Greek', 
      likes: 654,
      difficulty: 'Easy'
    }
  ];

  // Handler for recipe selection
  const handleRecipePress = (id: string) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id }
    });
  };

  // Render each recipe card
  const renderRecipeCard = ({ item }: { item: typeof popularRecipes[0] }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => handleRecipePress(item.id)}
      activeOpacity={0.9}
    >
      <GradientCard 
        gradient="warmSunset"
        roundness="large"
        elevation={3}
      >
        <View style={styles.cardContent}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <Text style={styles.recipeCuisine}>{item.cuisine} Cuisine</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            
            <View style={styles.difficultyChip}>
              <LinearGradient
                colors={getDifficultyColors(item.difficulty)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.difficultyGradient}
              >
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </GradientCard>
    </TouchableOpacity>
  );

  // Get gradient colors based on recipe difficulty
  function getDifficultyColors(difficulty: string): string[] {
    switch(difficulty) {
      case 'Easy':
        return gradients.freshGreen.colors;
      case 'Medium':
        return gradients.citrusPop.colors;
      case 'Hard':
        return gradients.sunriseOrange.colors;
      default:
        return gradients.softBlue.colors;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Popular Recipes</Text>
        <Text style={styles.subtitle}>Trending dishes loved by our community</Text>
      </View>
      
      <FlatList
        data={popularRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  recipeCuisine: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  difficultyChip: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  difficultyGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
}); 