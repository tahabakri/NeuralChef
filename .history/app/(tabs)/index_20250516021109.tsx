"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  Alert,
  Pressable,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Sparkles, History, Trash2, ShoppingBasket } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';

import TextArea from '../../components/TextArea';
import Button from '../../components/Button';
import Card from '../../components/Card';
import PopularCombinationCard from '../../components/PopularCombinationCard';
import FilterDropdown from '../../components/FilterDropdown';
import { popularCombinations, validateIngredient } from '../../constants/ingredients';
import { useRecipeHistoryStore } from '../../stores/recipeHistoryStore';
import { useRecipeStore } from '../../stores/recipeStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { Recipe, generateRecipe, RecipeServiceError } from '../../services/recipeService';
import colors from '../../constants/colors';

interface Tag {
  id: string;
  text: string;
}

export default function TabOneScreen() {  const [inputText, setInputText] = useState('');  const [tags, setTags] = useState<Tag[]>([]);  const [isLoading, setIsLoading] = useState(false);  const [recentIngredients, setRecentIngredients] = useState<string[]>([]);  const scrollRef = useRef<ScrollView>(null);  const router = useRouter();  const { history: recipeHistory, clearHistory, addToHistory } = useRecipeHistoryStore();  const { setRecipe, setError, clearError } = useRecipeStore();  const { dietaryPreference, setDietaryPreference } = usePreferencesStore();
  
  // Load recent ingredients from AsyncStorage on component mount
  useEffect(() => {
    const loadRecentIngredients = async () => {
      try {
        // You would typically load these from AsyncStorage
        // This is a placeholder - implement actual storage in recipeHistoryStore
        setRecentIngredients(['Chicken', 'Pasta', 'Tomatoes', 'Basil', 'Garlic']);
      } catch (error) {
        console.error('Failed to load recent ingredients:', error);
      }
    };
    
    loadRecentIngredients();
  }, []);
  
  const handleAddTag = (tag: Tag) => {
    if (!tags.some(t => t.text.toLowerCase() === tag.text.toLowerCase())) {
      setTags([...tags, tag]);
      
      // Add to recent ingredients if not already there
      if (!recentIngredients.some(i => i.toLowerCase() === tag.text.toLowerCase())) {
        setRecentIngredients([tag.text, ...recentIngredients].slice(0, 10));
        // In a real app, save this to AsyncStorage via the store
      }
    }
  };
  
  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };
  
  const handleCombinationPress = (combination: typeof popularCombinations[0]) => {
    // Add the ingredients from the combination to the input
    // Clear existing tags and create new ones from the combination
    setTags([]);
    
    // Add each ingredient as a tag
    combination.ingredients.forEach(ingredient => {
      handleAddTag({
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: ingredient.charAt(0).toUpperCase() + ingredient.slice(1)
      });
    });
    
    // Update the input text with the ingredients
    setInputText(combination.ingredients.join(', ') + ', ');
  };
  
    const handleGenerateRecipes = async () => {
    if (tags.length === 0) {
      Alert.alert(
        'No Ingredients',
        'Please add at least one ingredient to generate recipes.'
      );
      return;
    }
    
    setIsLoading(true);
    clearError();
    try {
      const ingredientTexts = tags.map(tag => tag.text);
      const newRecipe = await generateRecipe(ingredientTexts, dietaryPreference);
      setRecipe(newRecipe);
      router.push('/(tabs)/recipe');
    } catch (error: any) {
      console.error("Failed to generate recipe:", error);
      const recipeError = error as RecipeServiceError;
      setError(
        recipeError.type || 'unknown',
        recipeError.message || 'Could not generate recipe. Please try again.'
      );
      Alert.alert(
        'Generation Failed',
        recipeError.message || 'An unexpected error occurred while generating your recipe. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentRecipePress = (recipe: Recipe) => {
    setRecipe(recipe);
    router.push('/(tabs)/recipe');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your recipe history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };
  
  const handleRecentIngredientPress = (ingredient: string) => {
    // Add the ingredient as a tag if not already present
    if (!tags.some(tag => tag.text.toLowerCase() === ingredient.toLowerCase())) {
      handleAddTag({
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: ingredient
      });
      
      // Update input text
      setInputText(inputText ? `${inputText}, ${ingredient}, ` : `${ingredient}, `);
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Input validation
  const validateTag = (tag: string): boolean | string => {
    return validateIngredient(tag);
  };
  
  // Animation for ingredient chips
  const AnimatedIngredientChip = ({ ingredient }: { ingredient: string }) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }]
      };
    });
    
    const handlePress = () => {
      scale.value = withSequence(
        withTiming(1.1, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      );
      
      handleRecentIngredientPress(ingredient);
    };
    
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={styles.ingredientChip}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text style={styles.ingredientChipText}>{ingredient}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Gradient background */}
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={styles.gradientBackground}
      />
      
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headline}>What ingredients do you have?</Text>
          <Text style={styles.subtitle}>
            Enter ingredients you have on hand, and we'll find delicious recipes for you.
          </Text>
        </View>
        
        <View style={styles.inputSection}>
          <TextArea
            value={inputText}
            onChangeText={setInputText}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            tags={tags}
            placeholder="Type ingredients separated by commas..."
            style={styles.textArea}
            validateTag={validateTag}
          />
          
          <Button
            title="Generate Recipes"
            onPress={handleGenerateRecipes}
            loading={isLoading}
            disabled={tags.length === 0}
            fullWidth
            icon={<Sparkles size={18} color="white" style={{ marginRight: 8 }} />}
            style={styles.generateButton}
          />
        </View>
        
        {recipeHistory.length > 0 && (
          <View style={styles.recentRecipesSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <History size={20} color="#4A4A4A" style={styles.sectionTitleIcon} />
                <Text style={styles.sectionTitle}>Recent Recipes</Text>
              </View>
              <TouchableOpacity 
                style={styles.clearHistoryButton} 
                onPress={handleClearHistory}
              >
                <Trash2 size={16} color="#FF6B6B" />
                <Text style={styles.clearHistoryText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recipeHistory}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentRecipesContainer}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={3}
              removeClippedSubviews={Platform.OS !== 'web'}
              keyExtractor={(item, index) => item.title + index}
              renderItem={({ item }) => (
                <Card
                  onPress={() => handleRecentRecipePress(item)}
                  style={styles.recentRecipeCard}
                  variant="elevated"
                  imageUri={item.heroImage || 'https://via.placeholder.com/150?text=No+Image'}
                  imageStyle={styles.recentRecipeImage}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.recentRecipeGradient}
                  >
                    <Text style={styles.recentRecipeTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.viewRecipeText}>View Recipe</Text>
                  </LinearGradient>
                </Card>
              )}
            />
          </View>
        )}
        
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Combinations</Text>
            <TouchableOpacity 
              style={styles.viewAllButton} 
              onPress={() => router.push('/(tabs)/popular' as any)}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#34C759" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={popularCombinations}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.combinationsContainer}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <PopularCombinationCard
                item={item}
                onPress={() => handleCombinationPress(item)}
              />
            )}
          />
        </View>
        
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Used Ingredients</Text>
          </View>
          
          <View style={styles.recentItems}>
            {recentIngredients.length > 0 ? (
              <FlatList
                data={recentIngredients}
                horizontal={false}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => `ingredient-${index}`}
                renderItem={({ item }) => (
                  <AnimatedIngredientChip ingredient={item} />
                )}
                contentContainerStyle={styles.ingredientsContainer}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <ExpoImage 
                  source={require('../../assets/images/empty-basket.png')} 
                  style={styles.emptyStateImage}
                  contentFit="contain"
                />
                <Text style={styles.emptyStateText}>
                  Your recently used ingredients will appear here.
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => handleRecentIngredientPress('Chicken')}
                  accessibilityLabel="Add chicken as ingredient"
                >
                  <Text style={styles.emptyStateButtonText}>Try adding chicken</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  textArea: {
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  popularSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#34C759',
    marginRight: 4,
  },
  combinationsContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recentItems: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  emptyStateText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 12,
  },
  emptyStateButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentRecipesSection: {
    marginBottom: 30,
  },
  recentRecipesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleIcon: {
    marginRight: 8,
  },
  recentRecipeCard: {
    marginRight: 12,
    width: cardWidth * 0.8,
    padding: 0,
    borderRadius: 12,
  },
  recentRecipeImage: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
  },
  recentRecipeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  recentRecipeTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  viewRecipeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  clearHistoryText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '500',
  },
  ingredientChip: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#34C759',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientChipText: {
    color: '#34C759',
    fontWeight: '500',
    fontSize: 14,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
