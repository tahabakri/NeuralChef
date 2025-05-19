import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Text, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import WelcomeStep from '@/components/onboarding/WelcomeStep';
import StylePreferencesStep from '@/components/onboarding/StylePreferencesStep';
import BackArrow from '@/components/BackArrow';
import Button from '@/components/Button';
import TagSelector from '@/components/TagSelector';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Goal options
const COOKING_GOALS = [
  'Cook 3 new recipes this week',
  'Try a new cuisine',
  'Master basic cooking skills',
  'Meal prep for the week',
  'Cook healthier meals',
  'Reduce food waste'
];

const GoalSettingStep = ({ 
  selectedGoal, 
  setSelectedGoal 
}: { 
  selectedGoal: string | null, 
  setSelectedGoal: (goal: string) => void 
}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Set a Cooking Goal</Text>
      <Text style={styles.sectionSubtitle}>What would you like to achieve with Reciptai?</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalOptionsContainer}
      >
        {COOKING_GOALS.map((goal) => (
          <View key={goal} style={styles.goalTagContainer}>
            <TagSelector
              categories={[goal]}
              selectedCategory={selectedGoal}
              onSelectCategory={setSelectedGoal}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { setOnboardingComplete } = useOnboardingStore();
  const { setDietaryPreference } = usePreferencesStore();
  
  // Local state for user selections
  const [selectedDietary, setSelectedDietary] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  
  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleNext = () => {
    // Animate transition
    opacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(-20, { duration: 250 });
    
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      
      // Reset animation values
      opacity.value = 0;
      translateY.value = 20;
      
      // Animate back in
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withTiming(0, { duration: 250 });
    }, 250);
  };
  
  const completeOnboarding = async () => {
    // Save preferences
    if (selectedDietary) {
      // Convert to the proper format expected by the store
      const dietaryFormat = selectedDietary.toLowerCase().replace(/\s/g, '-') as any;
      await setDietaryPreference(dietaryFormat);
    }
    
    // Save goal in AsyncStorage
    if (selectedGoal) {
      await AsyncStorage.setItem('userCookingGoal', selectedGoal);
    }
    
    // Mark onboarding as complete
    await AsyncStorage.setItem('onboardingComplete', 'true');
    setOnboardingComplete(true);
    
    // Navigate to main app
    router.replace('/(tabs)');
  };
  
  // Dietary options for the tag selector
  const dietaryOptions = [
    'All', 'Vegetarian', 'Vegan', 'Gluten-Free', 
    'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb'
  ];
  
  return (
    <LinearGradient
      colors={['#FFF3E0', '#FFE0B2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.header}>
          {currentStep > 0 && (
            <BackArrow onBack={handleBack} />
          )}
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.contentContainer, animatedStyles]}>
            {currentStep === 0 && (
              <>
                <Image
                  source={require('@/assets/images/chef.png')}
                  style={styles.chefImage}
                  resizeMode="contain"
                />
                
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Welcome to Reciptai!</Text>
                  <Text style={styles.subtitle}>Let's get cooking.</Text>
                </View>
                
                <Button 
                  title="Let's Go" 
                  onPress={handleNext}
                  variant="primary"
                  size="large"
                  fullWidth
                />
              </>
            )}
            
            {currentStep === 1 && (
              <>
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                  <Text style={styles.sectionSubtitle}>Select any dietary preferences you have</Text>
                  
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.preferencesContainer}
                  >
                    {dietaryOptions.map((option) => (
                      <View key={option} style={styles.tagContainer}>
                        <TagSelector
                          categories={[option]}
                          selectedCategory={selectedDietary}
                          onSelectCategory={setSelectedDietary}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
                
                <GoalSettingStep
                  selectedGoal={selectedGoal}
                  setSelectedGoal={setSelectedGoal}
                />
                
                <Button 
                  title="Get Started" 
                  onPress={completeOnboarding}
                  variant="primary"
                  size="large"
                  style={{ backgroundColor: '#4CAF50' }}
                  fullWidth
                />
              </>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  chefImage: {
    width: '100%',
    height: 240,
    marginTop: 40,
    marginBottom: 32,
  },
  textContainer: {
    marginBottom: 40,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 18,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  preferencesContainer: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  goalOptionsContainer: {
    paddingHorizontal: 4,
    flexDirection: 'row',
  },
  tagContainer: {
    marginRight: 8,
    marginBottom: 8,
  },
  goalTagContainer: {
    marginRight: 8,
  },
});

export default OnboardingScreen; 