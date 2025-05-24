import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import LottieView from 'lottie-react-native'; // Assuming Lottie is installed

// Define the spacing values
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 14,
  xl: 12,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16, // Added for consistency
    pill: 9999,
  },
};

export interface ScheduledMeal {
  id: string;
  mealType: string; // e.g., 'breakfast', 'lunch', 'dinner'
  reminderTime?: string; // HH:mm format
  recipe: {
    id: string;
    title: string;
    imageUrl?: string; // Added for thumbnail
  };
}

interface TodaysPlanSummaryProps {
  meals: ScheduledMeal[];
  isLoading: boolean;
  onViewAllPress: () => void;
  onAddMealPress: () => void;
  onMealPress: (meal: ScheduledMeal) => void;
  onEditMealPress: (mealId: string) => void; // Added for editing
  onDeleteMealPress: (mealId: string) => void; // Added for deleting
}

const TodaysPlanSummary: React.FC<TodaysPlanSummaryProps> = ({
  meals,
  isLoading,
  onViewAllPress,
  onAddMealPress,
  onMealPress,
  onEditMealPress,
  onDeleteMealPress,
}) => {
  const getMealTypeColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return colors.accentYellow;
      case 'lunch':
        return colors.primary;
      case 'dinner':
        return colors.secondary;
      default:
        return colors.accentBlue;
    }
  };

  const renderEmptyState = () => (
    <TouchableOpacity
      style={styles.emptyStateCard}
      onPress={onAddMealPress}
      accessibilityLabel="No meals planned yet for today. Tap to plan meals"
    >
      <LottieView
        source={require('@/assets/animations/empty-state.json')} // Replace with your actual Lottie file
        autoPlay
        loop
        style={styles.emptyStateLottie}
      />
      <View style={styles.emptyStateTextContainer}>
        <Text style={styles.emptyStateTitle}>No Meals Yet!</Text>
        <Text style={styles.emptyStateSubtitle}>Tap here to plan your delicious day.</Text>
      </View>
      <Ionicons
        name="chevron-forward-outline"
        size={22}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Today's Plan</Text>
        {meals.length > 0 && ( // Only show "View All" if there are meals
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={styles.viewAllButtonText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : meals.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.mealListContainer}>
          {meals.map((meal) => {
            const today = format(new Date(), 'yyyy-MM-dd');
            return (
              <TouchableOpacity
                key={meal.id}
                style={styles.mealPlanItem}
                onPress={() => onMealPress(meal)}
                accessibilityLabel={`${meal.mealType} - ${meal.recipe.title}`}
              >
                <Text style={styles.mealIcon}>🍴</Text>
                <View style={styles.mealTypeLabelsContainer}>
                  <Text style={styles.mealTypeLabelMain}>{meal.mealType.toUpperCase()}</Text>
                  <Text style={styles.mealTypeLabelSub}>{meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</Text>
                </View>
                <Text style={styles.mealPlanTitle} numberOfLines={1}>
                  {meal.recipe.title}
                </Text>
                <View style={styles.mealActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => { e.stopPropagation(); onEditMealPress(meal.id); }}
                    accessibilityLabel={`Edit ${meal.mealType} - ${meal.recipe.title}`}
                  >
                    <Ionicons name="pencil-outline" size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => { e.stopPropagation(); onDeleteMealPress(meal.id); }}
                    accessibilityLabel={`Delete ${meal.mealType} - ${meal.recipe.title}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
          {meals.length > 0 && ( // Only show if there are meals
            <TouchableOpacity
              style={styles.addMealButton}
              onPress={onAddMealPress}
              accessibilityLabel="Add another meal to today's plan"
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.accentOrange} />
              <Text style={styles.addMealText}>Add Another Meal</Text>
            </TouchableOpacity>
          )}
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
    ...(typography.heading2 || { fontSize: 22, fontWeight: 'bold' }),
    color: colors.text || '#000000',
  },
  viewAllButtonText: {
    ...(typography.button || { fontSize: 16, fontWeight: '600' }),
    color: colors.primary || '#4CAF50',
  },
  emptyStateCard: {
    backgroundColor: colors.cardAlt || '#FEF7F0',
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginTop: spacing.sm,
  },
  emptyStateLottie: {
    width: 60,
    height: 60,
    marginRight: spacing.sm,
  },
  emptyStateTextContainer: {
    flex: 1,
  },
  emptyStateTitle: {
    ...(typography.subtitle1 || { fontSize: 16, fontWeight: 'bold' }),
    color: colors.text,
  },
  emptyStateSubtitle: {
    ...(typography.body2 || { fontSize: 14 }),
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  mealListContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xs, // Reduced padding
    borderRadius: spacing.borderRadius.xl,
    marginTop: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mealPlanItem: {
    flexDirection: 'row',
    paddingVertical: spacing.sm + 2, // Adjusted padding
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  mealTypeLabelsContainer: {
    width: 70, // Fixed width for alignment
    marginRight: spacing.sm,
  },
  mealTypeLabelMain: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  mealTypeLabelSub: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  mealPlanTitle: {
    ...typography.bodyMedium, // As per prompt
    color: colors.textPrimary,
    flex: 1, // Allow title to take remaining space
    marginRight: spacing.sm, // Space before action icons
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm -2, // Smaller padding for compact icons
    marginLeft: spacing.xs, // Space between icons
    borderRadius: spacing.borderRadius.pill,
    // backgroundColor: colors.background, // Optional subtle background
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md, // Increased padding
    marginTop: spacing.xs, // Reduced margin
  },
  addMealText: {
    ...typography.button, // Using button typography
    color: colors.accentOrange, // As per prompt
    marginLeft: spacing.sm,
    fontFamily: 'Poppins-SemiBold', // Assuming Poppins is available
  },
});

export default TodaysPlanSummary;
