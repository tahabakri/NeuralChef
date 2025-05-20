import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image
} from 'react-native';
import { router } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { GreetingHeader } from './home';
import { Search, ArrowRight } from 'lucide-react-native';
import { AppRoutes } from '@/app/routes';

// Custom bottom tab bar component - updated to match new navigation flow
const BottomTabBar = () => {
  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={tabStyles.container}>
      <TouchableOpacity 
        style={tabStyles.tabItem}
        onPress={() => handleTabPress("/")}
      >
        <Ionicons name="home" size={22} color={colors.primary} />
        <Text style={tabStyles.activeLabel}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={tabStyles.tabItem}
        onPress={() => handleTabPress("/(tabs)/meal-planner")}
      >
        <Ionicons name="calendar-outline" size={22} color={colors.textTertiary} />
        <Text style={tabStyles.label}>Meal Planner</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={tabStyles.tabItem}
        onPress={() => handleTabPress("/saved")}
      >
        <Ionicons name="bookmark-outline" size={22} color={colors.textTertiary} />
        <Text style={tabStyles.label}>Saved</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={tabStyles.tabItem}
        onPress={() => handleTabPress("/history")}
      >
        <Ionicons name="time-outline" size={22} color={colors.textTertiary} />
        <Text style={tabStyles.label}>History</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={tabStyles.tabItem}
        onPress={() => handleTabPress("/settings")}
      >
        <Ionicons name="settings-outline" size={22} color={colors.textTertiary} />
        <Text style={tabStyles.label}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  label: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 4,
    fontSize: 10,
  },
  activeLabel: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
  }
});

const HomeScreen: React.FC = () => {
  const handleSearchPress = () => {
    router.push("/search" as any);
  };

  const handleCategoryPress = (category: string) => {
    // Navigate to category-specific view with params
    router.push({
      pathname: "/recipes",
      params: { category }
    } as any);
  };

  const handleRecipePress = (recipeId: string) => {
    router.push({
      pathname: "/recipe/[id]",
      params: { id: recipeId }
    } as any);
  };
  
  const handleSeeAllPress = (category: string) => {
    router.push({
      pathname: "/recipes",
      params: { category }
    } as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.subtitle}>What would you like to cook today?</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ingredients or recipes"
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <ArrowRight size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Recipe Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Late-Night Recipes</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('late-night')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <TouchableOpacity 
              style={[styles.categoryTag, styles.activeCategory]} 
              onPress={() => handleCategoryPress('late-night-snacks')}
            >
              <Ionicons name="moon-outline" size={18} color="#FFFFFF" style={styles.categoryIcon} />
              <Text style={styles.activeCategoryText}>Late-Night Snacks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.categoryTag} 
              onPress={() => handleCategoryPress('light-bites')}
            >
              <Text style={styles.categoryText}>Light Bites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.categoryTag} 
              onPress={() => handleCategoryPress('quick')}
            >
              <Text style={styles.categoryText}>Quick</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Recipe Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recipesContainer}
        >
          <TouchableOpacity 
            style={styles.recipeCard}
            onPress={() => handleRecipePress('1')}
          >
            <View style={styles.recipeIconContainer}>
              <Ionicons name="restaurant-outline" size={40} color="#000" />
            </View>
            <Text style={styles.recipeTitle}>Vegetable Stir Fry</Text>
            <View style={styles.recipeMetaContainer}>
              <Text style={styles.recipeTime}>15-20 min</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>4.5</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.recipeCard}
            onPress={() => handleRecipePress('2')}
          >
            <View style={styles.recipeIconContainer}>
              <Ionicons name="restaurant-outline" size={40} color="#000" />
            </View>
            <Text style={styles.recipeTitle}>Pasta</Text>
            <View style={styles.recipeMetaContainer}>
              <Text style={styles.recipeTime}>15-20</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Surprise Me Button */}
        <TouchableOpacity style={styles.surpriseButton}>
          <Ionicons name="gift-outline" size={20} color="#FFFFFF" style={styles.surpriseIcon} />
          <Text style={styles.surpriseText}>Surprise Me</Text>
          <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" style={styles.surpriseIcon} />
        </TouchableOpacity>
        
        {/* Recommended Section */}
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('recommended')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Recommended recipes will go here */}
        </View>
      </ScrollView>
      
      {/* Custom Bottom Tab Bar */}
      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  greetingContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  greeting: {
    ...typography.heading1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBackground,
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.heading2,
    color: colors.text,
  },
  seeAll: {
    ...typography.button,
    color: colors.primary,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: colors.backgroundAlt,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeCategory: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    ...typography.button,
    color: colors.text,
  },
  activeCategoryText: {
    ...typography.button,
    color: colors.white,
  },
  recipesContainer: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  recipeCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  recipeIconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  recipeTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratingContainer: {
    backgroundColor: colors.success,
    borderRadius: 4,
    padding: 4,
  },
  rating: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  surpriseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F38181',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  surpriseIcon: {
    marginHorizontal: 8,
  },
  surpriseText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  recommendedSection: {
    marginBottom: 20,
  },
});

export default HomeScreen; 