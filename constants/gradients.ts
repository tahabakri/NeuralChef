/**
 * Gradient definitions for consistent styling across the app
 * Each gradient includes colors, direction, and optional opacity settings
 */

import { ViewStyle } from "react-native";

export type GradientDirection = {
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export type GradientConfig = {
  colors: string[];
  direction: GradientDirection;
  locations?: number[];
};

export const directions = {
  topToBottom: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  bottomToTop: { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } },
  leftToRight: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
  rightToLeft: { start: { x: 1, y: 0 }, end: { x: 0, y: 0 } },
  topLeftToBottomRight: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  bottomRightToTopLeft: { start: { x: 1, y: 1 }, end: { x: 0, y: 0 } },
  topRightToBottomLeft: { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
  bottomLeftToTopRight: { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
};

const gradients = {
  /**
   * Soft Peach: Warm welcome gradient for splash screen and recipe cards
   */
  softPeach: {
    colors: ["#FFF3E0", "#FFE0B2"],
    direction: directions.topToBottom,
  },
  
  /**
   * Sunrise Orange: Vibrant orange gradient for primary CTAs
   */
  sunriseOrange: {
    colors: ["#FFA726", "#FB8C00"],
    direction: directions.leftToRight,
  },
  
  /**
   * Fresh Green: Nature-inspired gradient for confirmation actions
   */
  freshGreen: {
    colors: ["#A5D6A7", "#81C784"],
    direction: directions.leftToRight,
  },
  
  /**
   * Warm Cocoa: Rich brown gradient for headers/footers
   */
  warmCocoa: {
    colors: ["#5D4037", "#3E2723"],
    direction: directions.topToBottom,
  },
  
  /**
   * Citrus Pop: Vibrant gradient for section dividers and highlights
   */
  citrusPop: {
    colors: ["#FCE38A", "#F38181"],
    direction: directions.leftToRight,
  },
  
  /**
   * Soft Blue: Calming blue gradient for information sections
   */
  softBlue: {
    colors: ["#BBDEFB", "#90CAF9"],
    direction: directions.topToBottom,
  },
  
  /**
   * Warm Sunset: For featured recipes
   */
  warmSunset: {
    colors: ["#FFCC80", "#FF8A65"],
    direction: directions.topLeftToBottomRight,
  },

  /**
   * Cool Mint: For optional actions
   */
  coolMint: {
    colors: ["#B2DFDB", "#80CBC4"],
    direction: directions.leftToRight,
  },

  /**
   * Subtle Gray: For disabled states
   */
  subtleGray: {
    colors: ["#ECEFF1", "#CFD8DC"],
    direction: directions.topToBottom,
  },
  
  /**
   * App Background: Main app background
   */
  appBackground: {
    colors: ["#FFFFFF", "#F9F9F9"],
    direction: directions.topToBottom,
  },
};

/**
 * Helper function to apply a gradient with opacity
 */
export function withOpacity(gradient: GradientConfig, opacity: number): GradientConfig {
  return {
    ...gradient,
    colors: gradient.colors.map((color) => {
      // For hex colors, we convert to rgba
      if (color.startsWith('#')) {
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      // For rgba colors, we just replace the alpha
      return color.replace(/rgba?\((.+?),\s*[\d.]+\)/, `rgba($1, ${opacity})`);
    }),
  };
}

export default gradients; 