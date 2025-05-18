import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import gradients from '@/constants/gradients';
import GradientButton from '@/components/common/GradientButton';

/**
 * Recipe Detail Screen
 * Shows details for a specific recipe
 */
export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Mock recipe data - in a real app, this would come from an API or store
  const recipe = {
    id,
    title: 'Spaghetti Carbonara',
    description: 'A classic Italian pasta dish with a creamy egg sauce, crispy pancetta, and Parmesan cheese.',
    cookTime: 30,
    prepTime: 15,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Italian',
    ingredients: [
      { id: '1', name: 'Spaghetti', amount: '400g' },
      { id: '2', name: 'Pancetta', amount: '150g' },
      { id: '3', name: 'Egg Yolks', amount: '4' },
      { id: '4', name: 'Parmesan Cheese', amount: '50g' },
      { id: '5', name: 'Black Pepper', amount: '1 tsp' },
      { id: '6', name: 'Salt', amount: 'to taste' },
    ],
    steps: [
      { id: '1', description: 'Bring a large pot of salted water to boil and cook the spaghetti until al dente.' },
      { id: '2', description: 'While the pasta cooks, heat a large skillet over medium heat and add the pancetta. Cook until crispy.' },
      { id: '3', description: 'In a bowl, whisk together the egg yolks and grated Parmesan cheese.' },
      { id: '4', description: 'When the pasta is done, reserve 1/2 cup of pasta water and drain.' },
      { id: '5', description: 'Add the hot pasta to the skillet with the pancetta, stirring to combine.' },
      { id: '6', description: 'Remove the skillet from heat and quickly add the egg mixture, stirring constantly. The residual heat will cook the eggs into a creamy sauce.' },
      { id: '7', description: 'If the sauce is too thick, add a splash of the reserved pasta water.' },
      { id: '8', description: 'Season with freshly ground black pepper and serve immediately with extra Parmesan.' },
    ],
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyYm9uYXJhfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    isSaved: false,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTintColor: 'white',
          headerTitle: '',
          headerLeft: (props) => (
            <TouchableOpacity
              onPress={router.back}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView>
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: recipe.image }} 
            style={styles.headerImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.recipeHeaderInfo}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeCuisine}>{recipe.cuisine} Cuisine</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.description}>{recipe.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Prep</Text>
              <Text style={styles.statValue}>{recipe.prepTime} min</Text>
            </View>
            
            <View style={styles.stat}>
              <Ionicons name="timer-outline" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Cook</Text>
              <Text style={styles.statValue}>{recipe.cookTime} min</Text>
            </View>
            
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Serves</Text>
              <Text style={styles.statValue}>{recipe.servings}</Text>
            </View>
            
            <View style={styles.stat}>
              <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Difficulty</Text>
              <Text style={styles.statValue}>{recipe.difficulty}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <LinearGradient
              colors={gradients.softPeach.colors}
              start={gradients.softPeach.direction.start}
              end={gradients.softPeach.direction.end}
              style={styles.ingredientsList}
            >
              {recipe.ingredients.map((ingredient) => (
                <View key={ingredient.id} style={styles.ingredient}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.steps.map((step, index) => (
              <View key={step.id} style={styles.step}>
                <View style={styles.stepNumberContainer}>
                  <LinearGradient
                    colors={gradients.warmSunset.colors}
                    style={styles.stepNumberGradient}
                  >
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.stepText}>{step.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <GradientButton
          title="Start Cooking"
          gradient="sunriseOrange"
          onPress={() => console.log('Start cooking')}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerImageContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  recipeHeaderInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  recipeCuisine: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  ingredientsList: {
    borderRadius: 12,
    padding: 16,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  ingredientAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumberContainer: {
    marginRight: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  stepNumberGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: 'white',
  },
}); 