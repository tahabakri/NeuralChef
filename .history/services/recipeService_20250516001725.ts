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
export async function generateRecipe(ingredients: string[]): Promise<Recipe> {
  try {
    // Validate input
    if (!ingredients || ingredients.length === 0) {
      throw { type: 'validation', message: 'Please provide at least one ingredient' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, we'll return a mock recipe
    const ingredientsStr = ingredients.join(', ');
    const mainIngredient = ingredients[0];
    
    // Calculate total time
    const prepTime = "15 min";
    const cookTime = "20 min";
    
    // Extract minutes from time strings
    const prepMinutes = parseInt(prepTime) || 0;
    const cookMinutes = parseInt(cookTime) || 0;
    const totalMinutes = prepMinutes + cookMinutes;
    
    const totalTime = `${totalMinutes} min`;
    
    return {
      title: "Pasta with " + mainIngredient,
      description: "A delicious pasta dish made with " + ingredientsStr,
      servings: 4,
      prepTime,
      cookTime,
      totalTime,
      heroImage: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=2940&auto=format&fit=crop",
      ingredients: ingredients.map(i => i.trim()),
      steps: [
        {
          instruction: "Boil water in a large pot and add salt.",
          imageUrl: "https://images.unsplash.com/photo-1626197031507-c17099753214?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
          instruction: "Add pasta to the boiling water and cook according to package instructions (approximately 8-10 minutes).",
          imageUrl: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=2865&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          hasTimer: true,
          timerDuration: 10
        },
        {
          instruction: "Heat olive oil in a pan and add garlic.",
          imageUrl: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
          instruction: "Add the remaining ingredients and cook for 5 minutes.",
          imageUrl: "https://images.unsplash.com/photo-1515516969-d4008cc6241a?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          hasTimer: true,
          timerDuration: 5
        },
        {
          instruction: "Drain the pasta and add it to the sauce. Mix well.",
          imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
          instruction: "Serve hot with grated cheese on top.",
          imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
      ],
      nutritionInfo: {
        calories: "450 kcal",
        protein: "12g",
        carbs: "65g",
        fat: "14g"
      }
    };
  } catch (error: any) {
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