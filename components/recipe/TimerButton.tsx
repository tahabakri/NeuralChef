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
  
  return (
    <View>
      <TouchableOpacity 
        style={[
          styles.timerButton,
          isTimerActive && styles.activeTimerButton,
          isComplete && styles.completeTimerButton
        ]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons 
          name={isTimerActive ? "timer" : "timer-outline"} 
          size={14} 
          color={isTimerActive ? colors.white : colors.primary} 
        />
        <Text style={[
          styles.timerText,
          isTimerActive && styles.activeTimerText
        ]}>
          {isTimerActive ? formatTime(timeLeft) : `${minutes} min`}
        </Text>
      </TouchableOpacity>
      
      <Modal
        transparent
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isComplete ? 'Timer Complete!' : 'Step Timer'}
              </Text>
              
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
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
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  activeTimerButton: {
    backgroundColor: colors.primary,
  },
  completeTimerButton: {
    backgroundColor: colors.success,
  },
  timerText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginLeft: 4,
  },
  activeTimerText: {
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '90%',
    maxWidth: 320,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    padding: 16,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.text,
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
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
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
    backgroundColor: colors.cardAlt,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '45%',
  },
  resetButtonText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
});

export default TimerButton; 