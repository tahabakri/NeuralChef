import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface VoiceInputModalProps {
  onComplete: (recognizedText: string) => void;
  onClose: () => void;
}

// Placeholder for actual voice recognition implementation
// In a real app, this would use a library like react-native-voice
const simulateVoiceRecognition = (): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // Return simulated recognized text
      resolve('chicken breasts, broccoli, olive oil, garlic, salt, pepper');
    }, 3000);
  });
};

export default function VoiceInputModal({ onComplete, onClose }: VoiceInputModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  
  // Animation for recording indicator
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Start animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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
      pulseAnim.setValue(1);
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).stop();
    }
  }, [isListening, pulseAnim]);
  
  // Start voice recognition
  const startListening = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsListening(true);
    setRecognizedText('');
    
    try {
      // In a real app, this would initialize and start the voice recognition
      const result = await simulateVoiceRecognition();
      setRecognizedText(result);
    } catch (error) {
      console.error('Voice recognition error:', error);
    } finally {
      setIsListening(false);
    }
  };
  
  // Stop voice recognition
  const stopListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsListening(false);
    // In a real app, this would stop the actual voice recognition
  };
  
  // Handle completion
  const handleComplete = () => {
    if (recognizedText) {
      onComplete(recognizedText);
    } else {
      onClose();
    }
  };
  
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isListening}
            >
              <Ionicons name="close" size={24} color={isListening ? colors.textTertiary : colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Voice Input</Text>
            <View style={styles.headerRight} />
          </View>
          
          {/* Main Content */}
          <View style={styles.contentContainer}>
            {isListening ? (
              <>
                <Text style={styles.listeningText}>Listening...</Text>
                <Text style={styles.instructionText}>Speak clearly and list your ingredients</Text>
                
                {/* Animated Recording Indicator */}
                <Animated.View
                  style={[
                    styles.recordingIndicator,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <Ionicons name="mic" size={32} color="white" />
                </Animated.View>
                
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopListening}
                >
                  <Text style={styles.stopButtonText}>Stop</Text>
                </TouchableOpacity>
              </>
            ) : recognizedText ? (
              <>
                <Text style={styles.resultTitle}>Recognized Ingredients:</Text>
                <View style={styles.recognizedTextContainer}>
                  <Text style={styles.recognizedText}>{recognizedText}</Text>
                </View>
                
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={startListening}
                  >
                    <Text style={styles.secondaryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleComplete}
                  >
                    <Text style={styles.primaryButtonText}>Use These</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.instructionText}>
                  Tap the microphone and start listing your ingredients.
                  Speak clearly and pause between ingredients.
                </Text>
                
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startListening}
                >
                  <Ionicons name="mic-outline" size={32} color="white" />
                  <Text style={styles.startButtonText}>Tap to Start</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  headerRight: {
    width: 32,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 300,
  },
  listeningText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  recordingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  stopButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.error,
    borderRadius: 24,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  recognizedTextContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
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
  recognizedText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  secondaryButton: {
    backgroundColor: colors.backgroundAlt,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  startButton: {
    backgroundColor: colors.primary,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Poppins-Medium',
  },
}); 