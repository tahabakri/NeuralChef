import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Bookmark, Clock, Flame } from 'lucide-react-native';
import colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface RecipeDetailScreenProps {
  recipeId?: string;
  onBack?: () => void;
}

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipeId,
  onBack
}) => {
  // Hardcoded recipe data for the demo
  const recipe = {
    id: recipeId || '2',
    title: 'Stuffed Chicken',
    image: require('../assets/images/chef.png'), // Replace with actual recipe image
    time: '40',
    difficulty: 'MEDIUM',
    calories: '300',
    ingredients: [
      '4 boneless skinless chicken breasts Kosher salt',
      'Freshly ground black pepper',
      '4 oz. cream cheese, softened',
      '1/2 c. frozen spinach, defrosted and drained'
    ],
    directions: [
      'Preheat oven to 400°. Line a large baking sheet with foil. Make slits widthwise in chicken, being careful not to cut all the way through chicken. Season with salt and pepper.',
      '...' // Additional steps would go here
    ]
  };
  
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  
  const handleBookmarkPress = () => {
    // Implement bookmark functionality
    console.log('Bookmark pressed');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={recipe.image}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={handleBookmarkPress}
            >
              <Bookmark size={24} color="white" fill="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          
          <View style={styles.recipeMetrics}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, styles.timeIcon]}>
                <Clock size={24} color="#4CAF81" />
              </View>
              <Text style={styles.metricValue}>{recipe.time} MIN</Text>
              <Text style={styles.metricLabel}>MEDIUM</Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, styles.calorieIcon]}>
                <Flame size={24} color="#FF9800" />
              </View>
              <Text style={styles.metricValue}>{recipe.calories}</Text>
              <Text style={styles.metricLabel}>cal/serving</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients :</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={`ingredient-${index}`} style={styles.ingredientItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Directions :</Text>
            {recipe.directions.map((step, index) => (
              <View key={`step-${index}`} style={styles.directionItem}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.directionText}>{step}</Text>
              </View>
            ))}
          </View>
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
  header: {
    position: 'relative',
    height: height * 0.35,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  recipeTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#333',
    marginBottom: 20,
  },
  recipeMetrics: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 30,
  },
  metricItem: {
    alignItems: 'center',
    marginRight: 30,
  },
  metricIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeIcon: {
    backgroundColor: 'rgba(76, 175, 129, 0.1)',
  },
  calorieIcon: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  metricValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333',
  },
  metricLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#777',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: '#333',
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
    marginTop: 6,
    marginRight: 10,
  },
  ingredientText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  directionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 3,
  },
  stepNumber: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333',
  },
  directionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
});

export default RecipeDetailScreen; 