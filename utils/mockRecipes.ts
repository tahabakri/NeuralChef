import { type Recipe } from '@/app/recipe/[id]'; // Assuming Recipe type is exported from [id].tsx or a types file

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Classic Tomato Pasta',
    description: 'A simple yet delicious pasta dish with a rich tomato sauce.',
    cookTime: 20,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Italian',
    ingredients: [
      { id: 'i1', name: 'Spaghetti', amount: '200g' },
      { id: 'i2', name: 'Canned Tomatoes', amount: '400g' },
      { id: 'i3', name: 'Garlic', amount: '2 cloves, minced' },
      { id: 'i4', name: 'Olive Oil', amount: '2 tbsp' },
      { id: 'i5', name: 'Basil', amount: 'a few leaves' },
      { id: 'i6', name: 'Salt', amount: 'to taste' },
      { id: 'i7', name: 'Pepper', amount: 'to taste' },
    ],
    steps: [
      { id: 's1', step: 1, description: 'Cook spaghetti according to package directions.' },
      { id: 's2', step: 2, description: 'While pasta cooks, heat olive oil in a pan. Add garlic and cook until fragrant.' },
      { id: 's3', step: 3, description: 'Add canned tomatoes, basil, salt, and pepper. Simmer for 10 minutes.' },
      { id: 's4', step: 4, description: 'Drain pasta and add to the sauce. Toss to combine.' },
      { id: 's5', step: 5, description: 'Serve immediately with a sprinkle of Parmesan if desired.' },
    ],
    image: 'https://images.unsplash.com/photo-1598866594240-a7161916025e', // Placeholder
    isSaved: false,
    rating: 4.5,
    calories: 350,
    protein: 12,
    mealType: 'Dinner',
  },
  {
    id: '2',
    title: 'Spicy Chicken Stir-fry',
    description: 'A quick and flavorful chicken stir-fry with a spicy kick.',
    cookTime: 25,
    prepTime: 20,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Asian',
    ingredients: [
      { id: 'c1', name: 'Chicken Breast', amount: '500g, sliced' },
      { id: 'c2', name: 'Soy Sauce', amount: '3 tbsp' },
      { id: 'c3', name: 'Broccoli Florets', amount: '1 head' },
      { id: 'c4', name: 'Red Bell Pepper', amount: '1, sliced' },
      { id: 'c5', name: 'Garlic', amount: '3 cloves, minced' },
      { id: 'c6', name: 'Ginger', amount: '1 inch, grated' },
      { id: 'c7', name: 'Chili Flakes', amount: '1 tsp (or to taste)' },
    ],
    steps: [
      { id: 'cs1', step: 1, description: 'Marinate chicken slices with soy sauce for 15 minutes.' },
      { id: 'cs2', step: 2, description: 'Heat oil in a wok or large skillet. Add garlic and ginger, stir-fry until fragrant.' },
      { id: 'cs3', step: 3, description: 'Add chicken and cook until browned and cooked through.' },
      { id: 'cs4', step: 4, description: 'Add broccoli and bell pepper. Stir-fry for 5-7 minutes until tender-crisp.' },
      { id: 'cs5', step: 5, description: 'Sprinkle with chili flakes. Mix well and serve hot with rice or noodles.' },
    ],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3', // Placeholder
    isSaved: true,
    rating: 4,
    calories: 450,
    protein: 35,
    mealType: 'Dinner',
  },
  {
    id: '3',
    title: 'Avocado Toast with Egg',
    description: 'A healthy and satisfying breakfast or light meal.',
    cookTime: 10,
    prepTime: 5,
    servings: 1,
    difficulty: 'Easy',
    cuisine: 'Modern',
    ingredients: [
      { id: 'a1', name: 'Whole-wheat Bread', amount: '2 slices' },
      { id: 'a2', name: 'Avocado', amount: '1 ripe' },
      { id: 'a3', name: 'Egg', amount: '1 or 2' },
      { id: 'a4', name: 'Red Pepper Flakes', amount: 'a pinch' },
      { id: 'a5', name: 'Salt', amount: 'to taste' },
      { id: 'a6', name: 'Pepper', amount: 'to taste' },
    ],
    steps: [
      { id: 'as1', step: 1, description: 'Toast bread slices to your liking.' },
      { id: 'as2', step: 2, description: 'Mash avocado in a bowl. Season with salt and pepper.' },
      { id: 'as3', step: 3, description: 'Cook egg as desired (fried, poached, or scrambled).' },
      { id: 'as4', step: 4, description: 'Spread mashed avocado on toast. Top with cooked egg.' },
      { id: 'as5', step: 5, description: 'Sprinkle with red pepper flakes and serve immediately.' },
    ],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8', // Placeholder
    isSaved: false,
    rating: 5,
    calories: 300,
    protein: 15,
    mealType: 'Lunch', // Set as Lunch
  },
];

// Helper function to get a recipe by ID
export const getMockRecipeById = (recipeId: string): Recipe | undefined => {
  return MOCK_RECIPES.find(recipe => recipe.id === recipeId);
};
