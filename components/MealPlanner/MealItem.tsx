import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [isLoading, setIsLoading] = useState(false);
  const btnOpacity = useSharedValue(1);
  const btnScale = useSharedValue(1);
  const reminderBtnAnim = useSharedValue(1);
  
  const handleAddPress = async () => {
    setIsLoading(true);
    btnScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
    
    try {
      await onPress();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReminderPress = () => {
    reminderBtnAnim.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
    onSetReminderPress?.(meal!);
  };
  
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: btnOpacity.value,
      transform: [{ scale: btnScale.value }]
    };
  });
  
  const animatedReminderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: reminderBtnAnim.value }]
    };
  });
  
  const handleButtonPressIn = () => {
    btnOpacity.value = withTiming(0.8, { duration: 100 });
    btnScale.value = withTiming(0.98, { duration: 100 });
  };
  
  const handleButtonPressOut = () => {
    btnOpacity.value = withTiming(1, { duration: 200 });
    btnScale.value = withTiming(1, { duration: 200 });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={MEAL_TYPE_ICONS[mealType]} 
              size={24} 
              color={colors.textSecondary} 
            />
          </View>
          <Text style={styles.mealTypeText}>{MEAL_TYPE_LABELS[mealType]}</Text>
        </View>
        
        {meal?.notificationsEnabled && (
          <View style={styles.headerRight}>
            <View style={styles.reminderBadge}>
              <Ionicons 
                name="notifications" 
                size={16} 
                color={colors.white} 
              />
            </View>
          </View>
        )}
      </View>

      {meal ? (
        <TouchableOpacity 
          style={styles.contentContainer}
          onPress={() => onItemPress?.(meal)}
          accessibilityLabel={`View details for ${meal.recipe.title} meal`}
          accessibilityRole="button"
        >
          <View style={styles.mealInfo}>
            <Text style={styles.recipeName}>{meal.recipe.title}</Text>
            {meal.recipe.cookTime && (
              <Text style={styles.cookTime}>
                {meal.recipe.cookTime} mins
              </Text>
            )}
          </View>
          
          <Animated.View style={animatedReminderStyle}>
            <TouchableOpacity 
              style={[
                styles.reminderButton,
                meal.notificationsEnabled && styles.reminderButtonActive
              ]}
              onPress={handleReminderPress}
              accessibilityLabel={
                meal.notificationsEnabled 
                  ? `Remove reminder for ${meal.recipe.title}`
                  : `Set reminder for ${meal.recipe.title}`
              }
              accessibilityRole="button"
            >
              <Ionicons 
                name={meal.notificationsEnabled ? "notifications" : "notifications-outline"} 
                size={20} 
                color={meal.notificationsEnabled ? colors.white : colors.textSecondary} 
              />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      ) : (
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPress}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            disabled={isLoading}
            accessibilityLabel={`Add recipe for ${MEAL_TYPE_LABELS[mealType].toLowerCase()}`}
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.addButtonIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="add" size={20} color={colors.white} />
                </LinearGradient>
                <Text style={styles.addButtonText}>Add a recipe</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
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
    overflow: 'hidden',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  reminderBadge: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    ...typography.bodyLarge,
    color: colors.primary,
    marginLeft: 8,
  },
});
