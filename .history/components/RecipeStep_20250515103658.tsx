import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { CheckCircle, Circle, Timer, Play, Pause, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

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
          <Timer size={18} color={colors.primary} style={styles.timerIcon} />
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
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
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
    padding: 16, // Add padding to the container instead of header
  },
  containerDone: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16, // Add spacing below header if image/loading is present
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 14,
  },
  stepNumberTextDone: {
    // No change needed for text color usually
  },
  instruction: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginRight: 12, // Add space before checkbox
  },
  instructionDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  checkboxContainer: {
    // No change needed for checkbox container
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    marginLeft: 40,  // Align with instruction text
  },
  timerIcon: {
    marginRight: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: colors.cardAlt,
    // marginTop: 8, // Removed, spacing handled by header margin
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
});