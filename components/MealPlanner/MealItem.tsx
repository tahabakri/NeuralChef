import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { MealItemProps, MealType } from './types';

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner'
};

const MEAL_TYPE_ICONS: Record<MealType, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline'
};

export default function MealItem({ mealType, meal, onPress, onItemPress, onSetReminderPress }: MealItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Ionicons 
            name={MEAL_TYPE_ICONS[mealType]} 
            size={24} 
            color={colors.textSecondary} 
          />
          <Text style={styles.mealTypeText}>{MEAL_TYPE_LABELS[mealType]}</Text>
        </View>
      </View>

      {meal ? (
        <TouchableOpacity 
          style={styles.contentContainer}
          onPress={() => onItemPress?.(meal)}
        >
          <View style={styles.mealInfo}>
            <Text style={styles.recipeName}>{meal.recipe.title}</Text>
            {meal.recipe.cookTime && (
              <Text style={styles.cookTime}>
                {meal.recipe.cookTime} mins
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.reminderButton,
              meal.notificationsEnabled && styles.reminderButtonActive
            ]}
            onPress={() => onSetReminderPress?.(meal)}
          >
            <Ionicons 
              name={meal.notificationsEnabled ? "notifications" : "notifications-outline"} 
              size={20} 
              color={meal.notificationsEnabled ? colors.white : colors.textSecondary} 
            />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => onPress()}
        >
          <Ionicons name="add-outline" size={24} color={colors.primary} />
          <Text style={styles.addButtonText}>Add a recipe</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeText: {
    ...typography.subtitle1,
    color: colors.text,
    marginLeft: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  mealInfo: {
    flex: 1,
    marginRight: 12,
  },
  recipeName: {
    ...typography.bodyLarge,
    color: colors.text,
    marginBottom: 4,
  },
  cookTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reminderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderButtonActive: {
    backgroundColor: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    ...typography.bodyLarge,
    color: colors.primary,
    marginLeft: 8,
  },
});
