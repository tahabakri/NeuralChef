import { Recipe } from '@/services/recipeService'; // Import the main Recipe type

// SampleRecipe interface removed

export const todayRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Penne pasta tomato',
    description: 'A quick and delicious penne pasta with a rich tomato sauce.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    servings: 2,
    prepTime: 30,
    cookTime: 20,
    difficulty: 'Easy',
    rating: 4.8,
    tags: ['pasta', 'italian', 'dinner'],
    ingredients: [
      { name: 'Penne pasta', quantity: '200', unit: 'g' },
      { name: 'Tomato sauce', quantity: '1', unit: 'cup' },
      { name: 'Onion', quantity: '1', unit: 'medium' },
      { name: 'Garlic', quantity: '2', unit: 'cloves' },
      { name: 'Olive oil', quantity: '2', unit: 'tbsp' },
      { name: 'Parmesan cheese', quantity: '1/4', unit: 'cup' }
    ],
    steps: [
      { description: 'Cook penne pasta according to package directions.', time: 10 },
      { description: 'Sauté onion and garlic in olive oil.', time: 5 },
      { description: 'Add tomato sauce and simmer.', time: 10 },
      { description: 'Combine pasta and sauce, serve with Parmesan.', time: 2 }
    ],
    nutritionalInfo: {
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 12
    }
  },
  {
    id: '2',
    title: 'Stuffed with chicken',
    description: 'Flavorful chicken breasts stuffed with a creamy filling.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
    servings: 4,
    prepTime: 40,
    cookTime: 25,
    difficulty: 'Medium',
    rating: 5.0,
    tags: ['chicken', 'dinner', 'protein'],
    ingredients: [
      { name: 'Chicken breasts', quantity: '4', unit: 'pieces' },
      { name: 'Cream cheese', quantity: '200', unit: 'g' },
      { name: 'Spinach', quantity: '1', unit: 'cup' },
      { name: 'Garlic powder', quantity: '1', unit: 'tsp' },
      { name: 'Breadcrumbs', quantity: '1/2', unit: 'cup' }
    ],
    steps: [
      { description: 'Preheat oven and prepare chicken breasts.', time: 5 },
      { description: 'Mix stuffing ingredients.', time: 10 },
      { description: 'Stuff chicken breasts and coat with breadcrumbs.', time: 15 },
      { description: 'Bake until golden brown and cooked through.', time: 25 }
    ],
    nutritionalInfo: {
      calories: 550,
      protein: 45,
      carbs: 15,
      fat: 30
    }
  },
  {
    id: '3',
    title: 'Muffins with cocoa cream',
    description: 'Deliciously moist muffins with a rich cocoa cream topping.',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=2070&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=2070&auto=format&fit=crop',
    servings: 12,
    prepTime: 20,
    cookTime: 20,
    difficulty: 'Easy',
    rating: 5.0,
    author: 'Emma Olivia',
    tags: ['dessert', 'baking', 'sweet'],
    ingredients: [
      { name: 'Flour', quantity: '2', unit: 'cups' },
      { name: 'Sugar', quantity: '1', unit: 'cup' },
      { name: 'Cocoa powder', quantity: '1/3', unit: 'cup' },
      { name: 'Eggs', quantity: '2', unit: 'large' },
      { name: 'Milk', quantity: '1', unit: 'cup' },
      { name: 'Butter', quantity: '1/2', unit: 'cup' },
      { name: 'Heavy cream', quantity: '1', unit: 'cup' }
    ],
    steps: [
      { description: 'Mix dry ingredients for muffins.', time: 5 },
      { description: 'Mix wet ingredients and combine with dry.', time: 5 },
      { description: 'Bake muffins until cooked through.', time: 20 },
      { description: 'Prepare cocoa cream and top cooled muffins.', time: 10 }
    ],
    nutritionalInfo: {
      calories: 250,
      protein: 5,
      carbs: 35,
      fat: 12
    }
  },
  {
    id: '4',
    title: 'Beef doner with bread',
    description: 'A satisfying beef doner served with fresh bread and salad.',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=2070&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=2070&auto=format&fit=crop',
    servings: 2,
    prepTime: 25,
    cookTime: 15,
    difficulty: 'Medium',
    rating: 4.9,
    tags: ['beef', 'sandwich', 'lunch', 'dinner'],
    ingredients: [
      { name: 'Beef slices', quantity: '300', unit: 'g' },
      { name: 'Pita bread', quantity: '2', unit: 'pieces' },
      { name: 'Lettuce', quantity: '1', unit: 'cup' },
      { name: 'Tomato', quantity: '1', unit: 'medium' },
      { name: 'Onion', quantity: '1/2', unit: 'medium' },
      { name: 'Yogurt sauce', quantity: '1/4', unit: 'cup' }
    ],
    steps: [
      { description: 'Marinate and cook beef slices.', time: 15 },
      { description: 'Warm pita bread.', time: 2 },
      { description: 'Assemble doner with beef, salad, and sauce in pita.', time: 5 }
    ],
    nutritionalInfo: {
      calories: 600,
      protein: 40,
      carbs: 45,
      fat: 28
    }
  },
  // Add more sample recipes if needed
]; 