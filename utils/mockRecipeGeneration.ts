import { commonIngredients } from '@/constants/ingredients';

// Types for recipe generation
export interface RecipeStep {
  id: string;
  instruction: string;
  durationMinutes?: number;
  imageUrl?: string; // URL for generated or fallback image
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  ingredients: string[];
  steps: RecipeStep[];
  nutritionFacts?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface RecipePreferences {
  dietaryRestrictions?: ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb')[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  cookingTime?: 'quick' | 'medium' | 'slow';
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  cuisine?: string;
  excludeIngredients?: string[];
}

// Mock recipe templates organized by main ingredient
const recipeTemplates: Record<string, GeneratedRecipe[]> = {
  chicken: [
    {
      title: 'Garlic Butter Chicken',
      description: 'Juicy chicken breast cooked in a rich garlic butter sauce. Perfect for a quick weeknight meal.',
      servings: 2,
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      difficulty: 'easy',
      tags: ['chicken', 'quick', 'high-protein', 'low-carb'],
      ingredients: [
        '2 chicken breasts',
        '3 tbsp butter',
        '4 cloves garlic, minced',
        '1 tsp dried thyme',
        '1/2 tsp salt',
        '1/4 tsp black pepper',
        '2 tbsp olive oil',
        '2 tbsp fresh parsley, chopped'
      ],
      steps: [
        {
          id: '1',
          instruction: 'Season chicken breasts with salt and pepper on both sides.',
          durationMinutes: 2
        },
        {
          id: '2',
          instruction: 'Heat olive oil in a large skillet over medium-high heat.',
          durationMinutes: 1
        },
        {
          id: '3',
          instruction: 'Add chicken breasts to the skillet and cook for 5-6 minutes on each side until golden brown and cooked through (internal temperature of 165°F/75°C).',
          durationMinutes: 12
        },
        {
          id: '4',
          instruction: 'Remove chicken from the skillet and set aside on a plate.',
          durationMinutes: 1
        },
        {
          id: '5',
          instruction: 'In the same skillet, reduce heat to medium-low and add butter.',
          durationMinutes: 1
        },
        {
          id: '6',
          instruction: 'Once butter is melted, add minced garlic and dried thyme. Cook for 1-2 minutes until fragrant, being careful not to burn the garlic.',
          durationMinutes: 2
        },
        {
          id: '7',
          instruction: 'Return chicken to the skillet and spoon the garlic butter sauce over the chicken. Cook for another 1-2 minutes.',
          durationMinutes: 2
        },
        {
          id: '8',
          instruction: 'Garnish with fresh parsley and serve hot.',
          durationMinutes: 1
        }
      ],
      nutritionFacts: {
        calories: 420,
        protein: 38,
        carbs: 3,
        fat: 28
      }
    },
    {
      title: 'Lemon Herb Roasted Chicken',
      description: 'Tender chicken thighs roasted with lemon and herbs for a flavorful, easy dinner.',
      servings: 4,
      prepTimeMinutes: 15,
      cookTimeMinutes: 45,
      difficulty: 'medium',
      tags: ['chicken', 'roasted', 'dinner'],
      ingredients: [
        '8 chicken thighs, bone-in, skin-on',
        '2 lemons, 1 sliced and 1 juiced',
        '4 cloves garlic, minced',
        '2 tbsp olive oil',
        '1 tbsp fresh rosemary, chopped',
        '1 tbsp fresh thyme, chopped',
        '1 tsp salt',
        '1/2 tsp black pepper',
        '1/2 cup chicken broth'
      ],
      steps: [
        {
          id: '1',
          instruction: 'Preheat oven to 400°F (200°C).',
          durationMinutes: 5
        },
        {
          id: '2',
          instruction: 'In a small bowl, combine olive oil, lemon juice, minced garlic, rosemary, thyme, salt, and pepper.',
          durationMinutes: 3
        },
        {
          id: '3',
          instruction: 'Place chicken thighs in a large baking dish and pour the marinade over them. Toss to coat evenly.',
          durationMinutes: 2
        },
        {
          id: '4',
          instruction: 'Arrange lemon slices among the chicken pieces.',
          durationMinutes: 1
        },
        {
          id: '5',
          instruction: 'Pour chicken broth into the bottom of the baking dish.',
          durationMinutes: 1
        },
        {
          id: '6',
          instruction: 'Roast in the preheated oven for 35-45 minutes, or until the chicken skin is crispy and golden, and the internal temperature reaches 165°F (75°C).',
          durationMinutes: 40
        },
        {
          id: '7',
          instruction: 'Let rest for 5 minutes before serving.',
          durationMinutes: 5
        },
        {
          id: '8',
          instruction: 'Serve with the pan juices spooned over the top.',
          durationMinutes: 2
        }
      ],
      nutritionFacts: {
        calories: 310,
        protein: 28,
        carbs: 4,
        fat: 21
      }
    }
  ],
  rice: [
    {
      title: 'Vegetable Fried Rice',
      description: 'A quick and easy vegetable fried rice that makes a perfect side dish or light main course.',
      servings: 4,
      prepTimeMinutes: 15,
      cookTimeMinutes: 10,
      difficulty: 'easy',
      tags: ['rice', 'vegetarian', 'quick', 'stir-fry'],
      ingredients: [
        '3 cups cooked rice, preferably day-old and cold',
        '2 tbsp vegetable oil',
        '1 small onion, diced',
        '2 cloves garlic, minced',
        '1 carrot, diced small',
        '1/2 cup frozen peas',
        '2 eggs, beaten',
        '3 tbsp soy sauce',
        '1 tsp sesame oil',
        '2 green onions, sliced',
        'Salt and pepper to taste'
      ],
      steps: [
        {
          id: '1',
          instruction: 'Heat 1 tablespoon of vegetable oil in a large wok or skillet over medium-high heat.',
          durationMinutes: 1
        },
        {
          id: '2',
          instruction: 'Add beaten eggs and scramble until just cooked, about 30 seconds. Remove eggs to a plate and set aside.',
          durationMinutes: 1
        },
        {
          id: '3',
          instruction: 'Add remaining tablespoon of oil to the wok. Add diced onion and carrot, stir-fry for 3-4 minutes until softened.',
          durationMinutes: 4
        },
        {
          id: '4',
          instruction: 'Add garlic and stir-fry for 30 seconds until fragrant.',
          durationMinutes: 1
        },
        {
          id: '5',
          instruction: 'Add cold rice to the wok, breaking up any clumps, and stir-fry for 2-3 minutes until heated through.',
          durationMinutes: 3
        },
        {
          id: '6',
          instruction: 'Add frozen peas and continue to stir-fry for 1-2 minutes.',
          durationMinutes: 2
        },
        {
          id: '7',
          instruction: 'Return the scrambled eggs to the wok, add soy sauce and sesame oil, and stir to combine everything well.',
          durationMinutes: 1
        },
        {
          id: '8',
          instruction: 'Stir in sliced green onions, season with salt and pepper to taste.',
          durationMinutes: 1
        },
        {
          id: '9',
          instruction: 'Serve hot as a side dish or add protein of your choice for a complete meal.',
          durationMinutes: 1
        }
      ],
      nutritionFacts: {
        calories: 280,
        protein: 8,
        carbs: 42,
        fat: 9
      }
    }
  ],
  beef: [
    {
      title: 'Classic Beef Stew',
      description: 'A hearty beef stew with tender meat, vegetables, and rich gravy. Perfect comfort food for cold days.',
      servings: 6,
      prepTimeMinutes: 30,
      cookTimeMinutes: 120,
      difficulty: 'medium',
      tags: ['beef', 'stew', 'comfort food', 'dinner', 'slow-cooked'],
      ingredients: [
        '2 pounds beef chuck, cut into 1-inch cubes',
        '1/4 cup all-purpose flour',
        '1 tsp salt',
        '1/2 tsp black pepper',
        '3 tbsp vegetable oil',
        '2 onions, chopped',
        '3 cloves garlic, minced',
        '2 carrots, sliced',
        '2 stalks celery, sliced',
        '2 potatoes, diced',
        '4 cups beef broth',
        '2 tbsp tomato paste',
        '1 tbsp Worcestershire sauce',
        '1 tsp dried thyme',
        '1 bay leaf',
        '1 cup frozen peas',
        'Fresh parsley for garnish'
      ],
      steps: [
        {
          id: '1',
          instruction: 'In a large bowl, combine flour, salt, and pepper. Add beef cubes and toss to coat evenly.',
          durationMinutes: 5
        },
        {
          id: '2',
          instruction: 'Heat oil in a large pot or Dutch oven over medium-high heat. Add beef in batches and brown on all sides, about 5 minutes per batch. Transfer to a plate.',
          durationMinutes: 15
        },
        {
          id: '3',
          instruction: 'In the same pot, add onions and cook until softened, about 5 minutes.',
          durationMinutes: 5
        },
        {
          id: '4',
          instruction: 'Add garlic and cook for 1 minute until fragrant.',
          durationMinutes: 1
        },
        {
          id: '5',
          instruction: 'Return beef to the pot. Add carrots, celery, potatoes, beef broth, tomato paste, Worcestershire sauce, thyme, and bay leaf.',
          durationMinutes: 5
        },
        {
          id: '6',
          instruction: 'Bring to a boil, then reduce heat to low. Cover and simmer for 1.5 to 2 hours, or until meat is tender.',
          durationMinutes: 90
        },
        {
          id: '7',
          instruction: 'Stir in frozen peas and cook for another 5 minutes.',
          durationMinutes: 5
        },
        {
          id: '8',
          instruction: 'Remove bay leaf, adjust seasoning if needed, and garnish with fresh parsley before serving.',
          durationMinutes: 2
        }
      ],
      nutritionFacts: {
        calories: 420,
        protein: 35,
        carbs: 25,
        fat: 20
      }
    }
  ],
  pasta: [
    {
      title: 'Creamy Garlic Pasta',
      description: 'A simple yet delicious creamy garlic pasta that comes together in minutes.',
      servings: 4,
      prepTimeMinutes: 5,
      cookTimeMinutes: 15,
      difficulty: 'easy',
      tags: ['pasta', 'vegetarian', 'quick', 'dinner'],
      ingredients: [
        '8 oz (250g) fettuccine or spaghetti',
        '2 tbsp butter',
        '4 cloves garlic, minced',
        '1 cup heavy cream',
        '1/2 cup grated Parmesan cheese',
        'Salt and black pepper to taste',
        'Fresh parsley, chopped for garnish',
        'Red pepper flakes (optional)'
      ],
      steps: [
        {
          id: '1',
          instruction: 'Cook pasta according to package instructions until al dente. Reserve 1/2 cup of pasta water before draining.',
          durationMinutes: 10
        },
        {
          id: '2',
          instruction: 'While pasta is cooking, melt butter in a large skillet over medium heat.',
          durationMinutes: 1
        },
        {
          id: '3',
          instruction: 'Add minced garlic and cook until fragrant, about 1-2 minutes, being careful not to burn it.',
          durationMinutes: 2
        },
        {
          id: '4',
          instruction: 'Pour in heavy cream and bring to a simmer. Cook for 3-4 minutes until it starts to thicken slightly.',
          durationMinutes: 4
        },
        {
          id: '5',
          instruction: 'Stir in grated Parmesan cheese until melted and smooth.',
          durationMinutes: 1
        },
        {
          id: '6',
          instruction: 'Add drained pasta to the sauce and toss to coat. If the sauce is too thick, add some reserved pasta water, a little at a time, until desired consistency is reached.',
          durationMinutes: 2
        },
        {
          id: '7',
          instruction: 'Season with salt and black pepper to taste.',
          durationMinutes: 1
        },
        {
          id: '8',
          instruction: 'Serve immediately, garnished with chopped parsley and red pepper flakes if desired.',
          durationMinutes: 1
        }
      ],
      nutritionFacts: {
        calories: 450,
        protein: 12,
        carbs: 40,
        fat: 28
      }
    }
  ]
};

// More recipe template categories can be added as needed

/**
 * Generates a recipe based on provided ingredients and preferences
 * @param ingredients - List of ingredients the user has
 * @param preferences - Optional user preferences for recipe generation
 * @returns A generated recipe based on the input
 */
export function generateRecipe(ingredients: string[], preferences?: RecipePreferences): GeneratedRecipe {
  // Determine the main ingredient from the list (pick the first recognizable one)
  let mainIngredient = findMainIngredient(ingredients);
  
  // Get available recipe templates for this main ingredient
  let availableTemplates = recipeTemplates[mainIngredient] || [];
  
  // If no templates for this main ingredient, use a default category or random one
  if (availableTemplates.length === 0) {
    const categories = Object.keys(recipeTemplates);
    mainIngredient = categories[Math.floor(Math.random() * categories.length)];
    availableTemplates = recipeTemplates[mainIngredient];
  }
  
  // Filter templates based on preferences if provided
  let filteredTemplates = availableTemplates;
  if (preferences) {
    filteredTemplates = filterTemplatesByPreferences(availableTemplates, preferences);
    
    // If no matching templates, fall back to the original list
    if (filteredTemplates.length === 0) {
      filteredTemplates = availableTemplates;
    }
  }
  
  // Pick a random template from the filtered list
  const selectedTemplate = filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
  
  // Combine the user's ingredients with template ingredients where possible
  const customizedRecipe = customizeRecipeWithIngredients(selectedTemplate, ingredients);
  
  return customizedRecipe;
}

/**
 * Regenerates a recipe with the same ingredients but different approach
 * @param ingredients - List of ingredients the user has
 * @param previousRecipe - The previously generated recipe to avoid
 * @param preferences - Optional user preferences
 * @returns A new recipe different from the previous one
 */
export function regenerateRecipe(
  ingredients: string[], 
  previousRecipe: GeneratedRecipe, 
  preferences?: RecipePreferences
): GeneratedRecipe {
  // Make multiple attempts to get a different recipe
  for (let i = 0; i < 5; i++) {
    const newRecipe = generateRecipe(ingredients, preferences);
    
    // Check if it's different enough from the previous recipe
    if (newRecipe.title !== previousRecipe.title) {
      return newRecipe;
    }
  }
  
  // If we couldn't get a different recipe, modify the existing one a bit
  const modifiedRecipe = { ...previousRecipe };
  
  // Change cooking times slightly
  modifiedRecipe.prepTimeMinutes = Math.max(5, previousRecipe.prepTimeMinutes + randomAdjustment(5));
  modifiedRecipe.cookTimeMinutes = Math.max(5, previousRecipe.cookTimeMinutes + randomAdjustment(10));
  
  // Modify the title a bit
  modifiedRecipe.title = modifyTitle(previousRecipe.title);
  
  // Reorder or slightly modify steps
  modifiedRecipe.steps = modifySteps(previousRecipe.steps);
  
  return modifiedRecipe;
}

// Helper function to find the main ingredient from a list of ingredients
function findMainIngredient(ingredients: string[]): string {
  // Priority list for main ingredients (proteins usually come first, then starches, etc.)
  const mainIngredientPriorities = [
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp',
    'rice', 'pasta', 'potato', 'quinoa'
  ];
  
  // Look for main ingredients in order of priority
  for (const priority of mainIngredientPriorities) {
    for (const ingredient of ingredients) {
      if (ingredient.toLowerCase().includes(priority)) {
        return priority;
      }
    }
  }
  
  // Default to a random category if no priority ingredient is found
  const categories = Object.keys(recipeTemplates);
  return categories[Math.floor(Math.random() * categories.length)];
}

// Filter recipe templates based on user preferences
function filterTemplatesByPreferences(templates: GeneratedRecipe[], preferences: RecipePreferences): GeneratedRecipe[] {
  return templates.filter(template => {
    // Filter by dietary restrictions
    if (preferences.dietaryRestrictions) {
      for (const restriction of preferences.dietaryRestrictions) {
        // Check if template meets this restriction
        if (restriction === 'vegetarian' && template.tags.includes('meat')) {
          return false;
        }
        if (restriction === 'vegan' && 
            (template.tags.includes('meat') || 
             template.tags.includes('dairy') || 
             template.tags.includes('eggs'))) {
          return false;
        }
        // Add other restrictions checks as needed
      }
    }
    
    // Filter by cooking time
    if (preferences.cookingTime) {
      const totalTime = template.prepTimeMinutes + template.cookTimeMinutes;
      if (preferences.cookingTime === 'quick' && totalTime > 30) {
        return false;
      }
      if (preferences.cookingTime === 'medium' && (totalTime < 30 || totalTime > 60)) {
        return false;
      }
      if (preferences.cookingTime === 'slow' && totalTime < 60) {
        return false;
      }
    }
    
    // Filter by skill level
    if (preferences.skillLevel && preferences.skillLevel !== template.difficulty) {
      if (preferences.skillLevel === 'beginner' && template.difficulty !== 'easy') {
        return false;
      }
      if (preferences.skillLevel === 'intermediate' && template.difficulty !== 'medium') {
        return false;
      }
      if (preferences.skillLevel === 'advanced' && template.difficulty !== 'hard') {
        return false;
      }
    }
    
    // Filter by excluded ingredients
    if (preferences.excludeIngredients && preferences.excludeIngredients.length > 0) {
      for (const ingredient of template.ingredients) {
        for (const excluded of preferences.excludeIngredients) {
          if (ingredient.toLowerCase().includes(excluded.toLowerCase())) {
            return false;
          }
        }
      }
    }
    
    return true;
  });
}

// Customize a recipe template with specific ingredients
function customizeRecipeWithIngredients(template: GeneratedRecipe, userIngredients: string[]): GeneratedRecipe {
  const customizedRecipe = { ...template };
  
  // Add user ingredients to recipe ingredients where they don't already exist
  const existingIngredients = new Set(customizedRecipe.ingredients.map(i => i.toLowerCase()));
  
  for (const ingredient of userIngredients) {
    // Check if this or a similar ingredient is already in the recipe
    const alreadyIncluded = Array.from(existingIngredients).some(existing => 
      existing.includes(ingredient.toLowerCase()) || 
      ingredient.toLowerCase().includes(existing)
    );
    
    if (!alreadyIncluded) {
      customizedRecipe.ingredients.push(ingredient);
      
      // Also update a step to include this ingredient
      if (customizedRecipe.steps.length > 3) {
        const stepIndex = Math.floor(Math.random() * (customizedRecipe.steps.length - 2)) + 1;
        customizedRecipe.steps[stepIndex].instruction += ` Add ${ingredient} as well.`;
      }
    }
  }
  
  return customizedRecipe;
}

// Helper function to get a random adjustment (positive or negative)
function randomAdjustment(maxAmount: number): number {
  return Math.floor(Math.random() * maxAmount * 2 + 1) - maxAmount;
}

// Helper function to modify a recipe title for regeneration
function modifyTitle(title: string): string {
  const adjectives = ['Delicious', 'Tasty', 'Flavorful', 'Homestyle', 'Classic', 'Savory', 'Easy'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  // Add an adjective if the title doesn't have one of these already
  const hasAdjective = adjectives.some(adj => title.includes(adj));
  if (!hasAdjective) {
    return `${randomAdjective} ${title}`;
  }
  
  // Or modify the format slightly
  return `${title} (Variation)`;
}

// Helper function to modify recipe steps for regeneration
function modifySteps(steps: RecipeStep[]): RecipeStep[] {
  const modifiedSteps = [...steps];
  
  // Make small changes to step durations
  modifiedSteps.forEach(step => {
    if (step.durationMinutes) {
      step.durationMinutes = Math.max(1, step.durationMinutes + randomAdjustment(2));
    }
  });
  
  // Add a bit more detail to a random step
  const enhancementPhrases = [
    'for best results',
    'to enhance flavor',
    'stirring occasionally',
    'until perfectly done',
    'with care'
  ];
  
  const randomStepIndex = Math.floor(Math.random() * modifiedSteps.length);
  const randomPhrase = enhancementPhrases[Math.floor(Math.random() * enhancementPhrases.length)];
  
  // Add the phrase if it doesn't already contain it
  if (!modifiedSteps[randomStepIndex].instruction.includes(randomPhrase)) {
    modifiedSteps[randomStepIndex].instruction += ` ${randomPhrase}.`;
  }
  
  return modifiedSteps;
} 