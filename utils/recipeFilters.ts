import { Recipe } from '@/services/recipeService';
import { 
  DietaryPreference, 
  SpiceLevel, 
  MicroPreference 
} from '@/stores/preferencesStore';

export interface FilterOptions {
  dietaryPreference?: DietaryPreference;
  allergies?: string[];
  dislikedIngredients?: string[];
  spiceLevel?: SpiceLevel;
  cuisineTypes?: string[];
  cookingTimeLimit?: number;
  maxCalories?: number;
  microPreferences?: MicroPreference[];
}

export function filterRecipesByPreferences(
  recipes: Recipe[],
  options: FilterOptions
): Recipe[] {
  if (!recipes || recipes.length === 0) {
    return [];
  }

  let filteredRecipes = [...recipes];

  // Filter by dietary preferences
  if (options.dietaryPreference && options.dietaryPreference !== 'all') {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.tags?.some(tag => tag.toLowerCase() === options.dietaryPreference?.toLowerCase())
    );
  }

  // Filter out recipes with allergens
  if (options.allergies && options.allergies.length > 0) {
    filteredRecipes = filteredRecipes.filter(recipe => {
      return !recipe.ingredients.some(ingredient => 
        options.allergies?.some(allergen => 
          ingredient.toLowerCase().includes(allergen.toLowerCase())
        )
      );
    });
  }

  // Filter out recipes with disliked ingredients
  if (options.dislikedIngredients && options.dislikedIngredients.length > 0) {
    filteredRecipes = filteredRecipes.filter(recipe => {
      return !recipe.ingredients.some(ingredient => 
        options.dislikedIngredients?.some(disliked => 
          ingredient.toLowerCase().includes(disliked.toLowerCase())
        )
      );
    });
  }

  // Filter by cooking time limit
  if (options.cookingTimeLimit && options.cookingTimeLimit > 0) {
    filteredRecipes = filteredRecipes.filter(recipe => {
      const cookTimeMinutes = parseInt(recipe.cookTime.replace(/\D/g, ''), 10) || 0;
      return cookTimeMinutes <= options.cookingTimeLimit!;
    });
  }

  // Return the first set of results if we have some
  if (filteredRecipes.length > 0) {
    return filteredRecipes;
  }

  // If no recipes match the strict criteria, return recipes that match at least the dietary preference
  if (options.dietaryPreference && options.dietaryPreference !== 'all') {
    const lessFilteredRecipes = recipes.filter(recipe => 
      recipe.tags?.some(tag => tag.toLowerCase() === options.dietaryPreference?.toLowerCase())
    );
    
    if (lessFilteredRecipes.length > 0) {
      return lessFilteredRecipes;
    }
  }

  // Fall back to the original recipes if no matches
  return recipes;
}

export function getTimeBasedCategories(): string[] {
  const hour = new Date().getHours();

  // Early morning: 5-8 AM
  if (hour >= 5 && hour < 8) {
    return ['Quick Breakfast', 'Morning Smoothies', 'Healthy Start'];
  }
  
  // Morning: 8-11 AM
  if (hour >= 8 && hour < 11) {
    return ['Breakfast', 'Brunch Ideas', 'Morning Bites'];
  }
  
  // Lunch time: 11-2 PM
  if (hour >= 11 && hour < 14) {
    return ['Lunch', 'Quick Meals', 'Salads & Bowls'];
  }
  
  // Afternoon: 2-5 PM
  if (hour >= 14 && hour < 17) {
    return ['Snacks', 'Light Bites', 'Afternoon Pick-Me-Up'];
  }
  
  // Dinner time: 5-8 PM
  if (hour >= 17 && hour < 20) {
    return ['Dinner', 'Family Meals', 'Hearty Dishes'];
  }
  
  // Evening: 8-10 PM
  if (hour >= 20 && hour < 22) {
    return ['Light Dinner', 'Evening Meals', 'Quick Dishes'];
  }
  
  // Late night: 10 PM - 5 AM
  return ['Late-Night Snacks', 'Light Bites', 'Quick & Easy'];
}

export function getRecommendedCategory(): string {
  const hour = new Date().getHours();

  // Early morning: 5-8 AM
  if (hour >= 5 && hour < 8) {
    return 'Quick Breakfast';
  }
  
  // Morning: 8-11 AM
  if (hour >= 8 && hour < 11) {
    return 'Breakfast';
  }
  
  // Lunch time: 11-2 PM
  if (hour >= 11 && hour < 14) {
    return 'Lunch';
  }
  
  // Afternoon: 2-5 PM
  if (hour >= 14 && hour < 17) {
    return 'Snacks';
  }
  
  // Dinner time: 5-8 PM
  if (hour >= 17 && hour < 20) {
    return 'Dinner';
  }
  
  // Evening: 8-10 PM
  if (hour >= 20 && hour < 22) {
    return 'Light Dinner';
  }
  
  // Late night: 10 PM - 5 AM
  return 'Late-Night Snacks';
}

export function getTodaysSuggestionTitle(): string {
  const hour = new Date().getHours();

  // Early morning: 5-8 AM
  if (hour >= 5 && hour < 8) {
    return 'Breakfast Ideas';
  }
  
  // Morning: 8-11 AM
  if (hour >= 8 && hour < 11) {
    return 'Morning Recipes';
  }
  
  // Lunch time: 11-2 PM
  if (hour >= 11 && hour < 14) {
    return 'Lunch Recipes';
  }
  
  // Afternoon: 2-5 PM
  if (hour >= 14 && hour < 17) {
    return 'Afternoon Recipes';
  }
  
  // Dinner time: 5-8 PM
  if (hour >= 17 && hour < 20) {
    return 'Dinner Ideas';
  }
  
  // Evening: 8-10 PM
  if (hour >= 20 && hour < 22) {
    return 'Evening Meals';
  }
  
  // Late night: 10 PM - 5 AM
  return 'Late-Night Recipes';
} 