import { Recipe } from '@/services/recipeService';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface ScheduledMeal {
  id: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  recipe: Recipe;
  notificationsEnabled: boolean;
  reminderTime?: string;
}

export interface MealItemProps {
  mealType: MealType;
  meal?: ScheduledMeal;
  onAddRecipe: () => void; // For adding a new recipe to an empty slot
  onRecipePress: (recipeId: string) => void; // For viewing a planned recipe
  onRemoveRecipe: (mealId: string) => void; // For removing a planned recipe
  onChangeRecipe: (mealId: string) => void; // For changing a planned recipe
}

export interface RecipeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export interface ReminderSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSetReminder: (reminderTime: string) => void;
  mealType: MealType;
}

export interface WeekCalendarProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}
