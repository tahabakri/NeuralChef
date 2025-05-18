import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  AppState,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface TimerButtonProps {
  duration: number; // duration in minutes
  isActive: boolean;
  isCompleted?: boolean;
  onStart: () => void;
  onComplete: () => void;
}

export default function TimerButton({
  duration,
  isActive,
  isCompleted = false,
  onStart,
  onComplete,
}: TimerButtonProps) {
  const [seconds, setSeconds] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);
  
  // Set up the pulse animation
  useEffect(() => {
    if (isActive && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, isPaused]);
  
  // Handle timer progress animation
  useEffect(() => {
    if (isActive) {
      const progress = 1 - (seconds / (duration * 60));
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [seconds, isActive, duration]);
  
  // Handle background/foreground app state
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // App going to background
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        if (isActive && !isPaused) {
          backgroundTime.current = Date.now();
        }
      } 
      // App coming back to foreground
      else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isActive && !isPaused && backgroundTime.current) {
          const now = Date.now();
          const timeInBackground = now - backgroundTime.current;
          
          // Update elapsed time
          setElapsedTime(prev => prev + Math.floor(timeInBackground / 1000));
          backgroundTime.current = null;
        }
      }
      
      appState.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, [isActive, isPaused]);
  
  // Main timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused) {
      // Set start time if not set
      if (startTime === null) {
        setStartTime(Date.now());
      }
      
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            // Timer complete
            if (interval) clearInterval(interval);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, onComplete]);
  
  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle start timer
  const handleStart = () => {
    if (isCompleted) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSeconds(duration * 60);
    setStartTime(Date.now());
    setElapsedTime(0);
    setIsPaused(false);
    onStart();
  };
  
  // Handle pause/resume timer
  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isPaused) {
      // Resume timer
      setStartTime(Date.now() - elapsedTime * 1000);
    } else {
      // Pause timer
      setElapsedTime(Math.floor((Date.now() - (startTime || 0)) / 1000));
    }
    
    setIsPaused(!isPaused);
  };
  
  return (
    <Animated.View style={[
      styles.container,
      isActive && styles.activeContainer,
      isCompleted && styles.completedContainer,
      { transform: [{ scale: isActive ? pulseAnim : 1 }] }
    ]}>
      {isActive ? (
        <>
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }) }
              ]} 
            />
          </View>
          
          <View style={styles.activeContent}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={togglePause}
              accessibilityLabel={isPaused ? "Resume timer" : "Pause timer"}
              accessibilityRole="button"
            >
              <Ionicons 
                name={isPaused ? "play" : "pause"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          disabled={isCompleted}
          accessibilityLabel={`Start ${duration} minute timer`}
          accessibilityRole="button"
        >
          <Ionicons name="timer-outline" size={18} color={isCompleted ? colors.textTertiary : colors.primary} />
          <Text style={[
            styles.startButtonText,
            isCompleted && styles.completedText
          ]}>
            {isCompleted ? "Timer Complete" : `Set ${duration} min Timer`}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeContainer: {
    backgroundColor: colors.primary,
  },
  completedContainer: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.success,
    borderWidth: 1,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  startButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  completedText: {
    color: colors.textTertiary,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
  activeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 