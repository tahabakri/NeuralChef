import { Recipe } from '@/services/recipeService'; // Import the main Recipe type

// SampleRecipe interface removed

export const todayRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Penne pasta tomato',
    description: 'A quick and delicious penne pasta with a rich tomato sauce.',
    servings: 2,
    prepTime: '30 MIN',
    cookTime: '20 min',
    ingredients: ['Penne pasta', 'Tomato sauce', 'Onion', 'Garlic', 'Olive oil', 'Parmesan cheese'],
    steps: [
      { instruction: 'Cook penne pasta according to package directions.' },
      { instruction: 'Sauté onion and garlic in olive oil.' },
      { instruction: 'Add tomato sauce and simmer.' },
      { instruction: 'Combine pasta and sauce, serve with Parmesan.' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop', // Replaced placeholder
    difficulty: 'EASY',
    category: 'Dinner',
    nutritionInfo: { calories: '450 kcal' },
    rating: 4.8
    // Note: 'time' and 'rating' were part of SampleRecipe and are not standard in the main Recipe type from recipeService.ts
    // 'author' was also from SampleRecipe.
    // The RecommendedRecipes component uses recipe.time and recipe.rating and recipe.difficulty directly for display.
    // We might need to adjust RecommendedRecipes or ensure these fields are added to the main Recipe type if they are consistently needed for display.
  },
  {
    id: '2',
    title: 'Stuffed with chicken',
    description: 'Flavorful chicken breasts stuffed with a creamy filling.',
    servings: 4,
    prepTime: '40 MIN',
    cookTime: '25 min',
    ingredients: ['Chicken breasts', 'Cream cheese', 'Spinach', 'Garlic powder', 'Breadcrumbs'],
    steps: [
      { instruction: 'Preheat oven and prepare chicken breasts.' },
      { instruction: 'Mix stuffing ingredients.' },
      { instruction: 'Stuff chicken breasts and coat with breadcrumbs.' },
      { instruction: 'Bake until golden brown and cooked through.' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop', // Replaced placeholder
    difficulty: 'MEDIUM',
    category: 'Dinner',
    nutritionInfo: { calories: '550 kcal' },
    rating: 5.0
  },
  {
    id: '3',
    title: 'Muffins with cocoa cream',
    description: 'Deliciously moist muffins with a rich cocoa cream topping.',
    servings: 12,
    prepTime: '20 Min',
    cookTime: '20 min',
    ingredients: ['Flour', 'Sugar', 'Cocoa powder', 'Eggs', 'Milk', 'Butter', 'Heavy cream'],
    steps: [
      { instruction: 'Mix dry ingredients for muffins.' },
      { instruction: 'Mix wet ingredients and combine with dry.' },
      { instruction: 'Bake muffins until cooked through.' },
      { instruction: 'Prepare cocoa cream and top cooled muffins.' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=2070&auto=format&fit=crop', // Replaced placeholder (was pancakes, good enough for muffin placeholder)
    difficulty: 'EASY',
    category: 'Dessert',
    nutritionInfo: { calories: '250 kcal per muffin' },
    rating: 5.0,
    author: 'Emma Olivia'
  },
  {
    id: '4',
    title: 'Beef doner with bread',
    description: 'A satisfying beef doner served with fresh bread and salad.',
    servings: 2,
    prepTime: '25 MIN',
    cookTime: '15 min',
    ingredients: ['Beef slices', 'Pita bread', 'Lettuce', 'Tomato', 'Onion', 'Yogurt sauce'],
    steps: [
      { instruction: 'Marinate and cook beef slices.' },
      { instruction: 'Warm pita bread.' },
      { instruction: 'Assemble doner with beef, salad, and sauce in pita.' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=2070&auto=format&fit=crop', // Replaced placeholder
    difficulty: 'MEDIUM',
    category: 'Lunch/Dinner',
    nutritionInfo: { calories: '600 kcal' },
    rating: 4.9
  },
  // Add more sample recipes if needed
]; 