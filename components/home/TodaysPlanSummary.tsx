import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define the spacing values if not imported from a constants file
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    pill: 9999,
  },
};

// Based on usage in app/(tabs)/index.tsx
interface RecipeInfo {
  id: string; // Added for navigation
  title: string;
  // Add other recipe properties if needed for display
}

export interface ScheduledMeal {
  id: string;
  mealType: string; // e.g., 'breakfast', 'lunch', 'dinner'
  reminderTime?: string; // HH:mm format
  recipe: {
    id: string;
    title: string;
    // Add other necessary recipe properties here if used (e.g., image, cookTime)
  };
}

interface TodaysPlanSummaryProps {
  meals: ScheduledMeal[];
  isLoading: boolean;
  onViewAllPress: () => void;
  onAddMealPress: () => void;
  onMealPress: (meal: ScheduledMeal) => void; // Handler for tapping a specific meal
}

const TodaysPlanSummary: React.FC<TodaysPlanSummaryProps> = ({
  meals,
  isLoading,
  onViewAllPress,
  onAddMealPress,
  onMealPress,
}) => {
  const getMealTypeColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return colors.accentYellow;
      case 'lunch':
        return colors.primary; // Assuming colors.primary is green
      case 'dinner':
        return colors.secondary; // Assuming colors.secondary is another color
      default:
        return colors.accentBlue;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Today's Plan</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllButtonText}>View All</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : meals.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyStateCard}
          onPress={onAddMealPress}
          accessibilityLabel="No meals planned yet for today. Tap to plan meals"
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={colors.primary}
            style={styles.emptyStateIcon}
          />
          <Text style={styles.emptyStateText}>Plan your meals for today</Text>
          <Ionicons
            name="chevron-forward-outline"
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.mealListContainer}>
          {meals.map((meal) => {
            const today = format(new Date(), 'yyyy-MM-dd'); // Needed for date-fns format
            return (
              <TouchableOpacity
                key={meal.id}
                style={styles.mealPlanItem}
                onPress={() => onMealPress(meal)}
                accessibilityLabel={`${meal.mealType} - ${meal.recipe.title} ${meal.reminderTime ? `at ${format(new Date(`${today}T${meal.reminderTime}`), 'h:mm a')}` : ''}`}
              >
                <View style={[styles.mealTypeIndicator, { backgroundColor: getMealTypeColor(meal.mealType) }]} />
                <View style={styles.mealPlanTimeContainer}>
                  <Text style={styles.mealPlanTime}>
                    {meal.reminderTime ? format(new Date(`${today}T${meal.reminderTime}`), 'h:mm a') : ''}
                  </Text>
                  <Text style={[styles.mealPlanType, { color: getMealTypeColor(meal.mealType) }]}>
                    {meal.mealType}
                  </Text>
                </View>
                <View style={styles.mealPlanDetails}>
                  <Text style={styles.mealPlanTitle} numberOfLines={1}>
                    {meal.recipe.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.editMealButton}
                    onPress={onViewAllPress}
                    accessibilityLabel={`Edit ${meal.mealType} - ${meal.recipe.title}`}
                  >
                    <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={onAddMealPress}
            accessibilityLabel="Add meal to today's plan"
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.addMealText}>Add meal to today's plan</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...(typography.heading2 || { fontSize: 22, fontWeight: 'bold' }), // Fallback if heading2 not in typography
    color: colors.text || '#000000', // Fallback for textPrimary
  },
  viewAllButtonText: {
    ...(typography.button || { fontSize: 16, fontWeight: '600' }), // Fallback for button
    color: colors.primary || '#4CAF50', // Fallback for primaryGreen
  },
  emptyStateCard: {
    backgroundColor: '#FEF7F0', // colors.surface or similar light peach/beige
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // This might cause space between icon, text, and arrow
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateIcon: {
    marginRight: spacing.md,
  },
  emptyStateText: {
    ...(typography.body1 || { fontSize: 16 }), // Fallback for body1
    color: colors.text || '#000000', // Fallback for textPrimary
    flex: 1, // Allow text to take space before arrow
  },
  mealListContainer: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginTop: 8, // Added margin-top to match old styles if needed
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  mealPlanItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 4, // Added slight horizontal padding
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center',
  },
  mealTypeIndicator: {
    width: 4,
    height: '70%', // Adjust height as needed
    borderRadius: 2,
    marginRight: 8,
  },
  mealPlanTimeContainer: {
    width: 80, // Fixed width for time/type column
    paddingRight: 10,
  },
  mealPlanTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mealPlanType: {
    ...typography.caption,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  mealPlanDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 4, // Added slight padding
  },
  mealPlanTitle: {
    ...typography.body1,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  editMealButton: {
    padding: 6, // Added padding to make it easier to press
    borderRadius: 12,
    backgroundColor: colors.cardAlt, // Subtle background
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content
    paddingVertical: 12,
    marginTop: 8,
  },
  addMealText: {
    ...typography.body2,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default TodaysPlanSummary;
