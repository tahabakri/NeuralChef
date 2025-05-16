import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert, TouchableOpacity, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import colors from '@/constants/colors';
import { CheckCircle, Circle, Timer, Play, Pause, X, Clock, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface RecipeStepProps {
  number: number;
  instruction: string;
  imageUrl?: string;
  isLoading?: boolean;
}

export default function RecipeStep({
  number,
  instruction,
  imageUrl,
  isLoading = false
}: RecipeStepProps) {
  const [isDone, setIsDone] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Extract time from instruction (e.g., "...for 5 minutes")
  const timeMatch = instruction.match(/(\d+)[-\s]*(min|minutes|minute|seconds|second|sec|hour|hours|hrs)/i);
  const hasTimer = !!timeMatch;
  
  useEffect(() => {
    if (timeMatch) {
      const amount = parseInt(timeMatch[1], 10);
      const unit = timeMatch[2].toLowerCase();
      
      let seconds = 0;
      if (unit.includes('hour')) {
        seconds = amount * 60 * 60;
      } else if (unit.includes('min')) {
        seconds = amount * 60;
      } else if (unit.includes('sec')) {
        seconds = amount;
      }
      
      setTimeRemaining(seconds);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [instruction]);
  
  const handlePress = () => {
    setIsDone(!isDone);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const startTimer = () => {
    if (timerActive) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer complete
          clearInterval(timerRef.current!);
          setTimerActive(false);
          
          // Notify user
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Alert.alert('Timer Complete', `Step ${number} timer is done!`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const pauseTimer = () => {
    if (!timerActive) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    clearInterval(timerRef.current!);
    setTimerActive(false);
  };
  
  const resetTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    pauseTimer();
    
    if (timeMatch) {
      const amount = parseInt(timeMatch[1], 10);
      const unit = timeMatch[2].toLowerCase();
      
      let seconds = 0;
      if (unit.includes('hour')) {
        seconds = amount * 60 * 60;
      } else if (unit.includes('min')) {
        seconds = amount * 60;
      } else if (unit.includes('sec')) {
        seconds = amount;
      }
      
      setTimeRemaining(seconds);
    }
  };
  
  const openSystemTimer = async () => {
    if (!timeMatch) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const amount = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();
    let minutes = 0;
    
    if (unit.includes('hour')) {
      minutes = amount * 60;
    } else if (unit.includes('min')) {
      minutes = amount;
    } else if (unit.includes('sec')) {
      minutes = Math.ceil(amount / 60);
    }
    
    try {
      if (Platform.OS === 'ios') {
        // iOS timer
        await Linking.openURL(`clock:///timer?minutes=${minutes}`);
      } else if (Platform.OS === 'android') {
        // Android timer (this opens the clock app)
        await Linking.openURL('content://com.android.deskclock/timer');
      } else {
        // Web or other platform - show an alert
        Alert.alert('Set a timer', `Please set a timer for ${minutes} minutes.`);
      }
    } catch (error) {
      console.error('Failed to open system timer:', error);
      Alert.alert('Timer', `Please set a timer for ${minutes} minutes.`);
    }
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  return (
    <View style={[styles.container, isDone && styles.containerDone]}>
      <Pressable onPress={handlePress} style={styles.header}>
        <View style={[styles.stepNumber, isDone && styles.stepNumberDone]}>
          <Text style={[styles.stepNumberText, isDone && styles.stepNumberTextDone]}>{number}</Text>
        </View>
        <Text style={[styles.instruction, isDone && styles.instructionDone]}>{instruction}</Text>
        <View style={styles.checkboxContainer}>
           {isDone ? (
             <CheckCircle size={24} color={colors.primary} />
           ) : (
             <Circle size={24} color={colors.textSecondary} />
           )}
        </View>
      </Pressable>
      
      {hasTimer && (
        <View style={styles.timerContainer}>
          <View style={styles.timerBadge}>
            <Clock size={14} color="white" />
            <Text style={styles.timerBadgeText}>{timeMatch![1]} {timeMatch![2]}</Text>
          </View>
          
          <View style={styles.timerContent}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            
            <View style={styles.timerControls}>
              {timerActive ? (
                <TouchableOpacity onPress={pauseTimer} style={styles.timerButton}>
                  <Pause size={18} color={colors.primary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={startTimer} style={styles.timerButton}>
                  <Play size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={resetTimer} style={styles.timerButton}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={openSystemTimer} style={styles.timerButton}>
                <AlertCircle size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {(imageUrl || isLoading) && (
        <View style={styles.imageContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Generating image...</Text>
            </View>
          ) : imageUrl ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={300}
              />
              {isDone && (
                <BlurView intensity={40} tint="light" style={styles.imageOverlay}>
                  <CheckCircle size={40} color={colors.primary} />
                </BlurView>
              )}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  containerDone: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberDone: {
    backgroundColor: colors.textSecondary,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  stepNumberTextDone: {
    // No change needed for text color usually
  },
  instruction: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginRight: 12,
  },
  instructionDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  checkboxContainer: {
    // No change needed for checkbox container
  },
  timerContainer: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  timerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerIcon: {
    marginRight: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  timerControls: {
    flexDirection: 'row',
  },
  timerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
  },
});