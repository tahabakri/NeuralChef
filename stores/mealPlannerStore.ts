import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays, parseISO } from 'date-fns';
import { MealType, ScheduledMeal } from '@/components/MealPlanner/types';

interface MealPlannerState {
  selectedDate: string;
  scheduledMeals: ScheduledMeal[];
  
  // Actions
  setSelectedDate: (date: string) => void;
  scheduleMeal: (meal: ScheduledMeal) => void;
  removeMeal: (mealId: string) => void;
  toggleMealNotification: (mealId: string) => void;
  setMealReminderTime: (mealId: string, reminderTime: string) => void;
  getNextWeekDates: () => string[];
  getMealsForDateAndType: (date: string, type: MealType) => ScheduledMeal[];
}

export const useMealPlannerStore = create<MealPlannerState>()(
  persist(
    (set, get) => ({
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      scheduledMeals: [],

      setSelectedDate: (date) => set({ selectedDate: date }),

      scheduleMeal: (meal) => set((state) => ({
        scheduledMeals: [
          ...state.scheduledMeals.filter(m => m.id !== meal.id),
          meal
        ]
      })),

      removeMeal: (mealId) => set((state) => ({
        scheduledMeals: state.scheduledMeals.filter(meal => meal.id !== mealId)
      })),

      toggleMealNotification: (mealId) => set((state) => ({
        scheduledMeals: state.scheduledMeals.map(meal =>
          meal.id === mealId
            ? { ...meal, notificationsEnabled: !meal.notificationsEnabled }
            : meal
        )
      })),

      setMealReminderTime: (mealId, reminderTime) => set((state) => ({
        scheduledMeals: state.scheduledMeals.map(meal =>
          meal.id === mealId
            ? { ...meal, reminderTime }
            : meal
        )
      })),

      getNextWeekDates: () => {
        const dates: string[] = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
          dates.push(format(addDays(today, i), 'yyyy-MM-dd'));
        }
        
        return dates;
      },

      getMealsForDateAndType: (date, type) => {
        const { scheduledMeals } = get();
        return scheduledMeals.filter(
          meal => meal.date === date && meal.mealType === type
        );
      },
    }),
    {
      name: 'reciptai-meal-planner-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
