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
  onPress: () => void;
  onItemPress?: (meal: ScheduledMeal) => void;
  onSetReminderPress?: (meal: ScheduledMeal) => void;
  onRemovePress?: (meal: ScheduledMeal) => void;
  onSuggestPress?: () => void;
  isAiSuggesting?: boolean;
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
