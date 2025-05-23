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
                accessibilityLabel={`${meal.mealType} - ${meal.recipe.title} ${meal.reminderTime ? `at ${format(new Date(`${today}T${meal.reminderTime}`), 'h:mm a')}` : ''}`}
              >
                {meal.recipe.imageUrl && (
                  <Image source={{ uri: meal.recipe.imageUrl }} style={styles.mealThumbnail} />
                )}
                {!meal.recipe.imageUrl && (
                    <View style={[styles.mealThumbnail, styles.mealThumbnailPlaceholder]}>
                        <Ionicons name="restaurant-outline" size={20} color={colors.textSecondary} />
                    </View>
                )}
                <View style={styles.mealInfoContainer}>
                  <View style={[styles.mealTypeIndicator, { backgroundColor: getMealTypeColor(meal.mealType) }]} />
                  <View style={styles.mealPlanTimeContainer}>
                    <Text style={styles.mealPlanTime}>
                      {meal.reminderTime ? format(new Date(`${today}T${meal.reminderTime}`), 'h:mm a') : meal.mealType.toUpperCase()}
                    </Text>
                    <Text style={[styles.mealPlanType, { color: getMealTypeColor(meal.mealType) }]}>
                      {meal.mealType}
                    </Text>
                  </View>
                  <View style={styles.mealPlanDetails}>
                    <Text style={styles.mealPlanTitle} numberOfLines={1}>
                      {meal.recipe.title}
                    </Text>
                  </View>
                </View>
                <View style={styles.mealActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => { e.stopPropagation(); onEditMealPress(meal.id); }}
                    accessibilityLabel={`Edit ${meal.mealType} - ${meal.recipe.title}`}
                  >
                    <Ionicons name="pencil-outline" size={18} color={colors.primary} />
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
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={onAddMealPress}
            accessibilityLabel="Add meal to today's plan"
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.addMealText}>Add Another Meal</Text>
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
  mealThumbnail: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: colors.background, // Placeholder background
  },
  mealThumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardAlt,
  },
  mealInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeIndicator: {
    width: 4,
    height: '70%',
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  mealPlanTimeContainer: {
    width: 75, // Adjusted width
    paddingRight: spacing.sm,
  },
  mealPlanTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  mealPlanType: {
    ...typography.caption,
    textTransform: 'capitalize',
    fontWeight: '500',
    fontSize: 11,
  },
  mealPlanDetails: {
    flex: 1,
    justifyContent: 'center', // Center title vertically if time is short
  },
  mealPlanTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
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
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '600', // Bolder
  },
});

export default TodaysPlanSummary;
