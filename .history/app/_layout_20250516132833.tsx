import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import colors from "@/constants/colors";
import OfflineBanner from "@/components/OfflineBanner";
import ImageCacheProvider from '@/services/ImageCacheManager';

// Import Toast with error handling
let Toast: any;
try {
  Toast = require('react-native-toast-message').default;
} catch (error) {
  console.warn('react-native-toast-message not available');
  Toast = null;
}

import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "OpenSans-Regular": require("../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Medium": require("../assets/fonts/OpenSans-Medium.ttf"),
    "OpenSans-SemiBold": require("../assets/fonts/OpenSans-Semibold.ttf"),
    "OpenSans-Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      // Optionally, throw the error if it's critical, 
      // or handle it by falling back to system fonts.
      // For now, we log it.
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded && !error) { // Also check for error to avoid showing splash screen indefinitely on font error
    return null; // Keep showing splash screen or a loading indicator
  }
  
  // If fonts failed to load, you might want to render a fallback or throw an error.
  // For simplicity here, we proceed, and it will use system fonts if custom ones failed.

  return (
    <ErrorBoundary>
      <ImageCacheProvider>
        <RootLayoutNav />
      </ImageCacheProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTransparent: true,
          headerTintColor: colors.text,
          headerBlurEffect: 'light',
          contentStyle: {
            backgroundColor: 'transparent',
          },
          // Apply default header title font here if needed globally
          // headerTitleStyle: { fontFamily: 'OpenSans-SemiBold' }, 
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ 
          presentation: "modal",
          headerTransparent: true
        }} />
      </Stack>
      {/* Add Toast component only if available */}
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
});
