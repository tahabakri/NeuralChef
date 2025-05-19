import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { Recipe } from '@/services/recipeService';
import RecipeCard from '@/components/RecipeCard';
import typography from '@/constants/typography';
import CategoryTag from '@/components/CategoryTag';
import LottieIllustration from '@/components/LottieIllustration';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 30; // Two cards with proper spacing

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (id: string) => void;
}

const RecommendationCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.recommendationCard}
      onPress={() => onPress(recipe.id!)}
    >
      <View style={styles.recommendationImage}>
        <View style={styles.bookmarkArea}>
          {/* Bookmark icon could be added here */}
          <Text style={styles.ratingBadge}>{recipe.rating}</Text>
        </View>
      </View>
      <View style={styles.recommendationInfo}>
        <Text style={styles.recommendationTitle}>{recipe.title}</Text>
        {recipe.author && <Text style={styles.authorText}>By {recipe.author}</Text>}
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <View style={styles.timeIconPlaceholder} />
            <Text style={styles.metaText}>{recipe.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <View style={styles.difficultyIconPlaceholder} />
            <Text style={styles.metaText}>{recipe.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface RecommendedRecipesProps {
  title: string;
  recipes: Recipe[];
  isLoading?: boolean;
  large?: boolean;
  onSeeAllPress?: () => void;
  showCategories?: boolean;
  categories?: string[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

const RecommendedRecipes: React.FC<RecommendedRecipesProps> = ({ 
  title, 
  recipes, 
  isLoading = false,
  large = false,
  onSeeAllPress,
  showCategories = false,
  categories = [],
  selectedCategory = '',
  onCategorySelect
}) => {
  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      router.push('/recipes');
    }
  };
  
  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {showCategories && categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <CategoryTag
              key={category}
              label={category}
              selected={category === selectedCategory}
              onPress={() => onCategorySelect && onCategorySelect(category)}
            />
          ))}
        </ScrollView>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LottieIllustration 
            type="cooking" 
            size={150} 
            autoPlay={true} 
            loop={true} 
          />
          <Text style={styles.loadingText}>Finding perfect recipes for you...</Text>
        </View>
      ) : !recipes || recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieIllustration type="empty-state" size={120} />
          <Text style={styles.emptyText}>No recipes found</Text>
        </View>
      ) : large ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              large={true}
              style={styles.largeCard}
              onPress={() => handleRecipePress(recipe.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              large={false}
              style={styles.smallCard}
              onPress={() => handleRecipePress(recipe.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  seeAllText: {
    ...typography.button,
    color: colors.primary,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  largeCard: {
    width: width * 0.75,
    marginRight: 16,
  },
  smallCard: {
    width: width * 0.6,
    marginRight: 16,
  },
  loadingContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 12,
  },
  recommendationCard: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.primaryLight,
  },
  bookmarkArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 30,
    height: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  recommendationInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recommendationTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  authorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  timeIconPlaceholder: {
    width: 16,
    height: 16,
    backgroundColor: colors.textSecondary,
    borderRadius: 8,
    marginRight: 6,
  },
  difficultyIconPlaceholder: {
    width: 16,
    height: 16,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    marginRight: 6,
  },
  metaText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  }
});

export default RecommendedRecipes; 