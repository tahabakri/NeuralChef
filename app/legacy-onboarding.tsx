// This file will be renamed to legacy-onboarding.tsx to avoid conflict with app/onboarding/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  FlatList, 
  Dimensions, 
  Animated, 
  TouchableOpacity, 
  Text,
  BackHandler
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import colors from '@/constants/colors';
import { useOnboardingStore } from '@/stores/onboardingStore';

// Import step components
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import PermissionsStep from '@/components/onboarding/PermissionsStep';
import StylePreferencesStep from '@/components/onboarding/StylePreferencesStep';
import TutorialStep from '@/components/onboarding/TutorialStep';
import AuthModal from '@/components/AuthModal';
import WelcomeScreen from '@/components/WelcomeScreen';

// Get screen dimensions
const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboardingStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Progress dots animation
  const dotPosition = Animated.divide(scrollX, width);
  
  // Define the steps for onboarding
  const steps = [
    { id: 'welcome', component: WelcomeStep },
    { id: 'permissions', component: PermissionsStep },
    { id: 'preferences', component: StylePreferencesStep },
    { id: 'tutorial', component: TutorialStep },
  ];

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showWelcomeScreen) {
        return true; // Prevent going back from initial welcome screen
      } else if (currentStep > 0) {
        goToPreviousStep();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [currentStep, showWelcomeScreen]);

  // Start the onboarding process after welcome screen
  const handleWelcomeComplete = () => {
    setShowWelcomeScreen(false);
  };

  // Navigate to the next step
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentStep + 1,
        animated: true,
      });
      setCurrentStep(currentStep + 1);
    } else {
      // We've reached the end of onboarding
      handleOnboardingComplete();
    }
  };

  // Navigate to the previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentStep - 1,
        animated: true,
      });
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    // Show auth modal for optional sign-in
    setShowAuthModal(true);
  };

  // Continue to app after authentication is handled
  const handleAuthComplete = (didSignIn: boolean) => {
    setShowAuthModal(false);
    
    // Mark onboarding as complete in storage
    completeOnboarding();
    
    // Navigate to the main app (home screen)
    router.replace('/');
  };

  // Skip authentication
  const handleSkipAuth = () => {
    setShowAuthModal(false);
    
    // Mark onboarding as complete
    completeOnboarding();
    
    // Navigate to main app
    router.replace('/');
  };

  // Render individual step
  const renderStep = ({ item, index }: { item: typeof steps[0], index: number }) => {
    const Component = item.component;
    
    return (
      <View style={styles.stepContainer}>
        <Component
          onNext={goToNextStep}
          onBack={index > 0 ? goToPreviousStep : undefined}
          isLastStep={index === steps.length - 1}
        />
      </View>
    );
  };

  // Show welcome screen as the first thing users see
  if (showWelcomeScreen) {
    return (
      <WelcomeScreen onGetStarted={handleWelcomeComplete} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderStep}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
      
      {/* Progress indicator dots */}
      <View style={styles.paginationContainer}>
        {steps.map((_, i) => {
          const opacity = dotPosition.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          const scale = dotPosition.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={`dot-${i}`}
              style={[
                styles.paginationDot,
                {
                  opacity,
                  transform: [{ scale }],
                  backgroundColor: i <= currentStep ? colors.primary : colors.textTertiary,
                },
              ]}
            />
          );
        })}
      </View>
      
      {/* Skip button */}
      {currentStep < steps.length - 1 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            setCurrentStep(steps.length - 1);
            flatListRef.current?.scrollToIndex({
              index: steps.length - 1,
              animated: true,
            });
          }}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}
      
      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onComplete={handleAuthComplete}
        onSkip={handleSkipAuth}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepContainer: {
    width,
    flex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
  },
  skipButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
}); 