/**
 * Typography constants for the AI Recipe Helper app
 * Defines consistent text styles across the app
 */

import { TextStyle } from 'react-native';

// Base font styles
const fontFamily = {
  regular: 'System',
  medium: 'System', 
  semiBold: 'System',
  bold: 'System',
};

// Font sizes
const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
};

// Line heights
const lineHeight = {
  xs: 18,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 30,
  xxl: 36,
  xxxl: 42,
};

// Font weights
const fontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Text styles
const typography: Record<string, TextStyle> = {
  // Headings
  title1: {
    fontSize: fontSize.huge,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xxxl,
  },
  title2: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xxl,
  },
  title3: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.xl,
  },
  
  // Body text
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.lg,
  },
  bodyMedium: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.md,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.sm,
  },
  
  // UI elements
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.md,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
  },
  
  // Special cases
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.xs,
  },
  pillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
  },
  error: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
  },
};

export default typography; 