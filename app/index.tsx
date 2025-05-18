import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useOnboardingStore } from '@/stores/onboardingStore';
import colors from '@/constants/colors';

export default function Index() {
  const { onboardingComplete } = useOnboardingStore();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Small delay to ensure store is loaded correctly
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  // Redirect based on onboarding completion status
  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }
  
  // If onboarding is completed, redirect to the input screen
  return <Redirect href="/input" />;
}
