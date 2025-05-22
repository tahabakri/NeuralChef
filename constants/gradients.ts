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
   * Soft Blue: Calm background gradient for app screens
   */
  softBlue: {
    colors: ["#EBF0F3", "#E5EAEE"],
    direction: directions.topToBottom,
  },
  
  /**
   * Warm Orange: Primary CTA gradient for buttons and active states
   */
  warmOrange: {
    colors: ["#F8985C", "#F17A3A"],
    direction: directions.leftToRight,
  },
  
  /**
   * Calm Blue: Secondary gradient for information sections
   */
  calmBlue: {
    colors: ["#4A9DFF", "#3282E1"],
    direction: directions.leftToRight,
  },
  
  /**
   * Neutral Gray: Subtle gradient for inactive states
   */
  neutralGray: {
    colors: ["#ECEFF1", "#CFD8DC"],
    direction: directions.topToBottom,
  },
  
  /**
   * Sunny Highlight: Accent gradient for featured items
   */
  sunnyHighlight: {
    colors: ["#FFC107", "#F8985C"],
    direction: directions.leftToRight,
  },
  
  /**
   * Soft Green: Success gradient
   */
  softGreen: {
    colors: ["#81C784", "#4CAF50"],
    direction: directions.topToBottom,
  },
  
  /**
   * Sunset Orange: For featured content
   */
  sunsetOrange: {
    colors: ["#F8985C", "#F17A3A"],
    direction: directions.topLeftToBottomRight,
  },

  /**
   * Sky Blue: For calm, passive actions
   */
  skyBlue: {
    colors: ["#8DC2FF", "#4A9DFF"],
    direction: directions.leftToRight,
  },

  /**
   * Light Gray: For disabled states
   */
  lightGray: {
    colors: ["#F5F7FA", "#ECEFF1"],
    direction: directions.topToBottom,
  },
  
  /**
   * App Background: Main app background
   */
  appBackground: {
    colors: ["#EBF0F3", "#E5EAEE"],
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