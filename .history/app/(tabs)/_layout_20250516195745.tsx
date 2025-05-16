import React from "react";
import { Tabs } from "expo-router";
import { View, Platform, Text } from "react-native";
import { ChefHat, BookOpen, HeartIcon, TrendingUp, Settings, History, Bookmark } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  Easing, 
  withSequence,
  withDelay,
  interpolateColor,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useRecipeStore } from "@/stores/recipeStore";
import { useFocusEffect } from "expo-router";

// Badge component for new recipe notification
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
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'white',
        zIndex: 10,
      }, animatedStyle]}
    />
  );
}

// Function to get tab label based on route name
function getTabLabel(routeName: string): string {
  switch (routeName) {
    case 'index':
      return 'Create';
    case 'recipe':
      return 'Recipe';
    case 'history':
      return 'History';
    case 'saved':
      return 'Saved';
    case 'popular':
      return 'Popular';
    case 'settings':
      return 'Settings';
    default:
      return routeName.charAt(0).toUpperCase() + routeName.slice(1);
  }
}

// Function to get tab accessibility label
function getAccessibilityLabel(routeName: string): string {
  switch (routeName) {
    case 'index':
      return 'Create new recipes';
    case 'recipe':
      return 'View current recipe';
    case 'history':
      return 'Browse your recipe history';
    case 'saved':
      return 'View your saved recipes';
    case 'popular':
      return 'Browse popular recipes';
    case 'settings':
      return 'Customize app settings and preferences';
    default:
      return `Go to ${routeName} tab`;
  }
}

// Animated tab icon component with enhanced animations
function AnimatedTabIcon({ 
  icon: Icon, 
  focused, 
  color,
  showBadge = false,
  accessibilityLabel
}: { 
  icon: typeof ChefHat,
  focused: boolean, 
  color: string,
  showBadge?: boolean,
  accessibilityLabel: string
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: withSequence(
            withTiming(focused ? 1.2 : 1, { duration: 150 }),
            withDelay(50, withTiming(focused ? 1.1 : 1, { duration: 150 }))
          )
        }
      ],
      opacity: withTiming(focused ? 1 : 0.7, { 
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      }),
    };
  }, [focused]);
  
  return (
    <Animated.View 
      style={[animatedStyle, { position: 'relative' }]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      <Icon size={24} color={color} />
      {showBadge && <NotificationBadge />}
    </Animated.View>
  );
}

// Animated tab background for each tab item
function TabItemBackground({ focused }: { focused: boolean }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        focused ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
        { duration: 200 }
      ),
      opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
    };
  }, [focused]);

  return focused ? (
    <Animated.View 
      style={[
        {
          position: 'absolute',
          top: 8,
          left: 8, 
          right: 8,
          bottom: 8,
          borderRadius: 12,
        },
        animatedStyle
      ]}
    />
  ) : null;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const showRecipeBadge = route.name === 'recipe' && useRecipeStore(state => state.hasNewRecipe);
        const tabLabel = getTabLabel(route.name);
        const accessibilityLabel = getAccessibilityLabel(route.name);
        
        return {
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          headerShown: false,
          tabBarLabel: tabLabel,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            height: 64,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#FFFFFF', '#F0F4F8']}
              style={{ 
                flex: 1,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
          ),
          tabBarLabelStyle: {
            ...typography.caption,
            fontWeight: '500',
            fontSize: 11,
            letterSpacing: 0.3,
          },
        };
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabItemBackground focused={focused} />
              <AnimatedTabIcon 
                icon={ChefHat} 
                focused={focused} 
                color={color}
                accessibilityLabel="Create tab"
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabItemBackground focused={focused} />
              <AnimatedTabIcon 
                icon={History} 
                focused={focused} 
                color={color}
                accessibilityLabel="History tab"
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabItemBackground focused={focused} />
              <AnimatedTabIcon 
                icon={Bookmark} 
                focused={focused} 
                color={color}
                accessibilityLabel="Saved tab"
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="recipe"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabItemBackground focused={focused} />
              <AnimatedTabIcon 
                icon={BookOpen} 
                focused={focused} 
                color={color}
                showBadge={showRecipeBadge}
                accessibilityLabel="Recipe tab"
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabItemBackground focused={focused} />
              <AnimatedTabIcon 
                icon={Settings} 
                focused={focused} 
                color={color}
                accessibilityLabel="Settings tab"
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}