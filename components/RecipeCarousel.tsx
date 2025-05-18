import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import RecipeCard from './RecipeCard';
import { Recipe } from '@/services/recipeService';
import colors from '@/constants/colors';

interface RecipeCarouselProps {
  title?: string;
  recipes: Recipe[];
  onRecipePress?: (recipe: Recipe) => void;
  showViewAll?: boolean;
  viewAllRoute?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export default function RecipeCarousel({
  title = 'Similar Recipes',
  recipes = [],
  onRecipePress,
  showViewAll = true,
  viewAllRoute = '/recipes/recommended',
}: RecipeCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Don't show anything if there are no recipes
  if (recipes.length === 0) {
    return null;
  }
  
  // Handle recipe press
  const handleRecipePress = (recipe: Recipe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onRecipePress) {
      onRecipePress(recipe);
    } else {
      router.push({
        pathname: '/recipe/[id]',
        params: { id: recipe.id }
      });
    }
  };
  
  // Handle view all
  const handleViewAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    router.push(viewAllRoute);
  };
  
  // Handle scroll to update active index
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveIndex(index);
  };
  
  // Scroll to a specific index
  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < recipes.length) {
      listRef.current?.scrollToOffset({
        offset: index * CARD_WIDTH,
        animated: true,
      });
    }
  };
  
  // Render recipe item
  const renderRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`View recipe: ${item.title}`}
    >
      <RecipeCard recipe={item} type="featured" />
    </TouchableOpacity>
  );
  
  // Ref for the FlatList
  const listRef = React.useRef<FlatList>(null);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        
        {showViewAll && recipes.length > 1 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={handleViewAll}
            accessibilityLabel="View all recipes"
            accessibilityRole="button"
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        ref={listRef}
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={item => item.id || `recipe-${item.title}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      {/* Pagination dots - only if more than one recipe */}
      {recipes.length > 1 && (
        <View style={styles.pagination}>
          {recipes.map((_, index) => (
            <TouchableOpacity
              key={`dot-${index}`}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive
              ]}
              onPress={() => scrollToIndex(index)}
              accessibilityLabel={`Go to slide ${index + 1}`}
              accessibilityRole="button"
            />
          ))}
        </View>
      )}
      
      {/* Navigation arrows - only if more than one recipe */}
      {recipes.length > 1 && (
        <View style={styles.navigationArrows}>
          <TouchableOpacity
            style={[
              styles.arrowButton,
              activeIndex === 0 && styles.arrowButtonDisabled
            ]}
            onPress={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            accessibilityLabel="Previous recipe"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={activeIndex === 0 ? colors.textTertiary : colors.primary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.arrowButton,
              activeIndex === recipes.length - 1 && styles.arrowButtonDisabled
            ]}
            onPress={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === recipes.length - 1}
            accessibilityLabel="Next recipe"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={activeIndex === recipes.length - 1 ? colors.textTertiary : colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  carouselContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  recipeCard: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  navigationArrows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -50,
    paddingHorizontal: 8,
    zIndex: 10,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
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
  arrowButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
}); 