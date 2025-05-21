import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Vibration,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface TimerButtonProps {
  minutes: number;
}

const TimerButton = ({ minutes }: TimerButtonProps) => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [showModal, setShowModal] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Animation values
  const modalSlide = useSharedValue(100);
  const bellAnimation = useSharedValue(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isTimerActive && timeLeft === 0) {
      setIsTimerActive(false);
      setIsComplete(true);
      handleTimerComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft]);
  
  useEffect(() => {
    if (showModal) {
      modalSlide.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      modalSlide.value = withTiming(100, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [showModal]);
  
  useEffect(() => {
    if (isComplete) {
      bellAnimation.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      );
    }
  }, [isComplete]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleTimerComplete = () => {
    // Vibrate pattern
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 500, 200, 500]);
    } else {
      Vibration.vibrate();
    }
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Show timer completion modal
    setShowModal(true);
  };
  
  const startTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerActive(true);
    setShowModal(false);
  };
  
  const pauseTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerActive(false);
  };
  
  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTimerActive(false);
    setTimeLeft(minutes * 60);
    setIsComplete(false);
    setShowModal(false);
  };
  
  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: `${modalSlide.value}%` }],
    };
  });
  
  const bellAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: bellAnimation.value,
      transform: [
        { scale: 1 + bellAnimation.value * 0.2 },
      ],
    };
  });
  
  // Determine which gradient to use based on state
  const getGradientColors = () => {
    if (isComplete) return [colors.success, colors.primaryDark]; // Green for complete
    if (isTimerActive) return [colors.sunriseOrange, colors.secondaryDark]; // Orange for active
    return [colors.softPeachEnd, colors.softPeachStart]; // Peach for default
  };
  
  return (
    <View>
      <TouchableOpacity onPress={() => setShowModal(true)}>
        <LinearGradient 
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.timerButton}
        >
          <Ionicons 
            name={isTimerActive ? "timer" : "timer-outline"} 
            size={14} 
            color={colors.white} 
          />
          <Text style={styles.timerText}>
            {isTimerActive ? formatTime(timeLeft) : `${minutes} min`}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <Modal
        transparent
        visible={showModal}
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <Animated.View 
            style={[styles.modalContent, modalAnimatedStyle]}
          >
            <View style={styles.dragIndicator} />
            
            <LinearGradient 
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              {isComplete && (
                <Animated.View style={[styles.bellAnimation, bellAnimatedStyle]}>
                  <LottieView
                    source={require('@/assets/animations/bell.json')}
                    autoPlay
                    loop={false}
                    style={styles.bellLottie}
                  />
                </Animated.View>
              )}
              <Text style={styles.modalTitle}>
                {isComplete ? 'Timer Complete!' : 'Step Timer'}
              </Text>
              
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.timerDisplay}>
              <Text style={styles.timerDisplayText}>
                {formatTime(timeLeft)}
              </Text>
            </View>
            
            <View style={styles.buttonRow}>
              {isTimerActive ? (
                <TouchableOpacity style={styles.actionButton} onPress={pauseTimer}>
                  <Ionicons name="pause" size={24} color={colors.white} />
                  <Text style={styles.actionButtonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={startTimer}
                  disabled={isComplete}
                >
                  <Ionicons name="play" size={24} color={colors.white} />
                  <Text style={styles.actionButtonText}>Start</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
                <Ionicons name="refresh" size={24} color={colors.text} />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  timerText: {
    ...typography.bodySmall,
    color: colors.white,
    marginLeft: 4,
    fontFamily: 'Poppins-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: colors.dragHandle,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.white,
  },
  closeButton: {
    padding: 4,
  },
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  timerDisplayText: {
    ...typography.heading1,
    color: colors.text,
    fontSize: 48,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '45%',
  },
  actionButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '45%',
  },
  resetButtonText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
  bellAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellLottie: {
    width: 60,
    height: 60,
  }
});

export default TimerButton; 