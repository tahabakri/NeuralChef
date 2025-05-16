/**
 * Spacing constants for the AI Recipe Helper app
 * Defines consistent spacing and layout dimensions across the app
 * 
 * Uses a 4-point scale (multiples of 4) for consistency:
 * - xs: 4px
 * - sm: 8px
 * - md: 12px
 * - lg: 16px
 * - xl: 20px
 * - xxl: 24px
 * - xxxl: 32px
 * - huge: 40px
 */

// Base spacing unit
const BASE = 4;

// Spacing values
const spacing = {
  // Core spacings
  xs: BASE, // 4
  sm: BASE * 2, // 8
  md: BASE * 3, // 12
  lg: BASE * 4, // 16
  xl: BASE * 5, // 20
  xxl: BASE * 6, // 24
  xxxl: BASE * 8, // 32
  huge: BASE * 10, // 40
  
  // Component specific spacings
  buttonHorizontal: BASE * 4, // 16
  buttonVertical: BASE * 3, // 12
  cardPadding: BASE * 4, // 16
  sectionGap: BASE * 6, // 24
  inputPadding: BASE * 3, // 12
  screenPadding: BASE * 4, // 16
  listItemGap: BASE * 4, // 16
  iconSize: {
    small: BASE * 4, // 16
    medium: BASE * 5, // 20
    large: BASE * 6, // 24,
    xlarge: BASE * 8, // 32
  },
  
  // Layout dimensions
  borderRadius: {
    sm: BASE, // 4
    md: BASE * 2, // 8
    lg: BASE * 3, // 12
    xl: BASE * 4, // 16
    pill: BASE * 12, // 48 - for pill shaped buttons
  },
  
  // Border width
  borderWidth: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
};

export default spacing; 