import React from "react";
import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { ChefHat, BookOpen, HeartIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  Easing, 
  withSequence,
  withDelay,
  interpolateColor
} from 'react-native-reanimated';
import colors from "@/constants/colors";
import typography from "@/constants/typography";

// Animated tab icon component with enhanced animations
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
    <Animated.View style={animatedStyle}>
      <Icon size={24} color={color} />
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
      screenOptions={({ route }) => ({
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
            colors={[colors.tabBarBackgroundGradientStart, colors.tabBarBackgroundGradientEnd]}
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
              <AnimatedTabIcon icon={Icon} focused={focused} color={color} />
            </View>
          );
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