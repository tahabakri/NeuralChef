import { Ionicons } from '@expo/vector-icons';

// Dietary Profiles
export const dietaryProfiles = [
  { id: 'noRestrictions', label: 'No Restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'keto', label: 'Keto' },
  { id: 'lowCarb', label: 'Low-Carb' },
  { id: 'glutenFree', label: 'Gluten-Free' },
  { id: 'dairyFree', label: 'Dairy-Free' },
];

// Common Allergies
export const commonAllergies = [
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'treeNuts', label: 'Tree Nuts' },
  { id: 'milk', label: 'Milk' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'wheat', label: 'Wheat' },
  { id: 'soy', label: 'Soy' },
  { id: 'sesame', label: 'Sesame' },
];

// Spice Levels
export const spiceLevels = [
  { id: 'none', label: 'No Spice' },
  { id: 'mild', label: 'Mild' },
  { id: 'medium', label: 'Medium' },
  { id: 'spicy', label: 'Spicy' },
  { id: 'extraSpicy', label: 'Extra Spicy' },
];

// Cooking Times
export const cookingTimes = [
  { id: '0', label: 'No Limit' },
  { id: '30', label: '<30 min' },
  { id: '60', label: '<60 min' },
  { id: '90', label: '<90 min' },
];

// Portion Sizes
export const portionSizes = [
  { id: 'single', label: 'Single', iconName: 'person-outline' as const },
  { id: 'couple', label: 'Couple (2)', iconName: 'people-outline' as const },
  { id: 'family', label: 'Family (3-4)', iconName: 'people-circle-outline' as const },
  { id: 'large', label: 'Large (5+)', iconName: 'apps-outline' as const },
];

// Micro Preferences
export const microPreferences = [
  { id: 'highProtein', label: 'High Protein' },
  { id: 'lowFat', label: 'Low Fat' },
  { id: 'lowSodium', label: 'Low Sodium' },
  { id: 'highFiber', label: 'High Fiber' },
  { id: 'lowSugar', label: 'Low Sugar' },
];

// Cooking Goals
export const cookingGoals = [
  { id: 'mealPrep', label: 'Meal Prep' },
  { id: 'quickWeeknight', label: 'Quick Weeknight Meals' },
  { id: 'weightLoss', label: 'Weight Loss' },
  { id: 'newTechniques', label: 'Learn New Techniques' },
  { id: 'impressGuests', label: 'Impress Guests' },
];

// Cuisine Types
export const cuisineTypes = [
  { id: 'italian', label: 'Italian' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'indian', label: 'Indian' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'thai', label: 'Thai' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'american', label: 'American' },
  { id: 'french', label: 'French' },
  { id: 'korean', label: 'Korean' },
  { id: 'vietnamese', label: 'Vietnamese' },
  { id: 'middleEastern', label: 'Middle Eastern' },
];

// Medical Conditions
export const medicalConditions = [
  { id: 'Diabetes', label: 'Diabetes' },
  { id: 'Hypertension', label: 'Hypertension' },
  { id: 'Celiac Disease', label: 'Celiac Disease' },
  { id: 'High Cholesterol', label: 'High Cholesterol' },
  { id: 'IBS', label: 'IBS (Irritable Bowel Syndrome)' }, // Made label more descriptive
]; 