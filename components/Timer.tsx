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
import { recipeNotifications } from '@/services/notifications';

interface TimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  stepIndex?: number; // 1-based step index
  stepTitle?: string; // Description of the step
}

export default function Timer({ duration, onComplete, stepIndex = 1, stepTitle = 'cooking step' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Track when the timer was started and when it was paused
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const notificationIdRef = useRef<string | null>(null);
  
  // Animation for progress bar
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  // Schedule notification when timer starts
  useEffect(() => {
    const scheduleNotification = async () => {
      // Only schedule if we have more than 10 seconds
      if (duration >= 10) {
        const durationMinutes = Math.ceil(duration / 60);
        notificationIdRef.current = await recipeNotifications.scheduleTimerNotification(
          stepIndex,
          stepTitle,
          durationMinutes
        );
      }
    };
    
    scheduleNotification();
    
    // Clean up notification when component unmounts
    return () => {
      if (notificationIdRef.current) {
        recipeNotifications.cancelTimerNotification(notificationIdRef.current);
      }
    };
  }, [duration, stepIndex, stepTitle]);
  
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
    
    // Cancel the notification since we're showing the UI notification
    if (notificationIdRef.current) {
      recipeNotifications.cancelTimerNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    
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
      
      // Reschedule notification if needed
      if (!notificationIdRef.current && timeLeft > 10) {
        const scheduleRemainingNotification = async () => {
          const durationMinutes = Math.ceil(timeLeft / 60);
          notificationIdRef.current = await recipeNotifications.scheduleTimerNotification(
            stepIndex,
            stepTitle,
            durationMinutes
          );
        };
        
        scheduleRemainingNotification();
      }
    } else {
      // Pausing the timer
      pausedTimeRef.current = Date.now();
      setIsPaused(true);
      
      // Pause animation
      animatedWidth.stopAnimation();
      
      // Cancel notification if paused
      if (notificationIdRef.current) {
        recipeNotifications.cancelTimerNotification(notificationIdRef.current);
        notificationIdRef.current = null;
      }
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