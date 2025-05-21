"use client";

import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  Text, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { NetworkManager } from '@/components/OfflineBanner';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';

// Components

import CameraInput from '@/components/CameraInput';
import VoiceInputModal from '@/components/VoiceInputModal';
import PopularCombinationCard from '@/components/PopularCombinationCard';
import RecipeCard, { prepareRecipeForCard } from '@/components/RecipeCard';
import Card from '@/components/Card';
import IngredientInput from '@/components/IngredientInput';
import ExpandableSection from '@/components/ExpandableSection';

// Stores
import { useUserStore } from '@/stores/userStore';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';

// Constants & Utils
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { todayRecipes } from '@/constants/sampleRecipes';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const savedRecipes = useSavedRecipesStore(state => state.savedRecipes);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');
  const [currentTime, setCurrentTime] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [activeInputMethod, setActiveInputMethod] = useState<'none' | 'type' | 'voice' | 'camera'>('none');
  const [inputText, setInputText] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  
  // Animation values for input buttons
  const scaleVoice = useSharedValue(1);
  const scaleType = useSharedValue(1);
  const scaleCamera = useSharedValue(1);
  
  // Animate input button on press
  const animateButton = (scale: Animated.SharedValue<number>) => {
    scale.value = withTiming(0.95, { duration: 100, easing: Easing.inOut(Easing.quad) });
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) });
    }, 100);
  };
  
  // Animated styles for buttons
  const voiceButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleVoice.value }]
    };
  });
  
  const typeButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleType.value }]
    };
  });
  
  const cameraButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleCamera.value }]
    };
  });
  
  // Set greeting based on time of day
  useEffect(() => {
    updateGreetingAndTime();
    
    // Update time every minute
    const interval = setInterval(updateGreetingAndTime, 60000);
    
    // Simulate loading recipes
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Subscribe to network changes
    const unsubscribeNetManager = NetworkManager.addListener(setIsOffline);
    
    return () => {
      clearInterval(interval);
      unsubscribeNetManager();
    };
  }, []);
  
  const updateGreetingAndTime = () => {
    const now = new Date();
    const hours = now.getHours();
    
    // Set greeting based on time of day
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
    
    // Format date and time
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    setCurrentTime(now.toLocaleString('en-US', options));
  };
  
  // Simulate refresh
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      updateGreetingAndTime();
      setRefreshing(false);
    }, 1500);
  };
  
  // Sample data for Today's Picks - Replace with data from sampleRecipes.ts
  const todaysPicks = todayRecipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.image,
    cookTime: recipe.cookTime,
    difficulty: recipe.difficulty,
    rating: recipe.rating,
    servings: recipe.servings,
    tags: recipe.tags
  }));
  
  // Sample data for Popular Combinations
  const popularCombinations = [
    {
      id: '1',
      name: 'Rice + Chicken',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
      ingredients: ['Rice', 'Chicken', 'Vegetables']
    },
    {
      id: '2',
      name: 'Pasta + Tomato',
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
      ingredients: ['Pasta', 'Tomato', 'Basil', 'Garlic']
    }
  ];
  
  // Handler functions
  const handleVoiceInput = (recognizedText: string) => {
    setVoiceModalVisible(false);
    if (recognizedText.trim()) {
      try {
        // Process ingredients
        const newIngredients = recognizedText.split(/[,.]/).map(i => i.trim()).filter(Boolean);
        setIngredients(prev => [...prev, ...newIngredients]);
        // Expand the type input to show the ingredients
        setActiveInputMethod('type');
      } catch (error) {
        console.error('Error processing voice input:', error);
      }
    }
  };
  
  const handleCameraInput = (ingredients: string[]) => {
    if (ingredients.length > 0) {
      try {
        router.push({
          pathname: '/generate',
          params: { ingredients: JSON.stringify(ingredients) }
        });
      } catch (error) {
        console.error('Error processing camera input:', error);
      }
    }
  };
  
  const handleTypeInput = () => {
    animateButton(scaleType);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveInputMethod(activeInputMethod === 'type' ? 'none' : 'type');
  };
  
  const handleAddIngredient = () => {
    if (!inputText.trim()) return;
    
    const newIngredients = inputText
      .split(/[,\n]/)
      .map(i => i.trim())
      .filter(Boolean);
    
    setIngredients(prev => [...prev, ...newIngredients]);
    setInputText('');
  };
  
  const handleRemoveIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };
  
  const handleCombinationPress = (combination: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Map common combinations to specific recipe IDs from sampleRecipes.ts
    const recipeMapping: Record<string, string> = {
      'Rice + Chicken': '2', // Map to Stuffed with chicken recipe
      'Pasta + Tomato': '1'  // Map to Penne pasta tomato recipe
    };
    
    // Get the recipe ID based on the combination name, or use the first recipe as fallback
    const recipeId = recipeMapping[combination.name] || '1';
    
    // Navigate directly to the recipe page with the ID
    router.push(`/recipe/${recipeId}`);
  };
  
  const handleRecipePress = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/recipe/${recipeId}`);
  };
  
  const handleSavedPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/saved');
  };
  
  return (
    <LinearGradient
      colors={[colors.softPeachStart, colors.softPeachEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.softPeachStart} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Greeting Section */}
          <View style={styles.greetingContainer}>
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greetingText}>
                {greeting}!
              </Text>
              <Image 
                source={require('@/assets/images/sun-icon.png')} 
                style={styles.sunIcon} 
                resizeMode="contain" 
                accessibilityLabel="Sun icon"
              />
            </View>
            <Text style={styles.subText}>
              What would you like to cook?
            </Text>
            <Text style={styles.timeText}>
              {currentTime}
            </Text>
          </View>
          
          {/* Quick Start Section */}
          <View style={styles.quickStartSection}>
            {/* Voice Input Button */}
            <Animated.View style={voiceButtonStyle}>
              <TouchableOpacity 
                style={[styles.inputButton, isOffline && styles.disabledInputButton]}
                onPress={() => {
                  if (isOffline) return;
                  animateButton(scaleVoice);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setVoiceModalVisible(true);
                }}
                accessibilityLabel="Speak your ingredients"
                accessibilityHint="Double tap to start voice input for ingredients"
                disabled={isOffline}
              >
                <View style={[styles.inputIconContainer, isOffline && styles.disabledIconContainer]}>
                  <Ionicons name="mic-outline" size={24} color={colors.textSecondary} />
                </View>
                <Text style={styles.inputButtonText}>Speak Your Ingredients</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </Animated.View>
            
            {/* Type Input Button */}
            <Animated.View style={typeButtonStyle}>
              <TouchableOpacity 
                style={styles.inputButton}
                onPress={handleTypeInput}
                accessibilityLabel="Type your ingredients"
                accessibilityHint="Double tap to type your ingredients"
              >
                <View style={styles.inputIconContainer}>
                  <Ionicons name="list-outline" size={24} color={colors.textSecondary} />
                </View>
                <Text style={styles.inputButtonText}>Type Your Ingredients</Text>
                <Ionicons name={activeInputMethod === 'type' ? "chevron-up" : "chevron-forward"} size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </Animated.View>
            
            {/* Expanded Type Input */}
            {activeInputMethod === 'type' && (
              <View style={styles.expandedInputContainer}>
                {/* Text input field */}
                <View style={styles.textInputContainer}>
                  <TextInput 
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Enter ingredients (separated by commas)"
                    style={styles.textInput}
                  />
                  <TouchableOpacity
                    style={[styles.addButton, !inputText.trim() && styles.disabledButton]}
                    onPress={handleAddIngredient}
                    disabled={!inputText.trim()}
                  >
                    <Ionicons name="add" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
                
                {/* Ingredients list */}
                {ingredients.length > 0 && (
                  <View style={styles.ingredientsList}>
                    {ingredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <Text style={styles.ingredientText}>{ingredient}</Text>
                        <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
                          <Ionicons name="close-circle" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Generate button */}
                {ingredients.length > 0 && (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => {
                      router.push({
                        pathname: '/generate',
                        params: { ingredients: JSON.stringify(ingredients) }
                      });
                      setActiveInputMethod('none');
                    }}
                  >
                    <Text style={styles.generateButtonText}>Generate Recipe ({ingredients.length})</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Camera Input Button */}
            <Animated.View style={cameraButtonStyle}>
              <TouchableOpacity
                style={[styles.inputButton, isOffline && styles.disabledInputButton]}
                onPress={() => {
                  if (isOffline) return;
                  animateButton(scaleCamera);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCamera(true);
                }}
                accessibilityLabel="Take a photo of ingredients"
                accessibilityHint="Double tap to use camera to capture your ingredients"
                disabled={isOffline}
              >
                <View style={[styles.inputIconContainer, isOffline && styles.disabledIconContainer]}>
                  <Ionicons name="camera-outline" size={24} color={isOffline ? colors.textDisabled : colors.textSecondary} />
                </View>
                <Text style={[styles.inputButtonText, isOffline && styles.disabledButtonText]}>Take a Photo of Ingredients</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Today's Picks Section - Offline aware */}
          {!isOffline && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Today's Picks for You</Text>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Finding delicious recipes...</Text>
                </View>
              ) : (
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {todaysPicks.map(pick => {
                    return (
                      <RecipeCard
                        key={pick.id}
                        recipe={prepareRecipeForCard({
                          ...pick,
                          image: pick.image,
                        })}
                        style={styles.recipeCard}
                        onPress={() => handleRecipePress(pick.id)}
                      />
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}
          
          {/* Popular Combinations Section - Offline aware */}
          {!isOffline && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Popular Lunch Combos</Text>
              <View style={styles.popularCombosContainer}>
                {popularCombinations.map((combo, index) => (
                  <TouchableOpacity
                    key={combo.id}
                    style={[
                      styles.comboItem,
                      index === popularCombinations.length - 1 && styles.lastComboItem
                    ]}
                    onPress={() => handleCombinationPress(combo)}
                    accessibilityLabel={`${combo.name} combination`}
                    accessibilityHint={`Double tap to use ${combo.ingredients.join(', ')} as ingredients`}
                  >
                    <Image 
                      source={{ uri: combo.image }}
                      style={styles.comboItemImage}
                    />
                    <View style={styles.comboItemContent}>
                      <Text style={styles.comboItemTitle}>{combo.name}</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Offline Saved Recipes Section */}
          {isOffline && savedRecipes && savedRecipes.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Your Saved Recipes</Text>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {savedRecipes.slice(0, 5).map(serviceRecipe => (
                  <RecipeCard
                    key={serviceRecipe.id || serviceRecipe.title}
                    recipe={prepareRecipeForCard({
                      ...serviceRecipe,
                      id: serviceRecipe.id || serviceRecipe.title,
                      image: serviceRecipe.heroImage || 'assets/images/placeholder.png',
                      saved: true
                    })}
                    style={styles.recipeCard}
                    onPress={() => handleRecipePress(serviceRecipe.id || serviceRecipe.title)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          
          {isOffline && (!savedRecipes || savedRecipes.length === 0) && (
            <View style={styles.offlineMessageContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.offlineMessageText}>
                You're offline. No saved recipes to show.
              </Text>
              <Text style={styles.offlineSubMessageText}>
                Connect to the internet to discover new recipes.
              </Text>
            </View>
          )}
          
          {/* Saved Recipes Shortcut - Always visible but more prominent if offline */}
          <TouchableOpacity 
            style={styles.savedRecipesButton}
            onPress={handleSavedPress}
            accessibilityLabel="View my favorites"
            accessibilityHint="Double tap to see your saved recipes"
          >
            <Ionicons name="bookmark" size={20} color={colors.primary} />
            <Text style={styles.savedRecipesText}>View My Favorites</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      
      {/* Voice Input Modal */}
      {voiceModalVisible && (
        <VoiceInputModal
          visible={voiceModalVisible}
          onComplete={handleVoiceInput}
          onClose={() => setVoiceModalVisible(false)}
        />
      )}

      {/* Camera Input */}
      {showCamera && (
        <View style={styles.cameraOverlay}>
          <CameraInput
            onIngredientsDetected={(detectedIngredients) => {
              setIngredients(prev => [...prev, ...detectedIngredients]);
              setShowCamera(false);
              // If we have ingredients, expand the type input to show them
              setActiveInputMethod('type');
            }}
          />
          <TouchableOpacity 
            style={styles.closeCameraButton}
            onPress={() => setShowCamera(false)}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  greetingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  greetingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    ...typography.title1,
    color: colors.text,
    marginRight: 10,
  },
  sunIcon: {
    width: 30,
    height: 30,
  },
  subText: {
    ...typography.title3,
    color: colors.text,
    marginTop: 5,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 8,
  },
  quickStartSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 10,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputButtonText: {
    ...typography.bodyLarge,
    color: colors.text,
    flex: 1,
  },
  disabledInputButton: {
    backgroundColor: colors.backgroundDisabled,
    opacity: 0.7,
  },
  disabledIconContainer: {
    backgroundColor: colors.iconDisabledBackground,
  },
  disabledButtonText: {
    color: colors.textDisabled,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 15,
  },
  horizontalScrollContent: {
    paddingRight: 20,
  },
  recipeCard: {
    width: 250,
    marginRight: 15,
  },
  popularCombosContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  comboItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    padding: 12,
  },
  lastComboItem: {
    borderBottomWidth: 0,
  },
  comboItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  comboItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comboItemTitle: {
    ...typography.bodyLarge,
    color: colors.text,
  },
  savedRecipesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    margin: 20,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savedRecipesText: {
    ...typography.bodyLarge,
    color: colors.primary,
    flex: 1,
    marginLeft: 10,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 10,
  },
  offlineMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  offlineMessageText: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  offlineSubMessageText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 5,
  },
  inputOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 10,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hiddenCamera: {
    height: 0,
    width: 0,
    overflow: 'hidden',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text,
    backgroundColor: colors.cardAlt,
  },
  expandedInputContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientsList: {
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  ingredientText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.backgroundDisabled,
    opacity: 0.7,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  generateButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.white,
    marginRight: 8,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  closeCameraButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
});
