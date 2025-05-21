/**
 * Gradient definitions for consistent styling across the Yumio app
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
    colors: ["#FFF3E0", "#F9E4C6"],
    direction: directions.topToBottom,
  },
  
  /**
   * Yumio Orange: Vibrant orange gradient for primary CTAs from logo
   */
  yumioOrange: {
    colors: ["#F4A261", "#E67E22"],
    direction: directions.leftToRight,
  },
  
  /**
   * Chef Green: Nature-inspired gradient for confirmation actions from logo
   */
  chefGreen: {
    colors: ["#81C784", "#2E7D32"],
    direction: directions.leftToRight,
  },
  
  /**
   * Warm Cocoa: Rich brown gradient for headers/footers matching text
   */
  warmCocoa: {
    colors: ["#7D5A50", "#5C4033"],
    direction: directions.topToBottom,
  },
  
  /**
   * Citrus Pop: Vibrant gradient for section dividers and highlights
   */
  citrusPop: {
    colors: ["#FFC107", "#F4A261"],
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
    colors: ["#F4A261", "#FF8A65"],
    direction: directions.topLeftToBottomRight,
  },

  /**
   * Cool Mint: For optional actions
   */
  coolMint: {
    colors: ["#B2DFDB", "#81C784"],
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
    colors: ["#FFF3E0", "#F9E4C6"],
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