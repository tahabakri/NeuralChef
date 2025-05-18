import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface TimerProps {
  duration: number; // in seconds
  onComplete: () => void;
}

export default function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Track when the timer was started and when it was paused
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  
  // Animation for progress bar
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start the animation
    Animated.timing(animatedWidth, {
      toValue: 1,
      duration: duration * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    
    // Subscribe to app state changes to handle background/foreground transitions
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isActive &&
        !isPaused
      ) {
        // App has come to the foreground
        const timeInBackground = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newTimeLeft = Math.max(0, duration - timeInBackground);
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft <= 0) {
          handleTimerComplete();
        }
      }
      appStateRef.current = nextAppState;
    });
    
    // Timer logic
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isActive, isPaused, duration]);
  
  const handleTimerComplete = () => {
    setIsActive(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };
  
  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isPaused) {
      // Resuming the timer
      const pausedDuration = Date.now() - pausedTimeRef.current;
      startTimeRef.current = startTimeRef.current + pausedDuration;
      setIsPaused(false);
      
      // Continue animation from where it left off
      Animated.timing(animatedWidth, {
        toValue: 1,
        duration: timeLeft * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else {
      // Pausing the timer
      pausedTimeRef.current = Date.now();
      setIsPaused(true);
      
      // Pause animation
      animatedWidth.stopAnimation();
    }
  };
  
  // Format the time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercent = (1 - timeLeft / duration) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
        <TouchableOpacity 
          style={styles.pauseButton} 
          onPress={togglePause}
          accessibilityLabel={isPaused ? "Resume timer" : "Pause timer"}
          accessibilityRole="button"
        >
          <Ionicons 
            name={isPaused ? "play" : "pause"} 
            size={20} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      
      {isPaused && (
        <Text style={styles.pausedText}>Timer Paused</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  pauseButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  pausedText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
}); 