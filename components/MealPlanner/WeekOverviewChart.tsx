import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { ScheduledMeal, MealType } from './types'; // MealType might not be needed if not differentiating dots by type

interface WeekOverviewChartProps {
  dates: string[]; // Expecting 7 date strings for the week
  scheduledMeals: ScheduledMeal[];
}

const DAY_DOT_SIZE = 10; // Size of the dot indicator
const ACTIVE_DOT_COLOR = colors.accentOrange;
const INACTIVE_DOT_COLOR = colors.border; // A neutral color for inactive dots

export default function WeekOverviewChart({ dates, scheduledMeals }: WeekOverviewChartProps) {
  // Process data to check if any meal is planned for each date
  const mealsPlannedByDate = React.useMemo(() => {
    const result: Record<string, boolean> = {};
    
    dates.forEach(date => {
      result[date] = false; // Initialize all dates as having no meals
    });
    
    scheduledMeals.forEach(meal => {
      if (result.hasOwnProperty(meal.date)) {
        result[meal.date] = true; // Mark date as having at least one meal
      }
    });
    
    return result;
  }, [dates, scheduledMeals]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Overview</Text>
      
      <View style={styles.chartContainer}>
        {dates.slice(0, 7).map((date) => { // Ensure only 7 days are shown
          const dateFormatted = format(parseISO(date), 'EEE');
          const hasMeals = mealsPlannedByDate[date] || false;
          
          return (
            <View key={date} style={styles.dayColumn}>
              <View 
                style={[
                  styles.dayDot, 
                  { backgroundColor: hasMeals ? ACTIVE_DOT_COLOR : INACTIVE_DOT_COLOR }
                ]} 
              />
              <Text style={styles.dateLabel}>{dateFormatted}</Text>
            </View>
          );
        })}
      </View>
      {/* Legend is removed as per simplification */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16, // Adjusted padding
    paddingHorizontal: 12, // Adjusted padding
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 }, // Softer shadow
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    ...typography.subtitle1, // Using subtitle1 for a less prominent title
    fontFamily: 'Poppins-Medium', 
    color: colors.text,
    marginBottom: 12, // Adjusted margin
    textAlign: 'center', // Center title
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute days evenly
    alignItems: 'center', // Align items to center for dot and label
    paddingHorizontal: 8, // Add some horizontal padding
  },
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 8, // Add some padding to the column
  },
  dayDot: {
    width: DAY_DOT_SIZE,
    height: DAY_DOT_SIZE,
    borderRadius: DAY_DOT_SIZE / 2,
    marginBottom: 8, // Space between dot and label
  },
  dateLabel: {
    ...typography.caption, // Smaller text for day labels
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
  },
  // Removed styles: barContainer, barWrapper, barSegment, barGradient, countBadge, countText, legendContainer, legendItem, legendDot, legendText
});
