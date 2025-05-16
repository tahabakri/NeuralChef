/**
 * Typography constants for the AI Recipe Helper app
 * Defines consistent text styles across the app
 */

import { TextStyle } from 'react-native';

// Base font styles using Open Sans
const fontFamily = {
  regular: 'OpenSans-Regular',
  medium: 'OpenSans-Medium', 
  semiBold: 'OpenSans-Semibold',
  bold: 'OpenSans-Bold',
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

// Line heights (adjusting for Open Sans if needed, but starting with existing)
// Open Sans generally has good default leading, so existing values might be fine.
// Consider slight adjustments if text looks too cramped or too spaced out.
const lineHeight = {
  xs: 18, // ~1.5x fontSize
  sm: 21, // ~1.5x fontSize
  md: 24, // ~1.5x fontSize
  lg: 27, // ~1.5x fontSize
  xl: 30, // ~1.5x fontSize
  xxl: 36, // ~1.5x fontSize
  xxxl: 42, // ~1.5x fontSize
  huge: 48, // ~1.5x fontSize 
};

// Font weights (these map to the font file names)
const fontWeight = {
  regular: '400', // Corresponds to OpenSans-Regular
  medium: '500',  // Corresponds to OpenSans-Medium
  semiBold: '600',// Corresponds to OpenSans-Semibold
  bold: '700',    // Corresponds to OpenSans-Bold
};

// Text styles
const typography: Record<string, TextStyle> = {
  // Headings
  title1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.huge,
    fontWeight: fontWeight.bold, // Still useful for systems that might try to infer weight
    lineHeight: lineHeight.huge,
  },
  title2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xxxl, // Adjusted for better spacing with larger title
  },
  title3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.xxl, // Adjusted
  },
  
  // Body text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.lg,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.md,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.sm,
  },
  
  // UI elements
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.md,
  },
  caption: {
    fontFamily: fontFamily.regular, // Regular for better readability at small sizes
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular, // Changed from medium
    lineHeight: lineHeight.xs,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
  },
  
  // Special cases
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.xs,
  },
  pillText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular, // Changed from medium for consistency with bodySmall
    lineHeight: lineHeight.sm,
  },
};

export default typography; 