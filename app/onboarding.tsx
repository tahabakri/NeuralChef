import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import WelcomeStep from '@/components/onboarding/WelcomeStep';
import PermissionsStep from '@/components/onboarding/PermissionsStep';
import StylePreferencesStep from '@/components/onboarding/StylePreferencesStep';
import TutorialStep from '@/components/onboarding/TutorialStep';
import { useOnboardingStore } from '@/stores/onboardingStore';
import colors from '@/constants/colors';

const OnboardingScreen = () => {
  const router = useRouter();
  const { setOnboardingComplete } = useOnboardingStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Define base steps
  const baseSteps = [
    { name: 'Welcome', component: WelcomeStep, props: {} },
    { name: 'Permissions', component: PermissionsStep, props: {} },
    { name: 'Style', component: StylePreferencesStep, props: {} },
  ];

  // Define tutorial sub-pages
  const tutorialSubPages = [
    { name: 'TutorialPage1', tutorialSubStep: 1 },
    { name: 'TutorialPage2', tutorialSubStep: 2 },
    { name: 'TutorialPage3', tutorialSubStep: 3 },
    { name: 'TutorialPage4', tutorialSubStep: 4 },
  ];

  // Create steps for each tutorial page
  const tutorialSteps = tutorialSubPages.map(tp => ({
    name: tp.name,
    component: TutorialStep,
    props: { step: tp.tutorialSubStep } // Prop for TutorialStep's internal page
  }));

  // Combine all steps
  const steps = [...baseSteps, ...tutorialSteps];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      setOnboardingComplete(true);
      router.replace('/(tabs)');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Onboarding complete (skipped)
    setOnboardingComplete(true);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <CurrentStepComponent
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          stepIndex={currentStep}
          totalSteps={steps.length}
          isLastStep={currentStep === steps.length - 1}
          {...steps[currentStep].props} // Pass specific props for the current step
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Or your preferred onboarding background color
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreen;
