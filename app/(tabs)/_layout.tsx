import React from "react";
import { Tabs } from "expo-router";
import { View, Platform, Dimensions, StyleSheet } from "react-native";
import { Home, Bookmark, History, Settings } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useRecipeStore } from "@/stores/recipeStore";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : 64;
const TAB_ICON_SIZE = 24;

// Badge component for notifications
function NotificationBadge() {
  const hasNewRecipe = useRecipeStore(state => state.hasNewRecipe);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  
  React.useEffect(() => {
    if (hasNewRecipe) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [hasNewRecipe]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }]
    };
  });
  
  if (!hasNewRecipe) return null;
  
  return (
    <Animated.View 
      style={[{
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: colors.error,
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'white',
        zIndex: 10,
      }, animatedStyle]}
    />
  );
}

// Tab Icon Component with animations
function TabIcon({ 
  icon: Icon, 
  focused, 
  color,
  showBadge = false,
  accessibilityLabel
}: { 
  icon: typeof Home,
  focused: boolean, 
  color: string,
  showBadge?: boolean,
  accessibilityLabel: string
}) {
  // More efficient animation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ 
        scale: withTiming(focused ? 1.1 : 1, {
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        })
      }],
      opacity: withTiming(focused ? 1 : 0.7, { 
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      })
    };
  }, [focused]);
  
  return (
    <Animated.View 
      style={[
        { 
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          height: TAB_ICON_SIZE,
          width: TAB_ICON_SIZE,
        }, 
        animatedStyle
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      <Icon size={TAB_ICON_SIZE} color={color} />
      {showBadge && <NotificationBadge />}
    </Animated.View>
  );
}

// Active tab indicator
function ActiveIndicator({ focused }: { focused: boolean }) {
  const width = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  React.useEffect(() => {
    if (focused) {
      width.value = withTiming(24, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      width.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [focused]);
  
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      opacity: opacity.value
    };
  });
  
  return (
    <Animated.View
      style={[
        {
          height: 3,
          backgroundColor: colors.tabBarActiveIndicator,
          borderRadius: 1.5,
          marginTop: 4,
        },
        indicatorStyle
      ]}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}