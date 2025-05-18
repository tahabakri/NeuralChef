/**
 * A list of common ingredients for autocomplete suggestions
 */
export const commonIngredients = [
  // Proteins
  "Chicken",
  "Beef",
  "Pork",
  "Salmon",
  "Tuna",
  "Shrimp",
  "Tofu",
  "Eggs",
  "Ground Turkey",
  "Bacon",
  
  // Dairy
  "Milk",
  "Butter",
  "Cheese",
  "Cream",
  "Yogurt",
  "Sour Cream",
  "Cream Cheese",
  "Parmesan Cheese",
  "Cheddar Cheese",
  "Mozzarella",
  
  // Vegetables
  "Onions",
  "Garlic",
  "Tomatoes",
  "Potatoes",
  "Carrots",
  "Broccoli",
  "Spinach",
  "Bell Peppers",
  "Lettuce",
  "Mushrooms",
  "Corn",
  "Peas",
  "Celery",
  "Cucumber",
  "Zucchini",
  "Cabbage",
  "Kale",
  
  // Fruits
  "Apples",
  "Bananas",
  "Oranges",
  "Lemons",
  "Limes",
  "Strawberries",
  "Blueberries",
  "Avocado",
  "Grapes",
  "Pineapple",
  
  // Grains & Starches
  "Rice",
  "Pasta",
  "Bread",
  "Flour",
  "Oats",
  "Quinoa",
  "Couscous",
  "Barley",
  "Tortillas",
  
  // Beans & Legumes
  "Black Beans",
  "Chickpeas",
  "Lentils",
  "Kidney Beans",
  "Pinto Beans",
  
  // Nuts & Seeds
  "Almonds",
  "Walnuts",
  "Peanuts",
  "Cashews",
  "Chia Seeds",
  "Flax Seeds",
  "Sesame Seeds",
  
  // Herbs & Spices
  "Basil",
  "Cilantro",
  "Parsley",
  "Rosemary",
  "Thyme",
  "Cinnamon",
  "Cumin",
  "Paprika",
  "Oregano",
  "Black Pepper",
  "Salt",
  "Ginger",
  "Turmeric",
  
  // Oils & Condiments
  "Olive Oil",
  "Vegetable Oil",
  "Soy Sauce",
  "Vinegar",
  "Honey",
  "Maple Syrup",
  "Mustard",
  "Ketchup",
  "Mayonnaise",
  "Hot Sauce",
  "Worcestershire Sauce",
  
  // Canned Goods
  "Canned Tomatoes",
  "Tomato Paste",
  "Chicken Broth",
  "Beef Broth",
  "Coconut Milk",
];

export const popularCombinations = [
  {
    id: '1',
    name: 'Pasta Dinner',
    ingredients: ['pasta', 'tomatoes', 'garlic', 'olive oil', 'basil'],
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
  },
  {
    id: '2',
    name: 'Taco Night',
    ingredients: ['ground beef', 'tortilla', 'onion', 'tomato', 'lettuce', 'cheese'],
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
  },
  {
    id: '3',
    name: 'Stir Fry',
    ingredients: ['chicken', 'broccoli', 'bell pepper', 'soy sauce', 'rice'],
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
  },
  {
    id: '4',
    name: 'Breakfast',
    ingredients: ['eggs', 'bacon', 'bread', 'avocado', 'tomato'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
  },
  {
    id: '5',
    name: 'Soup',
    ingredients: ['chicken', 'carrot', 'celery', 'onion', 'noodles'],
    image: 'https://images.unsplash.com/photo-1603105037303-f0b9629d3a34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80',
  },
];

// Additional specialized lists
export const nonFoodItems = [
  'screwdriver',
  'hammer',
  'wrench',
  'napkin',
  'fork',
  'spoon',
  'knife',
  'plate',
  'chair',
  'table',
  'lamp',
  'computer',
  'phone',
  'toothbrush',
  'soap',
  'battery',
  'cable',
  'book',
  'pen',
  'pencil'
];

// Fuzzy matching for ingredients
export function validateIngredient(ingredient: string): boolean | string {
  // Convert to lowercase for case-insensitive comparison
  const input = ingredient.toLowerCase().trim();
  
  // Check if it's in our common ingredients list
  if (commonIngredients.some(item => 
      item.toLowerCase() === input || 
      input.includes(item.toLowerCase()))) {
    return true;
  }
  
  // Check if it's a non-food item
  if (nonFoodItems.some(item => input.includes(item.toLowerCase()))) {
    return "This doesn't appear to be a food ingredient";
  }
  
  // Check for common measurements with numbers
  const hasMeasurement = /^\d+(\.\d+)?\s*(g|kg|oz|lb|cup|tbsp|tsp|ml|l)/i.test(input);
  if (hasMeasurement) {
    return true;
  }
  
  // If it's very short (less than 3 chars) and not found, probably not valid
  if (input.length < 3) {
    return "Ingredient name is too short";
  }
  
  // Allow it but flag as potentially unrecognized if we can't confirm
  return true;
}

/**
 * Popular ingredients for recipe suggestions
 */
export const popularIngredients = [
  'chicken',
  'beef',
  'onion',
  'garlic',
  'tomato',
  'potato',
  'rice',
  'pasta',
  'olive oil',
  'salt',
  'pepper',
  'butter',
  'cheese',
  'milk',
  'eggs',
  'carrot',
  'bell pepper',
  'broccoli',
  'mushroom',
  'spinach',
  'lemon',
  'lime',
  'soy sauce',
  'ginger',
  'cilantro',
  'basil',
  'thyme',
  'rosemary',
  'flour',
  'sugar',
  'honey',
  'bacon',
  'shrimp',
  'salmon',
  'tuna',
  'avocado',
  'corn',
  'cucumber',
  'zucchini',
  'eggplant'
];

/**
 * Meal categories
 */
export const mealCategories = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Appetizer',
  'Side Dish',
  'Drink'
];

/**
 * Dietary restrictions
 */
export const dietaryRestrictions = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Fat',
  'Low-Sodium',
  'High-Protein',
  'Nut-Free',
  'Egg-Free',
  'Soy-Free'
]; 