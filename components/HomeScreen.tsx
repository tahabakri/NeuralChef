import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface RecipeCardProps {
  title: string;
  image: any;
  time: string;
  difficulty: string;
  rating?: number;
  onPress: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  title, 
  image, 
  time, 
  difficulty, 
  rating,
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={onPress}
    >
      <Image 
        source={image} 
        style={styles.recipeImage}
        resizeMode="cover"
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTime}>{time} MIN</Text>
        <Text style={styles.recipeDifficulty}>{difficulty}</Text>
      </View>
      {rating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      )}
      <Text style={styles.recipeTitle} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
};

interface HomeScreenProps {
  onRecipePress?: (recipeId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onRecipePress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const todayRecipes = [
    {
      id: '1',
      title: 'Penne pasta tomato',
      image: require('../assets/images/chef.png'), // Replace with actual recipe image
      time: '30',
      difficulty: 'EASY',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Stuffed with chicken',
      image: require('../assets/images/chef.png'), // Replace with actual recipe image
      time: '40',
      difficulty: 'MEDIUM',
      rating: 5.0
    }
  ];
  
  const recommendedRecipes = [
    {
      id: '3',
      title: 'Muffins with cocoa cream',
      image: require('../assets/images/chef.png'), // Replace with actual recipe image
      time: '20',
      difficulty: 'EASY',
      rating: 5.0,
      author: 'Emma Olivia'
    },
    {
      id: '4',
      title: 'Beef doner with bread',
      image: require('../assets/images/chef.png'), // Replace with actual recipe image
      time: '35',
      difficulty: 'MEDIUM',
      rating: 4.7,
      author: 'John Smith'
    }
  ];
  
  const handleRecipePress = (recipeId: string) => {
    if (onRecipePress) {
      onRecipePress(recipeId);
    } else {
      router.push(`/recipe/${recipeId}`);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton}>
            <View style={styles.menuIcon}></View>
            <View style={[styles.menuIcon, { width: 15 }]}></View>
            <View style={[styles.menuIcon, { width: 10 }]}></View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>What would you{'\n'}like to Cook?</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your query"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today recipe</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {todayRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                image={recipe.image}
                time={recipe.time}
                difficulty={recipe.difficulty}
                rating={recipe.rating}
                onPress={() => handleRecipePress(recipe.id)}
              />
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recommended</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recommendedRecipes.map(recipe => (
            <TouchableOpacity 
              key={recipe.id}
              style={styles.recommendedRecipeCard}
              onPress={() => handleRecipePress(recipe.id)}
            >
              <Image 
                source={recipe.image}
                style={styles.recommendedRecipeImage}
                resizeMode="cover"
              />
              <View style={styles.recommendedRecipeDetails}>
                <View>
                  <Text style={styles.recommendedRecipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recommendedRecipeAuthor}>By {recipe.author}</Text>
                </View>
                
                <View style={styles.recommendedRecipeInfo}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{recipe.rating?.toFixed(1)}</Text>
                  </View>
                  
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{recipe.time} Min</Text>
                  </View>
                  
                  <View style={styles.difficultyContainer}>
                    <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    width: 20,
    height: 2,
    backgroundColor: '#333',
    marginVertical: 2,
    borderRadius: 2,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#333',
    lineHeight: 42,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 30,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#333',
  },
  seeAllText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#999',
  },
  horizontalScrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  recipeCard: {
    width: 160,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeImage: {
    width: '100%',
    height: 130,
    borderRadius: 12,
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recipeTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#777',
  },
  recipeDifficulty: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#777',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#333',
  },
  recipeTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  recommendedRecipeCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendedRecipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  recommendedRecipeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recommendedRecipeTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  recommendedRecipeAuthor: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#777',
  },
  recommendedRecipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginRight: 8,
  },
  timeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#777',
  },
  difficultyContainer: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#FFF0E0',
    borderRadius: 12,
  },
  difficultyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#FF8C00',
  },
});

export default HomeScreen; 