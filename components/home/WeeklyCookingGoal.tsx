import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import LottieView from 'lottie-react-native'; // For potential badge animation

// Define spacing values
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20, // Adjusted for slightly more padding
  xxl: 22,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 48,
  },
};

interface WeeklyCookingGoalProps {
  goal: number;
  completedCount: number;
  motivationalText?: string; // Made optional, will use dynamic messages
  onEditGoalPress: () => void;
  onMarkMealCookedPress: () => void;
  onViewHistoryPress: () => void; // New prop
}

const motivationalQuotes = [
  "Cooking is love made visible.",
  "The secret ingredient is always cheese... or love.",
  "A recipe has no soul. You, as the cook, must bring soul to the recipe.",
  "Chop it like it's hot!",
  "Life is what you bake it."
];

const WeeklyCookingGoal: React.FC<WeeklyCookingGoalProps> = ({
  goal,
  completedCount,
  motivationalText: initialMotivationalText,
  onEditGoalPress,
  onMarkMealCookedPress,
  onViewHistoryPress,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [currentMotivationalText, setCurrentMotivationalText] = useState(initialMotivationalText || '');
  const [showHalfwayBadge, setShowHalfwayBadge] = useState(false);

  useEffect(() => {
    const newProgress = goal > 0 ? (completedCount / goal) * 100 : 0;
    Animated.timing(progressAnim, {
      toValue: Math.min(newProgress, 100),
      duration: 750, // Slower, smoother animation
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Custom easing curve
      useNativeDriver: false, // width is not supported by native driver
    }).start();

    // Update motivational text and badge
    const isGoalCompleted = completedCount >= goal && goal > 0;
    const isHalfway = completedCount >= goal / 2 && completedCount < goal && goal > 0;

    setShowHalfwayBadge(isHalfway && !isGoalCompleted);

    if (isGoalCompleted) {
      setCurrentMotivationalText("Goal Achieved! Fantastic work, chef! 🎉");
    } else if (isHalfway) {
      setCurrentMotivationalText("You're halfway there! Keep up the amazing effort! 🔥");
    } else if (completedCount > 0 && completedCount < goal / 2) {
      setCurrentMotivationalText(initialMotivationalText || motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    } else if (goal > 0) {
       setCurrentMotivationalText(initialMotivationalText || "Let's get cooking towards your goal!");
    } else {
      setCurrentMotivationalText("Set a goal to start tracking!");
    }

  }, [completedCount, goal, progressAnim, initialMotivationalText]);

  const progressPercentage = goal > 0 ? (completedCount / goal) * 100 : 0;
  const isGoalCompleted = completedCount >= goal && goal > 0;

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="time-outline" size={20} color={colors.textTertiary} style={styles.headerIcon} />
          <Text style={styles.title}>Your Weekly Cooking Goal</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onViewHistoryPress}
            accessibilityLabel="View cooking history"
            accessibilityRole="button"
          >
            <Ionicons name="time-outline" size={22} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onEditGoalPress}
            accessibilityLabel="Edit weekly cooking goal"
            accessibilityRole="button"
          >
            <Ionicons name="pencil-outline" size={22} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.goalText}>
        Cook {goal > 0 ? `${goal} meal${goal === 1 ? '' : 's'}` : 'any number of meals'} this week
      </Text>

      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: animatedWidth }]}>
          <LinearGradient
            colors={[colors.accentOrangeLight || '#FFA07A', colors.accentOrange || '#FF7F50']} // Fallback colors if not defined
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: spacing.borderRadius.pill }} // Ensure gradient also has rounded corners
          />
        </Animated.View>
      </View>

      <Text style={styles.statusText}>
        {completedCount}/{goal} meals cooked
      </Text>

      {showHalfwayBadge && !isGoalCompleted && (
        <View style={styles.badgeContainer}>
          <LottieView
            source={require('@/assets/animations/confetti.json')} // Replace with a suitable badge/celebration Lottie
            autoPlay
            loop={false}
            style={styles.badgeLottie}
          />
          <Text style={styles.badgeText}>Halfway Hero! 🌟</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.markMealButton,
          (isGoalCompleted || goal === 0) && styles.disabledButton
        ]}
        onPress={onMarkMealCookedPress}
        disabled={isGoalCompleted || goal === 0}
        accessibilityLabel="Mark meal as cooked"
        accessibilityRole="button"
        accessibilityState={{ disabled: isGoalCompleted || goal === 0 }}
      >
        {/* Text "✔️ Mark Meal Cooked" - checkmark emoji added directly to text */}
        <Text style={[
          styles.markMealButtonText,
          (isGoalCompleted || goal === 0) && styles.disabledButtonText
        ]}>
          ✔️ Mark Meal Cooked
        </Text>
      </TouchableOpacity>

      {currentMotivationalText && (
        <Text style={styles.motivationalText}>
          {currentMotivationalText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.title2, 
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs, // Space between icons
    borderRadius: spacing.borderRadius.pill,
  },
  goalText: {
    ...typography.body1, // Adjusted typography
    color: colors.text,
    fontWeight: '600', // Bolder
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    height: 10, // Slightly thicker bar
    backgroundColor: colors.backgroundAlt, // Softer background
    borderRadius: spacing.borderRadius.pill, // Pill shape
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
  },
  statusText: {
    ...typography.body2, // Adjusted typography
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'right', // Align to right
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentYellowLight,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
  },
  badgeLottie: {
    width: 30,
    height: 30,
    marginRight: spacing.sm,
  },
  badgeText: {
    ...typography.body2,
    color: colors.accentYellow, // Darker yellow for text
    fontWeight: 'bold',
  },
  markMealButton: {
    backgroundColor: colors.accentOrange, // Reverted to accentOrange as per prompt
    borderRadius: spacing.borderRadius.pill,
    paddingVertical: spacing.md, 
    paddingHorizontal: spacing.lg,
    flexDirection: 'row', // Icon and text side-by-side
    alignItems: 'center',
    justifyContent: 'center', // Center content
    alignSelf: 'stretch', // Stretch to full width
    marginBottom: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  markMealButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold', // Assuming Poppins is available
  },
  motivationalText: {
    ...typography.body2, 
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: colors.backgroundDisabled, // Keep existing disabled style
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: colors.textDisabled, // Keep existing disabled text style
  },
});

export default WeeklyCookingGoal;
