import { Platform } from 'react-native';
import { RecipeErrorType } from '@/stores/recipeStore';

export interface Recipe {
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
    nutritionInfo: { calories: "600 kcal", protein: "25g", carbs: "70g", fat: "28g" }
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

export async function generateRecipe(
  ingredients: string[], 
  dietaryPreference: string = 'all'
): Promise<Recipe> {
  try {
    // Validate input
    if (!ingredients || ingredients.length === 0) {
      throw { type: 'validation' as RecipeErrorType, message: 'Please provide at least one ingredient' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced delay slightly
    
    // Filter recipes by dietary preference if specified
    const filteredRecipes = dietaryPreference === 'all' 
      ? mockRecipes 
      : mockRecipes.filter(recipe => {
          // This is a simplified filtering logic - in a real app, you would have 
          // more sophisticated logic based on ingredients and recipe properties
          switch (dietaryPreference) {
            case 'vegetarian':
              return !recipe.ingredients.some(i => 
                i.toLowerCase().includes('meat') || 
                i.toLowerCase().includes('chicken') || 
                i.toLowerCase().includes('pork') || 
                i.toLowerCase().includes('beef')
              );
            case 'vegan':
              return !recipe.ingredients.some(i => 
                i.toLowerCase().includes('meat') || 
                i.toLowerCase().includes('egg') || 
                i.toLowerCase().includes('milk') || 
                i.toLowerCase().includes('cheese') || 
                i.toLowerCase().includes('chicken') || 
                i.toLowerCase().includes('pork') || 
                i.toLowerCase().includes('beef')
              );
            case 'gluten-free':
              return !recipe.ingredients.some(i => 
                i.toLowerCase().includes('flour') || 
                i.toLowerCase().includes('pasta') || 
                i.toLowerCase().includes('bread') || 
                i.toLowerCase().includes('wheat')
              );
            default:
              return true;
          }
        });
    
    // If no recipes match the dietary preference, fall back to all recipes
    const recipesToChooseFrom = filteredRecipes.length > 0 ? filteredRecipes : mockRecipes;
    
    // Select a random recipe from the filtered list
    const randomIndex = Math.floor(Math.random() * recipesToChooseFrom.length);
    let selectedRecipe = { ...recipesToChooseFrom[randomIndex] }; // Create a copy to modify

    // Personalize the recipe slightly based on the first ingredient if provided
    if (ingredients.length > 0) {
      const mainIngredient = ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1);
      // This is a very basic personalization. 
      // You could add more sophisticated logic to incorporate ingredients into the selected mock recipe.
      if (!selectedRecipe.title.includes(mainIngredient) && (selectedRecipe.category === "Dinner" || selectedRecipe.category === "Lunch")) {
        selectedRecipe.title = `${selectedRecipe.title} with ${mainIngredient}`;
      }
      // Ensure the provided ingredients are listed (could be a mix)
      selectedRecipe.ingredients = [...new Set([...ingredients.map(i => i.trim()), ...selectedRecipe.ingredients])];
    }

    return selectedRecipe;

  } catch (error: any) {
    // If the error is already a RecipeServiceError, rethrow it, otherwise wrap it.
    if (error.type && error.message) {
        throw error as RecipeServiceError;
    }
    throw handleApiError(error);
  }
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