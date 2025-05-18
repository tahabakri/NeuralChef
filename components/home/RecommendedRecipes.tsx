import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import colors from '@/constants/colors';
import { Recipe } from '@/services/recipeService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 30; // Two cards with proper spacing

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => onPress(recipe.id!)}
    >
      <Image 
        source={recipe.heroImage ? { uri: recipe.heroImage } : require('../../assets/images/empty-plate.png')}
        style={styles.recipeImage}
        resizeMode="cover"
      />
      <View style={styles.infoOverlay}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{recipe.prepTime}</Text>
        </View>
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>{recipe.difficulty}</Text>
        </View>
      </View>
      <View style={styles.bottomInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
        <Text style={styles.ratingText}>{recipe.rating}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface RecommendationCardProps {
  recipe: Recipe;
  onPress: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recipe, onPress }) => {
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
  recipes: Recipe[];
  title: string;
  onSeeAll: () => void;
  onRecipePress: (id: string) => void;
  isRecommendation?: boolean;
}

export default function RecommendedRecipes({
  recipes,
  title,
  onSeeAll,
  onRecipePress,
  isRecommendation = false
}: RecommendedRecipesProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {isRecommendation ? (
        <View style={styles.recommendationContainer}>
          {recipes.map(recipe => (
            <RecommendationCard 
              key={recipe.id} 
              recipe={recipe} 
              onPress={onRecipePress} 
            />
          ))}
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={({ item }) => <RecipeCard recipe={item} onPress={onRecipePress} />}
          keyExtractor={(item) => item.id!}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  listContentContainer: {
    paddingHorizontal: 20,
  },
  recipeCard: {
    width: CARD_WIDTH,
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
  recipeImage: {
    width: '100%',
    height: 160,
  },
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.white,
  },
  levelContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.white,
  },
  bottomInfo: {
    backgroundColor: colors.white,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.secondary,
  },
  
  // Recommendation card styles
  recommendationContainer: {
    paddingHorizontal: 20,
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