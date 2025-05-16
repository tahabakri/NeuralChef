import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { ChefHat, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import colors from "@/constants/colors";
import typography from "@/constants/typography";

// Animated tab icon component
function AnimatedTabIcon({ 
  icon: Icon, 
  focused, 
  color 
}: { 
  icon: typeof ChefHat,
  focused: boolean, 
  color: string 
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: withTiming(focused ? 1.15 : 1, { 
            duration: 200, 
            easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
          }) 
        }
      ],
      opacity: withTiming(focused ? 1 : 0.7, { 
        duration: 150 
      }),
    };
  }, [focused]);
  
  return (
    <Animated.View style={animatedStyle}>
      <Icon size={24} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={[colors.tabBarBackgroundGradientStart, colors.tabBarBackgroundGradientEnd]}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
        headerStyle: {
          backgroundColor: colors.card,
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
        },
        tabBarIcon: ({ color, focused }) => {
          const Icon = route.name === 'index' ? ChefHat : BookOpen;
          return <AnimatedTabIcon icon={Icon} focused={focused} color={color} />;
        },
      })}
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
      />
    </Tabs>
  );
}