import { Platform } from 'react-native';

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
  }[];
  nutritionInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

// This is a mock service for generating recipes
// In a real app, this would call your backend API which would then call the AI services
export async function generateRecipe(ingredients: string): Promise<Recipe> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo purposes, we'll return a mock recipe
  // In a real implementation, this would call your backend API
  return {
    title: "Pasta with " + ingredients.split(',')[0],
    description: "A delicious pasta dish made with " + ingredients,
    servings: 4,
    prepTime: "15 min",
    cookTime: "20 min",
    heroImage: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=2940&auto=format&fit=crop",
    ingredients: ingredients.split(',').map(i => i.trim()),
    steps: [
      {
        instruction: "Boil water in a large pot and add salt.",
        imageUrl: "https://images.unsplash.com/photo-1626197031507-c17099753214?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        instruction: "Add pasta to the boiling water and cook according to package instructions.",
        imageUrl: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=2865&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        instruction: "Heat olive oil in a pan and add garlic.",
        imageUrl: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        instruction: "Add the remaining ingredients and cook for 5 minutes.",
        imageUrl: "https://images.unsplash.com/photo-1515516969-d4008cc6241a?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        instruction: "Drain the pasta and add it to the sauce. Mix well.",
        imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
        instruction: "Serve hot with grated cheese on top.",
        imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      }
    ]
  };
}

// In a real implementation, this would call the AI API to generate a recipe
export async function generateRecipeWithAI(ingredients: string): Promise<Recipe> {
  try {
    // This is where you would call your backend API
    // For now, we'll use the mock function
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef who creates delicious recipes based on available ingredients. Provide detailed, step-by-step instructions. Format your response as JSON with the following structure: { "title": "Recipe Title", "description": "Brief description", "servings": 4, "prepTime": "15 min", "cookTime": "30 min", "ingredients": ["Ingredient 1", "Ingredient 2"], "steps": [{"instruction": "Step 1 instruction"}, {"instruction": "Step 2 instruction"}] }'
          },
          {
            role: 'user',
            content: `Create a recipe using these ingredients: ${ingredients}. Be creative but practical. Make sure the recipe is actually good and uses the ingredients efficiently.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate recipe');
    }

    const data = await response.json();
    
    try {
      // Parse the completion as JSON
      const recipeData = JSON.parse(data.completion);
      
      // Return the recipe data
      return recipeData;
    } catch (parseError) {
      console.error('Failed to parse recipe JSON:', parseError);
      // Fallback to mock recipe if parsing fails
      return generateRecipe(ingredients);
    }
  } catch (error) {
    console.error('Error generating recipe with AI:', error);
    // Fallback to mock recipe if API call fails
    return generateRecipe(ingredients);
  }
}