import React from "react";
import { Tabs } from "expo-router";
import { View, Platform, Text } from "react-native";
import { ChefHat, BookOpen, HeartIcon } from 'lucide-react-native';
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
        backgroundColor: colors.accent,
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

// Animated tab icon component with enhanced animations
function AnimatedTabIcon({ 
  icon: Icon, 
  focused, 
  color,
  showBadge = false
}: { 
  icon: typeof ChefHat,
  focused: boolean, 
  color: string,
  showBadge?: boolean
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
    <Animated.View style={[animatedStyle, { position: 'relative' }]}>
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
        
        return {
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          headerShown: true,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            height: 60,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#FFFFFF', '#F0F4F8']} // Gradient as requested
              style={{ 
                flex: 1,
                borderTopLeftRadius: 20, 
                borderTopRightRadius: 20,
                overflow: 'hidden',
                ...Platform.select({
                  ios: {
                    shadowColor: colors.shadowDark,
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                  },
                  android: {
                    elevation: 12,
                  }
                })
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          ),
          headerStyle: {
            backgroundColor: colors.backgroundGradientStart,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            ...typography.title3,
            color: colors.text,
          },
          tabBarLabelStyle: {
            ...typography.tabLabel,
            marginTop: 2,
            fontWeight: '600',
          },
          tabBarItemStyle: {
            paddingTop: 4,
          },
          tabBarIcon: ({ color, focused }) => {
            const Icon = route.name === 'index' ? ChefHat : (
              route.name === 'recipe' ? BookOpen : HeartIcon
            );
            return (
              <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <TabItemBackground focused={focused} />
                <AnimatedTabIcon 
                  icon={Icon} 
                  focused={focused} 
                  color={color} 
                  showBadge={showRecipeBadge}
                />
              </View>
            );
          },
        };
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Create Recipe",
          tabBarLabel: "Create",
          tabBarAccessibilityLabel: "Create a new recipe",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="recipe"
        options={{
          title: "Your Recipe",
          tabBarLabel: "Recipe",
          tabBarAccessibilityLabel: "View your recipe",
          headerShown: false,
        }}
        listeners={{
          tabPress: () => {
            // Mark recipes as viewed when the recipe tab is pressed
            useRecipeStore.getState().markRecipeAsViewed();
          },
        }}
      />
    </Tabs>
  );
}