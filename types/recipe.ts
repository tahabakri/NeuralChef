/**
 * Recipe Types
 */

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Step {
  description: string;
  time?: number; // Time in minutes
  imageUrl?: string; // Optional image URL for the step
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  sodium?: number;
  fiber?: number;
  [key: string]: number | undefined; // For other nutritional values
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string; // URL to the recipe image
  heroImage?: string; // Optional larger hero image
  cookTime: number; // Time in minutes
  prepTime?: number; // Time in minutes
  totalTime?: number; // Time in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating?: number; // Rating out of 5
  servings: number;
  author?: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
  nutritionalInfo?: NutritionalInfo;
  notes?: string[];
  source?: string; // Source of the recipe (website, cookbook, etc.)
  saved?: boolean; // Whether the user has saved this recipe
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// For recipe cards (simplified version for lists)
export interface RecipeCard {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
  servings: number;
  tags: string[];
  saved?: boolean;
}

// Helper function to prepare recipe data for display in a card
export const prepareRecipeForCard = (recipe: Recipe | RecipeCard): RecipeCard => {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.image,
    cookTime: recipe.cookTime,
    difficulty: recipe.difficulty,
    rating: recipe.rating,
    servings: recipe.servings,
    tags: recipe.tags,
    saved: recipe.saved
  };
}; 