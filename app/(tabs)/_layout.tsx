import React from "react";
import { Tabs } from "expo-router";
import { ChefHat, BookOpen } from 'lucide-react-native';
import colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Create Recipe",
          tabBarIcon: ({ color }) => <ChefHat size={24} color={color} />,
          tabBarLabel: "Create",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="recipe"
        options={{
          title: "Your Recipe",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
          tabBarLabel: "Recipe",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}