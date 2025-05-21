import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { format, parseISO } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { ScheduledMeal, MealType } from './types';

interface WeekOverviewChartProps {
  dates: string[];
  scheduledMeals: ScheduledMeal[];
}

// Constant mapping for visual elements
const MEAL_COLORS: Record<MealType, { fill: string, border: string }> = {
  breakfast: { fill: colors.accentGreenLight, border: colors.success },
  lunch: { fill: colors.accentOrangeLight, border: colors.secondary },
  dinner: { fill: colors.accentBlueLight, border: colors.info },
};

const MAX_BAR_HEIGHT = 150;
const BAR_WIDTH = 32;

export default function WeekOverviewChart({ dates, scheduledMeals }: WeekOverviewChartProps) {
  // Animation values for each bar segment
  const barHeights = {
    breakfast: useSharedValue(0),
    lunch: useSharedValue(0),
    dinner: useSharedValue(0),
  };
  
  // Process data to group meals by date and type
  const mealsByDate = React.useMemo(() => {
    const result: Record<string, Record<MealType, number>> = {};
    
    // Initialize all dates with 0 counts
    dates.forEach(date => {
      result[date] = {
        breakfast: 0,
        lunch: 0,
        dinner: 0
      };
    });
    
    // Count meals for each date and type
    scheduledMeals.forEach(meal => {
      if (result[meal.date]) {
        result[meal.date][meal.mealType]++;
      }
    });
    
    return result;
  }, [dates, scheduledMeals]);
  
  // Animate on component mount
  React.useEffect(() => {
    // Calculate max count for scaling
    let maxCount = 0;
    dates.forEach(date => {
      const dateTotal = 
        mealsByDate[date].breakfast + 
        mealsByDate[date].lunch + 
        mealsByDate[date].dinner;
      maxCount = Math.max(maxCount, dateTotal);
    });
    
    // Default to 3 if no meals
    maxCount = maxCount || 3;
    
    // Calculated bar segment heights based on meal counts
    const calculatedHeights = {
      breakfast: MAX_BAR_HEIGHT / maxCount,
      lunch: MAX_BAR_HEIGHT / maxCount,
      dinner: MAX_BAR_HEIGHT / maxCount,
    };
    
    // Animate heights
    ['breakfast', 'lunch', 'dinner'].forEach((type) => {
      barHeights[type as MealType].value = withTiming(calculatedHeights[type as MealType], {
        duration: 800,
      });
    });
  }, [mealsByDate]);
  
  // Create animated styles for each meal type
  const createAnimatedBarStyle = (mealType: MealType, count: number) => {
    return useAnimatedStyle(() => {
      return {
        height: count > 0 ? barHeights[mealType].value * count : 0,
      };
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Meal Overview</Text>
      
      <View style={styles.chartContainer}>
        {dates.map((date) => {
          const dateFormatted = format(parseISO(date), 'EEE');
          const breakfastCount = mealsByDate[date].breakfast;
          const lunchCount = mealsByDate[date].lunch;
          const dinnerCount = mealsByDate[date].dinner;
          
          const breakfastStyle = createAnimatedBarStyle('breakfast', breakfastCount);
          const lunchStyle = createAnimatedBarStyle('lunch', lunchCount);
          const dinnerStyle = createAnimatedBarStyle('dinner', dinnerCount);
          
          const totalMeals = breakfastCount + lunchCount + dinnerCount;
          
          return (
            <View key={date} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                {/* Dinner (top) */}
                {dinnerCount > 0 && (
                  <Animated.View style={[styles.barSegment, dinnerStyle]}>
                    <LinearGradient
                      colors={[MEAL_COLORS.dinner.fill, MEAL_COLORS.dinner.border]}
                      style={styles.barGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  </Animated.View>
                )}
                
                {/* Lunch (middle) */}
                {lunchCount > 0 && (
                  <Animated.View style={[styles.barSegment, lunchStyle]}>
                    <LinearGradient
                      colors={[MEAL_COLORS.lunch.fill, MEAL_COLORS.lunch.border]}
                      style={styles.barGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  </Animated.View>
                )}
                
                {/* Breakfast (bottom) */}
                {breakfastCount > 0 && (
                  <Animated.View style={[styles.barSegment, breakfastStyle]}>
                    <LinearGradient
                      colors={[MEAL_COLORS.breakfast.fill, MEAL_COLORS.breakfast.border]}
                      style={styles.barGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  </Animated.View>
                )}
              </View>
              
              <Text style={styles.dateLabel}>{dateFormatted}</Text>
              
              {totalMeals > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{totalMeals}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
      
      {/* Chart legend */}
      <View style={styles.legendContainer}>
        {Object.entries(MEAL_COLORS).map(([mealType, colors]) => (
          <View key={mealType} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
            <Text style={styles.legendText}>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: MAX_BAR_HEIGHT,
    marginBottom: 24,
  },
  barContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  barWrapper: {
    width: BAR_WIDTH,
    height: MAX_BAR_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  barSegment: {
    width: BAR_WIDTH,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  dateLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    ...typography.bodySmall,
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.text,
  },
}); 