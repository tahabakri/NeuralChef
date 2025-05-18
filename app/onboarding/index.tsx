import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';

import WelcomeStep from '@/components/onboarding/WelcomeStep';
import PermissionsStep from '@/components/onboarding/PermissionsStep';
import StylePreferencesStep from '@/components/onboarding/StylePreferencesStep';
import TutorialStep from '@/components/onboarding/TutorialStep';
import AuthModal from '@/components/AuthModal';
import { useOnboardingStore } from '@/stores/onboardingStore';

import colors from '@/constants/colors';

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { setOnboardingComplete } = useOnboardingStore();
  
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  
  // Steps in the onboarding flow
  const steps = [
    { id: 'welcome', component: WelcomeStep },
    { id: 'permissions', component: PermissionsStep },
    { id: 'preferences', component: StylePreferencesStep },
    { id: 'tutorial-1', component: (props) => <TutorialStep {...props} step={1} /> },
    { id: 'tutorial-2', component: (props) => <TutorialStep {...props} step={2} /> },
    { id: 'tutorial-3', component: (props) => <TutorialStep {...props} step={3} /> },
    { id: 'tutorial-4', component: (props) => <TutorialStep {...props} step={4} /> },
  ];
  
  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }]
    };
  });
  
  const nextStep = () => {
    // Animate out with a simplified approach to avoid potential issues
    opacity.value = 0;
    translateX.value = -50;
    
    // Use setTimeout to ensure the UI thread isn't blocked
    setTimeout(() => {
      // Update step
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        completeOnboarding();
      }
      
      // Reset position for incoming animation
      translateX.value = 50;
      
      // Use requestAnimationFrame to ensure the position change has been applied
      requestAnimationFrame(() => {
        // Animate in
        opacity.value = withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) });
        translateX.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
      });
    }, 200);
  };
  
  const previousStep = () => {
    if (currentStep > 0) {
      // Animate out with a simplified approach
      opacity.value = 0;
      translateX.value = 50;
      
      // Use setTimeout to ensure the UI thread isn't blocked
      setTimeout(() => {
        // Update step
        setCurrentStep(currentStep - 1);
        
        // Reset position for incoming animation
        translateX.value = -50;
        
        // Use requestAnimationFrame to ensure the position change has been applied
        requestAnimationFrame(() => {
          // Animate in
          opacity.value = withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) });
          translateX.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
        });
      }, 200);
    }
  };
  
  const completeOnboarding = async () => {
    // Show authentication modal (optional sign-in)
    setShowAuthModal(true);
  };
  
  const finishOnboarding = async () => {
    // Mark onboarding as complete in store and AsyncStorage
    await AsyncStorage.setItem('onboardingComplete', 'true');
    setOnboardingComplete(true);
    
    // Navigate to the main app
    router.replace('/(tabs)');
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View style={[styles.stepContainer, animatedStyles]}>
        <CurrentStepComponent 
          onNext={nextStep}
          onPrevious={previousStep}
          stepIndex={currentStep}
          totalSteps={steps.length}
        />
      </Animated.View>
      
      {showAuthModal && (
        <AuthModal 
          visible={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            finishOnboarding();
          }}
          onSuccess={() => {
            setShowAuthModal(false);
            finishOnboarding();
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  stepContainer: {
    flex: 1,
  },
});

export default OnboardingScreen; 