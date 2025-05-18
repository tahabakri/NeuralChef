import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import ImageStep from './ImageStep';
import TimerButton from './TimerButton';
import StepCheckbox from './StepCheckbox';

interface Step {
  instruction: string;
  imageUrl?: string;
  hasTimer?: boolean;
  timerDuration?: number; // in minutes
  tip?: string;
}

interface StepListProps {
  steps: Step[];
  onStepComplete?: (index: number, completed: boolean) => void;
  autoScrollToNextStep?: boolean;
  onRegenerateImage?: (index: number) => void;
}

export default function StepList({
  steps,
  onStepComplete,
  autoScrollToNextStep = true,
  onRegenerateImage,
}: StepListProps) {
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    new Array(steps.length).fill(false)
  );
  const [expandedSteps, setExpandedSteps] = useState<boolean[]>(
    new Array(steps.length).fill(true)
  );
  const [activeTimers, setActiveTimers] = useState<Set<number>>(new Set());
  
  const scrollViewRef = useRef<ScrollView>(null);
  const progressWidth = useRef(new RNAnimated.Value(0)).current;
  
  // Calculate progress percentage
  const completedCount = completedSteps.filter(Boolean).length;
  const progress = steps.length > 0 ? completedCount / steps.length : 0;
  
  // Update progress animation
  React.useEffect(() => {
    RNAnimated.timing(progressWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, progressWidth]);
  
  // Handle completing a step
  const handleStepComplete = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[index] = !newCompletedSteps[index];
    setCompletedSteps(newCompletedSteps);
    
    if (onStepComplete) {
      onStepComplete(index, newCompletedSteps[index]);
    }
    
    // If a step was marked as complete and there's a next step, scroll to it
    if (newCompletedSteps[index] && index < steps.length - 1 && autoScrollToNextStep) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: (index + 1) * 160, // Approximate height of a step
          animated: true,
        });
      }, 500);
    }
  };
  
  // Toggle step expansion (collapse/expand)
  const toggleExpandStep = (index: number) => {
    const newExpandedSteps = [...expandedSteps];
    newExpandedSteps[index] = !newExpandedSteps[index];
    setExpandedSteps(newExpandedSteps);
  };
  
  // Handle timer start
  const handleTimerStart = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveTimers(new Set(activeTimers.add(index)));
  };
  
  // Handle timer completion
  const handleTimerComplete = (index: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const newActiveTimers = new Set(activeTimers);
    newActiveTimers.delete(index);
    setActiveTimers(newActiveTimers);
    
    // Mark step as completed when timer finishes
    if (!completedSteps[index]) {
      handleStepComplete(index);
    }
  };

  // Handle image regeneration
  const handleRegenerateImage = (index: number) => {
    if (onRegenerateImage) {
      onRegenerateImage(index);
    }
  };
  
  // Render individual step
  const renderStep = ({ item, index }: { item: Step, index: number }) => {
    const isCompleted = completedSteps[index];
    const isExpanded = expandedSteps[index];
    const hasTimer = item.hasTimer && item.timerDuration;
    const isTimerActive = activeTimers.has(index);
    
    // Animated values for step animation
    const itemOpacity = useSharedValue(1);
    const itemScale = useSharedValue(1);
    
    // Create animated style
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: itemOpacity.value,
        transform: [{ scale: itemScale.value }]
      };
    });
    
    return (
      <Animated.View 
        style={[styles.stepContainer, animatedStyle]}
        entering={FadeIn.duration(500).delay(index * 100)}
      >
        <View style={styles.stepHeader}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleExpandStep(index)}
          >
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <StepCheckbox
            checked={isCompleted}
            onToggle={() => handleStepComplete(index)}
          />
        </View>
        
        {isExpanded && (
          <Animated.View 
            entering={FadeIn}
            exiting={FadeOut}
          >
            {item.imageUrl && (
              <ImageStep 
                imageUrl={item.imageUrl} 
                isCompleted={isCompleted}
                altText={`Step ${index + 1}: ${item.instruction}`}
                onRegenerateImage={onRegenerateImage ? () => handleRegenerateImage(index) : undefined}
              />
            )}
            
            <Text style={[
              styles.stepInstruction, 
              isCompleted && styles.completedStepInstruction
            ]}>
              {item.instruction}
            </Text>
            
            {/* Timer Button */}
            {hasTimer && (
              <View style={styles.timerContainer}>
                <TimerButton
                  duration={item.timerDuration || 0}
                  isActive={isTimerActive}
                  isCompleted={isCompleted}
                  onStart={() => handleTimerStart(index)}
                  onComplete={() => handleTimerComplete(index)}
                />
              </View>
            )}
            
            {/* Optional tip */}
            {item.tip && (
              <View style={styles.tipContainer}>
                <Ionicons name="bulb-outline" size={16} color={colors.warning} />
                <Text style={styles.tipText}>{item.tip}</Text>
              </View>
            )}
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <RNAnimated.View
            style={[
              styles.progressBar,
              { width: progressWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }) }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount} of {steps.length} steps completed
        </Text>
      </View>
      
      <Text style={styles.title}>Instructions</Text>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={steps}
          renderItem={renderStep}
          keyExtractor={(_, index) => `step-${index}`}
          scrollEnabled={false} // Disable scrolling in the FlatList since we're using ScrollView
          contentContainerStyle={styles.stepsContainer}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Bold',
  },
  scrollView: {
    flex: 1,
  },
  stepsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  stepContainer: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  expandButton: {
    padding: 6,
  },
  stepInstruction: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins-Regular',
  },
  completedStepInstruction: {
    color: colors.textSecondary,
  },
  timerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 213, 79, 0.15)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 213, 79, 0.3)',
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
}); 