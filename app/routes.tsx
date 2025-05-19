/**
 * Type definitions for routes in the application
 * This helps with type-safe navigation and deep linking
 */

import React from 'react';
import { View, Text } from 'react-native';

/**
 * Type definition for all routes in the application
 * These must match exactly what Expo Router expects
 */
export type AppRoutes = {
  "/": undefined;
  "/onboarding": undefined;
  "/legacy-onboarding": undefined;
  "/(tabs)": undefined;
  "/history": undefined;
  "/saved": undefined;
  "/settings": undefined;
  "/popular": undefined;
  "/recipe/[id]": { id: string };
  "/modal": undefined;
  "/input": undefined;
  "/generate": undefined;
  "/search": undefined;
  "/preferences": undefined;
  "/profile": undefined;
};

/**
 * Helper type for extracting params from a route
 */
export type RouteParams<T extends keyof AppRoutes> = AppRoutes[T];

/**
 * Custom function to generate path with parameters
 * Replaces import from expo-router/build/link/path which was causing issues
 */
export function createPath<T extends keyof AppRoutes>(
  route: T,
  params: RouteParams<T>
): string {
  if (params === undefined) {
    return route as string;
  }
  
  // Simple path parameter replacement
  let path = route as string;
  Object.entries(params as Record<string, string>).forEach(([key, value]) => {
    path = path.replace(`[${key}]`, value);
  });
  
  return path;
}

/**
 * Type-safe wrapper for handling deep links
 * @param path The path from the deep link
 * @returns A validated route object or null if invalid
 */
export function validateDeepLink(path: string): { route: keyof AppRoutes; params: any } | null {
  // Handle recipe detail links
  if (path.match(/^\/recipe\/([^\/]+)$/)) {
    const id = path.split('/').pop();
    return {
      route: "/recipe/[id]",
      params: { id }
    };
  }

  // Handle tab routes (match exactly what Expo Router expects)
  const validRoutes: (keyof AppRoutes)[] = [
    "/",
    "/onboarding",
    "/(tabs)",
    "/(tabs)/index",
    "/(tabs)/popular",
    "/(tabs)/saved",
    "/(tabs)/history",
    "/(tabs)/settings",
    "/modal",
    "/input",
    "/generate",
    "/search",
    "/preferences",
    "/profile"
  ];

  if (validRoutes.includes(path as keyof AppRoutes)) {
    return {
      route: path as keyof AppRoutes,
      params: undefined
    };
  }

  // Handle invalid paths
  return null;
}

/**
 * This is a placeholder component to satisfy Expo Router's requirement
 * for a default export. This route isn't meant to be navigated to directly.
 */
export default function RoutesDocumentation() {
  const validRoutes = [
    "/",
    "/onboarding",
    "/(tabs)",
    "/(tabs)/index",
    "/(tabs)/popular",
    "/(tabs)/saved",
    "/(tabs)/history",
    "/(tabs)/settings",
    "/modal",
    "/input",
    "/generate",
    "/search",
    "/preferences",
    "/profile"
  ];
  
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Routes Documentation</Text>
      <Text>This is a documentation page for app routes.</Text>
      <Text style={{ marginTop: 20 }}>Available routes:</Text>
      {validRoutes.map((route) => (
        <Text key={route}>{route}</Text>
      ))}
    </View>
  );
} 