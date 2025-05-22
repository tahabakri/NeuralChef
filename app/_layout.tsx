import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments, usePathname, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import colors from "@/constants/colors";
import gradients from "@/constants/gradients";
import OfflineBanner from "@/components/OfflineBanner";
import ImageCacheProvider from '@/services/ImageCacheManager';
import FeedbackProvider from "@/components/FeedbackSystem";
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from "@/stores/onboardingStore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { validateDeepLink, AppRoutes } from './routes';

// Import utilities for handling missing native modules
// import { mockNetInfo, mockCamera, mockMediaLibrary, mockSpeech } from "@/utils/moduleResolvers";

// Set up mocks for native modules
// try {
//   if (typeof global !== 'undefined') {
//     // @ts-ignore
//     global.nativeModules = global.nativeModules || {};
//     // @ts-ignore
//     global.nativeModules.RNCNetInfo = global.nativeModules.RNCNetInfo || mockNetInfo();
//     // @ts-ignore
//     global.ExpoCamera = global.ExpoCamera || mockCamera();
//     // @ts-ignore
//     global.ExpoMediaLibrary = global.ExpoMediaLibrary || mockMediaLibrary();
//     // @ts-ignore
//     global.ExpoSpeech = global.ExpoSpeech || mockSpeech();
//   }
//   console.log('Successfully set up mock modules');
// } catch (e) {
//   console.error('Error setting up mock modules:', e);
// }

// Import Toast with error handling
let Toast: any;
try {
  Toast = require('react-native-toast-message').default;
} catch (error) {
  console.warn('react-native-toast-message not available');
  Toast = null;
}

import { ErrorBoundary } from "./error-boundary";

// At the top, add a type declaration for global.nativeModules
declare global {
  interface Window {
    nativeModules?: {
      RNCNetInfo?: any;
      ExpoCamera?: any;
      ExpoMediaLibrary?: any;
      ExpoSpeech?: any;
      [key: string]: any;
    };
  }
}

// Configure deep linking
const prefix = Linking.createURL('/');
const config = {
  screens: {
    // Root screens
    '(tabs)': {
      screens: {
        'index': 'home',
        'popular': 'popular',
        'saved': 'saved',
        'history': 'history',
        'settings': 'settings',
      }
    },
    // Standalone recipe screen (for deep links)
    // 'recipe/:id': 'recipe/:id', // Removed as per instructions
  },
};

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
  ignore: ['./routes.ts'],
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const { hasCompletedOnboarding, completeOnboarding } = useOnboardingStore();
  const router = useRouter();
  const initialURLRef = useRef<string | null>(null);

  // Load any resources or data needed
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
  });

  // Setup deep linking handler
  useEffect(() => {
    // Handler for deep links
    const handleDeepLink = (event: { url: string }) => {
      if (!appReady || !fontsLoaded) { // Check for fontsLoaded as well
        // Store the URL to handle after app is ready
        initialURLRef.current = event.url;
        return;
      }
      
      // Handle deep links
      handleURL(event.url);
    };
    
    // Get the initial URL
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        initialURLRef.current = url;
      }
    };
    
    // Setup listeners
    getInitialURL();
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription.remove();
    };
  }, [appReady, fontsLoaded]); // Added fontsLoaded to dependency array
  
  // Function to handle URLs with type safety
  const handleURL = (url: string) => {
    if (!url) return;
    
    // Parse the URL with Expo's URL handling
    const { path } = Linking.parse(url);
    
    if (path) {
      try {
        // Use our route validation function
        const validatedRoute = validateDeepLink(path);
        
        if (validatedRoute) {
          // Type-safe navigation
          router.push({
            pathname: validatedRoute.route as any, // Assert type to resolve mismatch
            params: validatedRoute.params
          });
        } else {
          console.warn('Unknown path from deep link:', path);
        }
      } catch (e) {
        console.warn('Failed to navigate to path:', path, e);
      }
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        // Check if user has completed onboarding
        const onboardingStatus = await AsyncStorage.getItem('onboardingComplete'); // This AsyncStorage key might also need an update if it's tied to the store's state name
        
        // If onboarding was completed in a previous session
        if (onboardingStatus === 'true' && !hasCompletedOnboarding) {
          completeOnboarding();
        }
        
        // Artificial timeout for demonstration purposes, can be removed
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Error loading app data:', e);
      } finally {
        // Regardless of errors, mark app as ready and hide splash screen
        setAppReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [hasCompletedOnboarding, completeOnboarding]);

  useEffect(() => {
    if (appReady && fontsLoaded) { // Added fontsLoaded here
      // Process any stored deep link first
      if (initialURLRef.current) {
        handleURL(initialURLRef.current);
        initialURLRef.current = null;
        return;
      }
      
      // Navigate based on onboarding status
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [appReady, fontsLoaded, hasCompletedOnboarding, router]); // Added fontsLoaded to dependency array

  if (!fontsLoaded || !appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ImageCacheProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <FeedbackProvider>
          <RootLayoutNav />
        </FeedbackProvider>
      </ErrorBoundary>
    </ImageCacheProvider>
  );
}

function RootLayoutNav() {
  const segments = useSegments();
  const pathname = usePathname();
  
  // Determine if we're on a screen that should have the dotted background
  const shouldShowDottedBackground = !pathname.includes("error");

  return (
    <View style={styles.container}>
      {shouldShowDottedBackground && (
        <View style={styles.dottedBackground}>
          {/* Dotted background pattern */}
          {Array.from({ length: 30 }).map((_, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.dotRow}>
              {Array.from({ length: 30 }).map((_, colIndex) => (
                <View key={`dot-${rowIndex}-${colIndex}`} style={styles.dot} />
              ))}
            </View>
          ))}
        </View>
      )}
      
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={styles.background}
      />
      
      <OfflineBanner />
      <Slot />
      {Toast && <Toast />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundGradientStart,
  },
  dottedBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
