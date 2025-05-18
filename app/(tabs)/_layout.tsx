import React from "react";
import { Tabs } from "expo-router";
import { View, Platform, Dimensions, StyleSheet } from "react-native";
import { Home, Bookmark, History, Settings, Flame } from 'lucide-react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
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
      accessibilityLabel="New recipe notification"
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
      accessibilityLabel={focused ? "Active tab indicator" : ""}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 + insets.bottom : 56;
  
  const hasNewRecipe = useRecipeStore(state => state.hasNewRecipe);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          height: TAB_BAR_HEIGHT,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'OpenSans-Medium',
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={Home} 
              focused={focused} 
              color={color} 
              accessibilityLabel="Home tab"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="popular"
        options={{
          title: 'Popular',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={Flame} 
              focused={focused} 
              color={color} 
              accessibilityLabel="Popular recipes tab"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={Bookmark} 
              focused={focused} 
              color={color}
              showBadge={hasNewRecipe}
              accessibilityLabel="Saved recipes tab"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={History} 
              focused={focused} 
              color={color} 
              accessibilityLabel="History tab"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={Settings} 
              focused={focused} 
              color={color} 
              accessibilityLabel="Settings tab"
            />
          ),
        }}
      />
    </Tabs>
  );
}