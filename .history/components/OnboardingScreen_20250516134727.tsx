import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  useWindowDimensions
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  withSpring
} from 'react-native-reanimated';

import LottieIllustration from './LottieIllustration';
import Button from './Button';
import colors from '@/constants/colors';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  animation: 'welcome' | 'empty-state' | 'recipe-success' | 'shopping-list';
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to ReciptAI',
    description: 'Your personal AI-powered recipe assistant for delicious meals tailored to your preferences.',
    animation: 'welcome'
  },
  {
    id: '2',
    title: 'Create Custom Recipes',
    description: 'Generate personalized recipes based on ingredients you have or dishes you want to make.',
    animation: 'recipe-success'
  },
  {
    id: '3',
    title: 'Save Your Favorites',
    description: 'Build your personal recipe collection and access it anytime, even offline.',
    animation: 'empty-state'
  },
  {
    id: '4',
    title: 'Smart Shopping Lists',
    description: 'Generate shopping lists from your recipes with just one tap.',
    animation: 'shopping-list'
  }
];

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);
  
  const isLastSlide = activeIndex === slides.length - 1;
  
  const goToNextSlide = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true
      });
      setActiveIndex(activeIndex + 1);
      progress.value = withTiming((activeIndex + 1) / (slides.length - 1), {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
    } else {
      completeOnboarding();
    }
  };
  
  const goToPrevSlide = () => {
    if (activeIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex - 1,
        animated: true
      });
      setActiveIndex(activeIndex - 1);
      progress.value = withTiming((activeIndex - 1) / (slides.length - 1), {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
    }
  };
  
  const completeOnboarding = () => {
    onComplete();
  };
  
  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null) {
        setActiveIndex(index);
        progress.value = withTiming(index / (slides.length - 1), {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        });
      }
    }
  }).current;
  
  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.animationContainer, { height: height * 0.4 }]}>
        <LottieIllustration
          type={item.animation}
          size={Math.min(width * 0.7, 300)}
          autoPlay={true}
          loop={true}
          speed={0.7}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
  
  const progressBarAnim = useAnimatedStyle(() => {
    return {
      width: `${(progress.value * 100)}%`,
      backgroundColor: interpolate(
        progress.value,
        [0, 0.5, 1],
        [colors.primary, colors.primaryAlt, colors.primaryDark]
      )
    };
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressBar, progressBarAnim]} />
        </View>
        <Text style={styles.progressText}>{activeIndex + 1}/{slides.length}</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
      
      <View style={styles.navigationContainer}>
        {activeIndex > 0 ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPrevSlide}
            accessibilityLabel="Previous slide"
            accessibilityHint="Go to the previous onboarding step"
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}
        
        <Button
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={goToNextSlide}
          variant="primary"
          style={styles.nextButton}
          icon={isLastSlide ? undefined : ArrowRight}
          iconPosition="right"
        />
        
        {!isLastSlide ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNextSlide}
            accessibilityLabel="Next slide"
            accessibilityHint="Go to the next onboarding step"
          >
            <ChevronRight size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}
      </View>
      
      {!isLastSlide && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={completeOnboarding}
          accessibilityLabel="Skip onboarding"
          accessibilityHint="Skip the rest of the onboarding steps"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  animationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonPlaceholder: {
    width: 44,
  },
  nextButton: {
    minWidth: 120,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen; 