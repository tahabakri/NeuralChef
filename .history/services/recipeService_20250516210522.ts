import { Platform } from 'react-native';
import { RecipeErrorType } from '@/stores/recipeStore';
import { MicroPreference, PortionSize } from '@/stores/preferencesStore';

export interface Recipe {
  id?: string; // Unique identifier for the recipe
  title: string;
  description: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  heroImage?: string; // Optional hero image URL for the recipe
  steps: {
    instruction: string;
    imageUrl?: string;
    hasTimer?: boolean;
    timerDuration?: number; // in minutes
  }[];
  nutritionInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    sodium?: string;
    fiber?: string;
    sugar?: string;
  };
  totalTime?: string; // Combined prep and cook time
  category?: string; // e.g., "Dinner", "Breakfast", "Dessert"
  difficulty?: 'Easy' | 'Medium' | 'Hard'; // Recipe difficulty
  tags?: string[]; // Custom user tags like "quick", "weeknight", "comfort food"
}

export interface RecipeServiceError {
  type: RecipeErrorType;
  message: string;
  details?: string;
}

// Helper function to handle common API errors and translate them to appropriate error types
function handleApiError(error: any): RecipeServiceError {
  console.error('API error:', error);
  
  if (!error) {
    return { type: 'unknown', message: 'An unknown error occurred' };
  }
  
  // Network related errors
  if (error.message?.includes('Network request failed') || 
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('Network error') ||
      !navigator.onLine) {
    return { 
      type: 'network', 
      message: 'Unable to reach our servers. Please check your internet connection.' 
    };
  }
  
  // Timeout errors
  if (error.message?.includes('timeout') || 
      error.message?.includes('Timed out') || 
      error.message?.includes('ETIMEDOUT')) {
    return {
      type: 'timeout',
      message: 'The request took too long to complete. Please try again later.'
    };
  }
  
  // Generation-related errors
  if (error.message?.includes('Failed to generate') ||
      error.message?.includes('Invalid response') ||
      error.message?.includes('parse') ||
      error.status === 422) {
    return {
      type: 'generation', 
      message: 'Unable to create a recipe with the provided ingredients.'
    };
  }
  
  // Default case
  return {
    type: 'unknown',
    message: error.message || 'Something went wrong while generating your recipe.',
    details: error.stack
  };
}

// This is a mock service for generating recipes
// In a real app, this would call your backend API which would then call the AI services

const mockRecipes: Recipe[] = [
  {
    title: "Spaghetti Carbonara",
    description: "A classic Italian pasta dish with eggs, cheese, pancetta, and pepper.",
    servings: 4,
    prepTime: "10 min",
    cookTime: "15 min",
    totalTime: "25 min",
    category: "Dinner",
    difficulty: "Medium",
    heroImage: "https://images.unsplash.com/photo-1588013273468-315080664754?q=80&w=2070&auto=format&fit=crop",
    ingredients: ["Spaghetti", "Eggs", "Pancetta", "Pecorino Romano Cheese", "Black Pepper"],
    steps: [
      { instruction: "Cook spaghetti according to package directions." },
      { instruction: "While pasta cooks, fry pancetta until crispy." },
      { instruction: "Whisk eggs, cheese, and pepper in a bowl." },
      { instruction: "Drain pasta, reserving some pasta water. Add pasta to pancetta. Turn off heat." },
      { instruction: "Quickly mix in egg mixture. Add pasta water if needed for creaminess. Serve immediately." }
    ],
    nutritionInfo: { 
      calories: "600 kcal", 
      protein: "25g", 
      carbs: "70g", 
      fat: "28g",
      sodium: "950mg",
      fiber: "3g",
      sugar: "2g" 
    }
  },
  {
    title: "Chicken Stir-Fry",
    description: "A quick and healthy chicken and vegetable stir-fry.",
    servings: 2,
    prepTime: "15 min",
    cookTime: "10 min",
    totalTime: "25 min",
    category: "Dinner",
    difficulty: "Easy",
    heroImage: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2070&auto=format&fit=crop",
    ingredients: ["Chicken Breast", "Broccoli", "Carrots", "Bell Peppers", "Soy Sauce", "Ginger", "Garlic"],
    steps: [
      { instruction: "Slice chicken and vegetables." },
      { instruction: "Stir-fry chicken until cooked. Remove from pan." },
      { instruction: "Stir-fry vegetables until tender-crisp." },
      { instruction: "Add chicken back to pan with soy sauce, ginger, and garlic. Cook for 1-2 minutes. Serve with rice." }
    ],
    nutritionInfo: { calories: "400 kcal", protein: "35g", carbs: "30g", fat: "15g" }
  },
  {
    title: "Classic Pancakes",
    description: "Fluffy and delicious pancakes, perfect for breakfast.",
    servings: 4, // makes about 8 pancakes
    prepTime: "10 min",
    cookTime: "20 min",
    totalTime: "30 min",
    category: "Breakfast",
    difficulty: "Easy",
    heroImage: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=2070&auto=format&fit=crop",
    ingredients: ["All-purpose flour", "Sugar", "Baking powder", "Salt", "Milk", "Egg", "Melted butter"],
    steps: [
        { instruction: "In a large bowl, whisk together flour, sugar, baking powder, and salt." },
        { instruction: "In a separate bowl, whisk together milk, egg, and melted butter." },
        { instruction: "Pour wet ingredients into dry ingredients and mix until just combined (do not overmix)." },
        { instruction: "Heat a lightly oiled griddle or frying pan over medium-high heat." },
        { instruction: "Pour or scoop the batter onto the griddle, using approximately 1/4 cup for each pancake." },
        { instruction: "Cook for about 2-3 minutes per side, or until golden brown and cooked through. Serve with your favorite toppings." }
    ],
    nutritionInfo: { calories: "250 kcal per 2 pancakes", protein: "7g", carbs: "35g", fat: "9g" }
  },
  {
    title: "Avocado Toast with Egg",
    description: "A simple and nutritious breakfast or light meal.",
    servings: 1,
    prepTime: "5 min",
    cookTime: "5 min",
    totalTime: "10 min",
    category: "Breakfast",
    difficulty: "Easy",
    heroImage: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1910&auto=format&fit=crop",
    ingredients: ["Bread slice", "Avocado", "Egg", "Salt", "Pepper", "Red pepper flakes (optional)"],
    steps: [
        { instruction: "Toast the bread slice to your liking." },
        { instruction: "While the bread is toasting, mash the avocado in a small bowl. Season with salt and pepper." },
        { instruction: "Cook an egg to your preference (fried, poached, or scrambled)." },
        { instruction: "Spread the mashed avocado on the toast." },
        { instruction: "Top with the cooked egg. Sprinkle with red pepper flakes if desired. Serve immediately." }
    ],
    nutritionInfo: { calories: "350 kcal", protein: "15g", carbs: "30g", fat: "20g" }
  }
];

// Helper function to generate a unique ID
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export async function generateRecipe(
  ingredients: string[], 
  dietaryPreference: string = 'all',
  allergies: string[] = [],
  dislikedIngredients: string[] = [],
  spiceLevel: string = 'medium',
  cuisineTypes: string[] = [],
  cookingTimeLimit: number = 0,
  maxCalories: number = 0,
  portionSize: PortionSize = 'couple',
  microPreferences: MicroPreference[] = []
): Promise<Recipe> {
  try {
    // Validate input
    if (!ingredients || ingredients.length === 0) {
      throw { type: 'validation' as RecipeErrorType, message: 'Please provide at least one ingredient' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced delay slightly
    
    // Create a weighted filtering system for recipes
    let filteredRecipes = [...mockRecipes];
    
    // 1. First filter: Allergies (highest priority - safety concern)
    if (allergies && allergies.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        // Check if recipe has any allergens
        return !recipe.ingredients.some(ingredient => 
          allergies.some(allergen => 
            ingredient.toLowerCase().includes(allergen.toLowerCase())
          )
        );
      });
      
      // If no recipes match allergy filter, log the issue but continue with original set
      // rather than returning potentially harmful recipes
      if (filteredRecipes.length === 0) {
        console.warn('No recipes found that avoid all allergies');
        // Don't reset the filtered recipes - safety first
        return {
          title: "Custom Recipe",
          description: "A recipe tailored to your dietary needs and preferences.",
          servings: 2,
          prepTime: "15 min",
          cookTime: "20 min",
          ingredients: ingredients.map(i => i.trim()),
          steps: [
            { instruction: "We couldn't find a matching recipe that avoids your allergies. Please create a custom recipe or adjust your allergen settings." }
          ]
        };
      }
    }
    
    // 2. Second filter: Disliked ingredients (high priority)
    if (dislikedIngredients && dislikedIngredients.length > 0) {
      const preFilterCount = filteredRecipes.length;
      filteredRecipes = filteredRecipes.filter(recipe => {
        // Check if recipe has any disliked ingredients
        return !recipe.ingredients.some(ingredient => 
          dislikedIngredients.some(disliked => 
            ingredient.toLowerCase().includes(disliked.toLowerCase())
          )
        );
      });
      
      // If this filter removed all recipes, restore the previous set
      // (disliked ingredients are a preference, not safety critical)
      if (filteredRecipes.length === 0 && preFilterCount > 0) {
        console.warn('Ignoring disliked ingredients filter as it eliminated all recipes');
        // Reset to previous filter state
        filteredRecipes = [...mockRecipes];
        if (allergies && allergies.length > 0) {
          filteredRecipes = filteredRecipes.filter(recipe => {
            return !recipe.ingredients.some(ingredient => 
              allergies.some(allergen => 
                ingredient.toLowerCase().includes(allergen.toLowerCase())
              )
            );
          });
        }
      }
    }
    
    // 3. Dietary preference filter
    if (dietaryPreference && dietaryPreference !== 'all') {
      const preFilterCount = filteredRecipes.length;
      const filteredByDiet = filteredRecipes.filter(recipe => {
        // This is a simplified check - in a real app, you'd have more robust logic
        // to determine if a recipe meets dietary requirements
        const tags = recipe.tags || [];
        return tags.includes(dietaryPreference);
      });
      
      // Only apply this filter if it doesn't eliminate all options
      if (filteredByDiet.length > 0) {
        filteredRecipes = filteredByDiet;
      } else {
        console.warn(`No recipes found matching dietary preference: ${dietaryPreference}`);
      }
    }
    
    // 4. Cuisine type filter
    if (cuisineTypes && cuisineTypes.length > 0) {
      const preFilterCount = filteredRecipes.length;
      const filteredByCuisine = filteredRecipes.filter(recipe => {
        // This is a simplified check - in a real app, you'd have more robust logic
        const recipeCuisine = recipe.category?.toLowerCase() || '';
        return cuisineTypes.some(cuisine => 
          recipeCuisine.includes(cuisine.toLowerCase())
        );
      });
      
      // Only apply this filter if it doesn't eliminate all options
      if (filteredByCuisine.length > 0) {
        filteredRecipes = filteredByCuisine;
      } else {
        console.warn(`No recipes found matching cuisine types: ${cuisineTypes.join(', ')}`);
      }
    }
    
    // 5. Cooking time limit filter
    if (cookingTimeLimit > 0) {
      const preFilterCount = filteredRecipes.length;
      
      // Filter recipes based on total cooking time
      const filteredByTime = filteredRecipes.filter(recipe => {
        // Extract numeric values from prepTime and cookTime
        const prepTimeMatch = recipe.prepTime.match(/(\d+)/);
        const cookTimeMatch = recipe.cookTime.match(/(\d+)/);
        
        if (prepTimeMatch && cookTimeMatch) {
          const prepMinutes = parseInt(prepTimeMatch[0], 10);
          const cookMinutes = parseInt(cookTimeMatch[0], 10);
          const totalMinutes = prepMinutes + cookMinutes;
          
          return totalMinutes <= cookingTimeLimit;
        }
        
        return false;
      });
      
      // Only apply this filter if it doesn't eliminate all options
      if (filteredByTime.length > 0) {
        filteredRecipes = filteredByTime;
      } else {
        console.warn(`No recipes found within cooking time limit: ${cookingTimeLimit} minutes`);
      }
    }
    
    // 6. Max calories filter
    if (maxCalories > 0) {
      const preFilterCount = filteredRecipes.length;
      
      // Filter recipes based on calories per serving
      const filteredByCalories = filteredRecipes.filter(recipe => {
        if (recipe.nutritionInfo?.calories) {
          // Extract numeric value from calories string
          const caloriesMatch = recipe.nutritionInfo.calories.match(/(\d+)/);
          if (caloriesMatch) {
            const calories = parseInt(caloriesMatch[0], 10);
            return calories <= maxCalories;
          }
        }
        return false;
      });
      
      // Only apply this filter if it doesn't eliminate all options
      if (filteredByCalories.length > 0) {
        filteredRecipes = filteredByCalories;
      } else {
        console.warn(`No recipes found under ${maxCalories} calories per serving`);
        // Suggest alternative with higher calorie limit if strict application would eliminate all results
        // (We'd return this message to the user in a real app)
      }
    }
    
    // 7. Apply micro-preferences filtering
    if (microPreferences && microPreferences.length > 0) {
      // Calculate a score for each recipe based on how many micro-preferences it matches
      const scoredRecipes = filteredRecipes.map(recipe => {
        let score = 0;
        
        for (const pref of microPreferences) {
          switch (pref) {
            case 'low-sodium':
              if (recipe.nutritionInfo?.sodium) {
                const sodiumMatch = recipe.nutritionInfo.sodium.match(/(\d+)/);
                if (sodiumMatch) {
                  const sodium = parseInt(sodiumMatch[0], 10);
                  if (sodium < 1500) score += 1;
                }
              }
              break;
            case 'high-protein':
              if (recipe.nutritionInfo?.protein) {
                const proteinMatch = recipe.nutritionInfo.protein.match(/(\d+)/);
                if (proteinMatch) {
                  const protein = parseInt(proteinMatch[0], 10);
                  if (protein > 25) score += 1;
                }
              }
              break;
            case 'low-sugar':
              if (recipe.nutritionInfo?.sugar) {
                const sugarMatch = recipe.nutritionInfo.sugar.match(/(\d+)/);
                if (sugarMatch) {
                  const sugar = parseInt(sugarMatch[0], 10);
                  if (sugar < 5) score += 1;
                }
              }
              break;
            case 'high-fiber':
              if (recipe.nutritionInfo?.fiber) {
                const fiberMatch = recipe.nutritionInfo.fiber.match(/(\d+)/);
                if (fiberMatch) {
                  const fiber = parseInt(fiberMatch[0], 10);
                  if (fiber > 5) score += 1;
                }
              }
              break;
            case 'low-fat':
              if (recipe.nutritionInfo?.fat) {
                const fatMatch = recipe.nutritionInfo.fat.match(/(\d+)/);
                if (fatMatch) {
                  const fat = parseInt(fatMatch[0], 10);
                  if (fat < 10) score += 1;
                }
              }
              break;
            // Other micro-preferences would have their own logic
          }
        }
        
        return { recipe, score };
      });
      
      // Sort by score descending (best matches first)
      scoredRecipes.sort((a, b) => b.score - a.score);
      
      // Only keep recipes that match at least one preference, if any do
      const matchingRecipes = scoredRecipes.filter(item => item.score > 0);
      
      if (matchingRecipes.length > 0) {
        filteredRecipes = matchingRecipes.map(item => item.recipe);
      }
    }
    
    // Adjust servings based on portionSize
    let servingsMultiplier = 1;
    switch(portionSize) {
      case 'single':
        servingsMultiplier = 0.5; // Half the standard recipe
        break;
      case 'family':
        servingsMultiplier = 2; // Double the standard recipe
        break;
      case 'large-group':
        servingsMultiplier = 4; // Quadruple the standard recipe
        break;
      default:
        servingsMultiplier = 1; // No change for 'couple'
    }
    
    // After all filters, select a recipe that contains the most ingredients from user input
    let selectedRecipe = filteredRecipes[0]; // Default to first recipe if no better match
    
    if (filteredRecipes.length > 1) {
      // Calculate how many input ingredients each recipe uses
      const recipeScores = filteredRecipes.map(recipe => {
        const matchCount = ingredients.filter(ingredient =>
          recipe.ingredients.some(recipeIng => 
            recipeIng.toLowerCase().includes(ingredient.toLowerCase())
          )
        ).length;
        
        return { recipe, matchCount };
      });
      
      // Sort by match count (descending)
      recipeScores.sort((a, b) => b.matchCount - a.matchCount);
      selectedRecipe = recipeScores[0].recipe;
    }
    
    // If we found a suitable recipe, adjust it
    if (selectedRecipe) {
      // Create a copy with a new ID
      const adjustedRecipe = { 
        ...selectedRecipe,
        id: generateUniqueId(),
        
        // Adjust servings based on portion size
        servings: Math.max(1, Math.round(selectedRecipe.servings * servingsMultiplier))
      };
      
      // Apply spice level adjustment
      return applySpiceLevelPreference(adjustedRecipe, spiceLevel);
    }
    
    // If we couldn't find a suitable recipe, generate a simple one
    // This would be replaced with a real AI generation call
    return {
      id: generateUniqueId(),
      title: "Custom Recipe with " + ingredients[0],
      description: "A custom recipe made with your ingredients.",
      servings: portionSize === 'single' ? 1 : portionSize === 'couple' ? 2 : portionSize === 'family' ? 4 : 8,
      prepTime: cookingTimeLimit > 0 ? `${Math.floor(cookingTimeLimit / 3)} min` : "15 min",
      cookTime: cookingTimeLimit > 0 ? `${Math.floor(cookingTimeLimit * 2 / 3)} min` : "20 min",
      ingredients: ingredients.map(ing => ing.trim()),
      steps: [
        { instruction: `Prepare the ${ingredients[0]} by washing and cutting it into bite-sized pieces.` },
        { instruction: "Heat a pan over medium heat with a bit of oil." },
        { instruction: `Add ${ingredients[0]} and cook until tender.` },
        { instruction: ingredients.length > 1 ? `Add ${ingredients[1]} and continue cooking for a few minutes.` : "Season to taste." },
        { instruction: "Serve hot and enjoy!" }
      ],
      nutritionInfo: maxCalories > 0 ? {
        calories: `${maxCalories} kcal`,
        protein: "15g",
        carbs: "25g",
        fat: "10g"
      } : undefined
    };
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw handleApiError(error);
  }
}

// Function to apply spice level preference to a recipe
function applySpiceLevelPreference(recipe: Recipe, spiceLevel: string): Recipe {
  // In a real application, this would make more sophisticated changes to the recipe
  // Here we're just adjusting the description and a few instructions for demo purposes
  
  const adjustedRecipe = { ...recipe };
  
  switch (spiceLevel) {
    case 'none':
      adjustedRecipe.description = `${recipe.description} Made with no added spice for a mild flavor.`;
      adjustedRecipe.steps = recipe.steps.map(step => {
        const newStep = { ...step };
        if (newStep.instruction.toLowerCase().includes('pepper') || 
            newStep.instruction.toLowerCase().includes('spice') ||
            newStep.instruction.toLowerCase().includes('chili')) {
          newStep.instruction = newStep.instruction.replace(/add.*pepper|add.*spice|add.*chili/i, 'omit any spicy ingredients');
        }
        return newStep;
      });
      break;
      
    case 'mild':
      adjustedRecipe.description = `${recipe.description} Prepared with a touch of spice for subtle flavor.`;
      // No changes to steps for mild - assume recipes are mild by default
      break;
      
    case 'medium':
      adjustedRecipe.description = `${recipe.description} Balanced with moderate spice level.`;
      // No changes to steps for medium - assume recipes are medium by default
      break;
      
    case 'spicy':
      adjustedRecipe.description = `${recipe.description} Kicked up with extra spice for heat lovers.`;
      // Add more spice to steps
      adjustedRecipe.steps = recipe.steps.map(step => {
        const newStep = { ...step };
        if (newStep.instruction.toLowerCase().includes('season') || 
            newStep.instruction.toLowerCase().includes('spice') ||
            step.instruction.toLowerCase().includes('pepper')) {
          newStep.instruction = newStep.instruction + ' Add extra red pepper flakes for heat.';
        }
        return newStep;
      });
      break;
      
    case 'extra-spicy':
      adjustedRecipe.description = `${recipe.description} Made extra spicy for those who love intense heat.`;
      // Add even more spice
      adjustedRecipe.steps = recipe.steps.map(step => {
        const newStep = { ...step };
        if (newStep.instruction.toLowerCase().includes('season') || 
            newStep.instruction.toLowerCase().includes('spice')) {
          newStep.instruction = newStep.instruction + ' Add generous amounts of chili flakes, cayenne pepper, and hot sauce for maximum heat.';
        }
        return newStep;
      });
      // Also add hot sauce to ingredients if not already there
      if (!adjustedRecipe.ingredients.some(ing => 
        ing.toLowerCase().includes('hot sauce') || 
        ing.toLowerCase().includes('chili') ||
        ing.toLowerCase().includes('cayenne'))) {
        adjustedRecipe.ingredients.push('Hot sauce');
        adjustedRecipe.ingredients.push('Cayenne pepper');
      }
      break;
  }
  
  return adjustedRecipe;
}

// In a real implementation, this would call the AI API to generate a recipe
export async function generateRecipeWithAI(ingredients: string[]): Promise<Recipe> {
  try {
    // Validate input
    if (!ingredients || ingredients.length === 0) {
      throw { type: 'validation', message: 'Please provide at least one ingredient' };
    }
    
    // Combine ingredients into a comma-separated string
    const ingredientsStr = ingredients.join(', ');
    
    // Set up a timeout for the request
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject({ 
        type: 'timeout', 
        message: 'Request timed out after 20 seconds' 
      }), 20000);
    });
    
    // Actual API call
    const fetchPromise = fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef who creates delicious recipes based on available ingredients. Provide detailed, step-by-step instructions. Format your response as JSON with the following structure: { "title": "Recipe Title", "description": "Brief description", "servings": 4, "prepTime": "15 min", "cookTime": "30 min", "ingredients": ["Ingredient 1", "Ingredient 2"], "steps": [{"instruction": "Step 1 instruction", "hasTimer": false}, {"instruction": "Step 2 instruction - cook for 10 minutes", "hasTimer": true, "timerDuration": 10}], "nutritionInfo": {"calories": "450 kcal", "protein": "12g", "carbs": "65g", "fat": "14g"} }'
          },
          {
            role: 'user',
            content: `Create a recipe using these ingredients: ${ingredientsStr}. Be creative but practical. Make sure the recipe is actually good and uses the ingredients efficiently.`
          }
        ]
      })
    });

    // Race the fetch against the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      throw { 
        type: 'generation',
        message: `Failed to generate recipe (${response.status})`,
        details: await response.text()
      };
    }

    const data = await response.json();
    
    try {
      // Parse the completion as JSON
      const recipeData = JSON.parse(data.completion);
      
      // Add a default hero image if none is provided
      if (!recipeData.heroImage) {
        // Assign a random food hero image
        const foodImages = [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2080&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2070&auto=format&fit=crop"
        ];
        recipeData.heroImage = foodImages[Math.floor(Math.random() * foodImages.length)];
      }
      
      // Calculate total time if not provided
      if (!recipeData.totalTime && recipeData.prepTime && recipeData.cookTime) {
        // Extract minutes from time strings
        const prepTimeMatch = recipeData.prepTime.match(/(\d+)/);
        const cookTimeMatch = recipeData.cookTime.match(/(\d+)/);
        
        if (prepTimeMatch && cookTimeMatch) {
          const prepMinutes = parseInt(prepTimeMatch[1]) || 0;
          const cookMinutes = parseInt(cookTimeMatch[1]) || 0;
          const totalMinutes = prepMinutes + cookMinutes;
          
          recipeData.totalTime = `${totalMinutes} min`;
        }
      }
      
      // Return the recipe data
      return recipeData;
    } catch (parseError: any) {
      console.error('Failed to parse recipe JSON:', parseError);
      // Throw with appropriate error type
      throw {
        type: 'generation',
        message: 'Failed to parse the generated recipe',
        details: parseError.message
      };
    }
  } catch (error: any) {
    console.error('Error generating recipe with AI:', error);
    
    // If it's already a typed error, pass it through
    if (error.type) {
      throw error;
    }
    
    // Otherwise handle the error
    throw handleApiError(error);
  }
}

// Mock implementation of the modifyRecipe function
export async function modifyRecipe(
  originalRecipe: Recipe,
  newIngredients: string[],
  dietaryPreference: string = 'all',
  allergies: string[] = [],
  dislikedIngredients: string[] = [],
  spiceLevel: string = 'medium',
  cuisineTypes: string[] = [],
  cookingTimeLimit: number = 0
): Promise<Recipe> {
  try {
    // Validate input
    if (!newIngredients || newIngredients.length === 0) {
      throw { type: 'validation' as RecipeErrorType, message: 'Please provide at least one ingredient' };
    }
    
    if (!originalRecipe) {
      throw { type: 'validation' as RecipeErrorType, message: 'Original recipe is required' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a deep copy of the original recipe to modify
    const modifiedRecipe: Recipe = JSON.parse(JSON.stringify(originalRecipe));
    
    // Ensure the recipe has an ID
    if (!modifiedRecipe.id) {
      modifiedRecipe.id = generateUniqueId();
    }
    
    // Update ingredients
    modifiedRecipe.ingredients = [...new Set(newIngredients)]; // Remove duplicates
    
    // Update title to indicate it's a variation
    if (!modifiedRecipe.title.includes('Variation')) {
      modifiedRecipe.title = `${modifiedRecipe.title} Variation`;
    }
    
    // Update description to mention the changes
    modifiedRecipe.description = `A variation of the original recipe with modified ingredients: ${newIngredients.join(', ')}.`;
    
    // Apply dietary preferences, allergies, and preferences to the modified recipe
    // This is a simplified example - in a real app, you would have more sophisticated transformation logic
    if (allergies && allergies.length > 0) {
      // Replace common allergens with safe alternatives
      modifiedRecipe.ingredients = modifiedRecipe.ingredients.map(ingredient => {
        const lowerIngredient = ingredient.toLowerCase();
        
        // Check if the ingredient contains any allergen
        const matchedAllergen = allergies.find(allergen => 
          lowerIngredient.includes(allergen.toLowerCase())
        );
        
        if (matchedAllergen) {
          // Replace with alternative based on the allergen
          switch (matchedAllergen.toLowerCase()) {
            case 'milk':
            case 'dairy':
              return ingredient.replace(/milk|dairy|cream/i, 'almond milk');
            case 'egg':
            case 'eggs':
              return ingredient.replace(/egg/i, 'egg substitute');
            case 'peanuts':
              return ingredient.replace(/peanut/i, 'sunflower seed');
            case 'tree nuts':
              return ingredient.replace(/almond|walnut|pecan|cashew/i, 'seed');
            case 'wheat':
            case 'gluten':
              return ingredient.replace(/flour|wheat|bread/i, 'gluten-free alternative');
            default:
              return `${ingredient} (WARNING: Contains ${matchedAllergen} - please substitute)`;
          }
        }
        
        return ingredient;
      });
      
      // Add a note about allergies in the description
      modifiedRecipe.description += ` (Modified to avoid allergens: ${allergies.join(', ')})`;
    }
    
    // Apply spice level preference
    const spiceModifiedRecipe = applySpiceLevelPreference(modifiedRecipe, spiceLevel);
    
    // Update modifiedRecipe with the spice modified recipe
    Object.assign(modifiedRecipe, spiceModifiedRecipe);
    
    // Adjust cooking times slightly to make the variation different
    const prepMinutes = parseInt(modifiedRecipe.prepTime);
    const cookMinutes = parseInt(modifiedRecipe.cookTime);
    
    if (!isNaN(prepMinutes)) {
      modifiedRecipe.prepTime = `${prepMinutes + Math.floor(Math.random() * 5)} min`;
    }
    
    if (!isNaN(cookMinutes)) {
      modifiedRecipe.cookTime = `${cookMinutes + Math.floor(Math.random() * 7)} min`;
    }
    
    // Update total time if it exists
    if (modifiedRecipe.totalTime) {
      const totalMinutes = parseInt(modifiedRecipe.totalTime);
      if (!isNaN(totalMinutes)) {
        modifiedRecipe.totalTime = `${totalMinutes + Math.floor(Math.random() * 10)} min`;
      }
    }
    
    // Slightly modify the steps to incorporate the new ingredients
    modifiedRecipe.steps = modifiedRecipe.steps.map(step => {
      return {
        ...step,
        instruction: step.instruction + (Math.random() > 0.7 ? ' Adjust seasoning to taste.' : '')
      };
    });
    
    // In a real implementation, you would call an AI service to generate appropriate
    // recipe modifications based on the new ingredients
    
    return modifiedRecipe;
  } catch (error: any) {
    // If the error is already a RecipeServiceError, rethrow it, otherwise wrap it.
    if (error.type && error.message) {
      throw error as RecipeServiceError;
    }
    throw handleApiError(error);
  }
}