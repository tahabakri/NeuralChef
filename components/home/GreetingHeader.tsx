import React, { useState, useEffect, useMemo } from 'react';
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
  eventMessage?: {
    text: string;
    emoji?: string;
  };
  // Mock weather prop, replace with actual data source later
  mockWeatherCondition?: 'sunny' | 'cloudy' | 'partly-cloudy' | 'night'; 
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  greeting,
  subTitle,
  timestamp,
  userName,
  eventMessage,
  // mockWeatherCondition = 'sunny', // Default to sunny for now
}) => {
  const displayGreeting = userName ? `${greeting.replace('!', '')}, Chef ${userName}!` : greeting;

  // Mock weather cycling for demonstration
  const [currentMockWeather, setCurrentMockWeather] = useState< 'sunny' | 'cloudy' | 'partly-cloudy' | 'night'>('sunny');

  useEffect(() => {
    const weatherConditions: Array<'sunny' | 'cloudy' | 'partly-cloudy' | 'night'> = ['sunny', 'partly-cloudy', 'cloudy', 'night'];
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % weatherConditions.length;
      setCurrentMockWeather(weatherConditions[index]);
    }, 5000); // Cycle every 5 seconds

    return () => clearInterval(intervalId);
  }, []);


  const lottieType = useMemo((): LottieType => {
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;

    if (currentMockWeather === 'night' || !isDayTime) return 'moon';
    if (currentMockWeather === 'sunny') return 'sun';
    if (currentMockWeather === 'cloudy') return 'cloudy';
    if (currentMockWeather === 'partly-cloudy') return 'partly-cloudy';
    return isDayTime ? 'sun' : 'moon'; // Default based on time if weather is unknown
  }, [currentMockWeather]);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieIllustration
          type={lottieType}
          size={100} 
          style={styles.backgroundAnimation}
          autoPlay
          loop
          speed={0.7}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.mainGreeting}>
          {displayGreeting}
        </Text>
        
        {eventMessage && (
          <Text style={styles.eventMessageText}>
            {eventMessage.text} {eventMessage.emoji}
          </Text>
        )}
        
        <Text style={styles.subtitle}>
          {subTitle}
        </Text>
        
        <Text style={styles.timestamp}>
          {timestamp}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
    position: 'relative', // Needed for absolute positioning of animation
    overflow: 'hidden', // To contain the animation if it's larger
  },
  animationContainer: {
    position: 'absolute',
    top: -spacing.sm, // Adjust as needed
    right: -spacing.sm, // Adjust as needed
    width: 100, // Match LottieIllustration size
    height: 100, // Match LottieIllustration size
    zIndex: 0, // Behind text
  },
  backgroundAnimation: {
    width: '100%',
    height: '100%',
    opacity: 0.5, // Make it subtle
  },
  textContainer: {
    zIndex: 1, // Above animation
  },
  mainGreeting: {
    ...typography.title1,
    fontFamily: 'Poppins-Regular', // Assuming Poppins is set up
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventMessageText: {
    ...typography.bodyMedium,
    fontFamily: 'Poppins-Regular', // Assuming Poppins is set up
    color: colors.accentOrange,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.title3,
    fontFamily: 'Poppins-Regular', // Assuming Poppins is set up
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timestamp: {
    ...typography.bodySmall,
    fontFamily: 'OpenSans-Regular', // Assuming OpenSans is set up
    color: colors.textTertiary,
  },
});

export default GreetingHeader;
