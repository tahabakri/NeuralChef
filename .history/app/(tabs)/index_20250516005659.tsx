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
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Sparkles, History, Image as ImageIcon } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import TextArea from '../../components/TextArea';
import Button from '../../components/Button';
import Card from '../../components/Card';
import PopularCombinationCard from '../../components/PopularCombinationCard';
import { popularCombinations, validateIngredient } from '../../constants/ingredients';
import { useRecipeHistoryStore } from '../../stores/recipeHistoryStore';
import { useRecipeStore } from '../../stores/recipeStore';
import { Recipe, generateRecipe, RecipeServiceError } from '../../services/recipeService';
import colors from '../../constants/colors';

interface Tag {
  id: string;
  text: string;
}

export default function TabOneScreen() {
  const [inputText, setInputText] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { history: recipeHistory } = useRecipeHistoryStore();
  const { setRecipe, setError, clearError } = useRecipeStore();
  
  const handleAddTag = (tag: Tag) => {
    if (!tags.some(t => t.text.toLowerCase() === tag.text.toLowerCase())) {
      setTags([...tags, tag]);
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
      const newRecipe = await generateRecipe(ingredientTexts);
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

  // Input validation
  const validateTag = (tag: string): boolean | string => {
    return validateIngredient(tag);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
            </View>
            <FlatList
              data={recipeHistory}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentRecipesContainer}
              keyExtractor={(item, index) => item.title + index}
              renderItem={({ item }) => (
                <Card
                  onPress={() => handleRecentRecipePress(item)}
                  style={[styles.recentRecipeCard, { width: cardWidth * 0.8 }]}
                  variant="elevated"
                >
                  <ImageBackground 
                    source={{ uri: item.heroImage || 'https://via.placeholder.com/150?text=No+Image' }} 
                    style={styles.recentRecipeImage}
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={styles.recentRecipeGradient}
                    >
                      <Text style={styles.recentRecipeTitle} numberOfLines={2}>{item.title}</Text>
                    </LinearGradient>
                  </ImageBackground>
                </Card>
              )}
            />
          </View>
        )}
        
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Combinations</Text>
            <TouchableOpacity style={styles.viewAllButton}>
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
            <Text style={styles.emptyStateText}>
              Your recently used ingredients will appear here.
            </Text>
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
    backgroundColor: '#FFFFFF',
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
  combinationCard: {
    width: cardWidth,
    height: 180,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 15,
    justifyContent: 'flex-end',
  },
  cardContent: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  tapToAdd: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  recentSection: {
    paddingHorizontal: 20,
  },
  recentItems: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
  recentRecipesSection: {
    marginBottom: 30,
    paddingLeft: 20,
  },
  recentRecipesContainer: {
    paddingRight: 20,
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
    padding: 0,
    borderRadius: 16,
  },
  recentRecipeImage: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
  },
  recentRecipeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  recentRecipeTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
