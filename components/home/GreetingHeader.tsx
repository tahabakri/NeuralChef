import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import LottieIllustration, { LottieType } from '../LottieIllustration'; 

// Define the spacing values if not imported from a constants file
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface GreetingHeaderProps {
  greeting: string;
  subTitle: string;
  timestamp: string;
  userName?: string;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  greeting,
  subTitle,
  timestamp,
  userName,
}) => {
  // Get current time for time-based features
  const now = useMemo(() => new Date(), []);
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Time-based greeting enhancement
  const enhancedGreeting = useMemo(() => {
    const baseGreeting = userName ? `${greeting}, Chef ${userName}!` : `${greeting}!`;
    return baseGreeting;
  }, [greeting, userName]);
  
  // Day-based special messages
  const dayBasedMessage = useMemo(() => {
    const dayMessages = [
      "It's Sunday Brunch Day! 🥞",      // Sunday
      "Monday Meal Prep Time! 🥗",       // Monday
      "Taco Tuesday Vibes! 🌮",          // Tuesday
      "Wednesday Comfort Food! 🍲",      // Wednesday
      "Thursday Throwback Recipes! 👨‍🍳", // Thursday
      "It's Pizza Friday! 🍕",           // Friday
      "Saturday Kitchen Adventures! 🧑‍🍳"  // Saturday
    ];
    
    return dayMessages[currentDay];
  }, [currentDay]);
  
  // Determine if it's day or night for animation
  const isDay = currentHour >= 6 && currentHour < 18;
  const lottieType: LottieType = isDay ? 'sun' : 'moon';
  
  return (
    <View style={styles.container}>
      {/* Animated sun/moon background */}
      <View style={styles.animationContainer}>
        <LottieIllustration
          type={lottieType}
          size={120} // Matches current animationContainer size
          style={{ ...styles.backgroundAnimation, opacity: isDay ? 0.3 : 0.1 }}
          autoPlay
          loop
          speed={0.5}
        />
      </View>
      
      {/* Main greeting text */}
      <Text style={styles.mainGreeting}>
        {enhancedGreeting}
      </Text>
      
      {/* Day-based special message */}
      <Text style={styles.dayMessage}>
        {dayBasedMessage}
      </Text>
      
      {/* Subtitle text */}
      <Text style={styles.subtitle}>
        {subTitle}
      </Text>
      
      {/* Timestamp text */}
      <Text style={styles.timestamp}>
        {timestamp}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1, // Ensure text is above the background elements
  },
  animationContainer: {
    position: 'absolute',
    top: -spacing.lg,
    right: -spacing.lg,
    width: 120,
    height: 120,
    zIndex: 0,
  },
  backgroundAnimation: {
    width: '100%',
    height: '100%',
  },
  mainGreeting: {
    ...typography.title1,
    color: colors.text,
    marginBottom: spacing.xs,
    zIndex: 2,
  },
  dayMessage: {
    ...typography.bodyMedium,
    color: colors.primary || colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
    zIndex: 2,
  },
  subtitle: {
    ...typography.title3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    zIndex: 2,
  },
  timestamp: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    zIndex: 2,
  },
});

export default GreetingHeader;
