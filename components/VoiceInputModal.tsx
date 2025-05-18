import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Mic, X, Check } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import colors from '@/constants/colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  cancelAnimation
} from 'react-native-reanimated';
import { requestVoicePermissions, checkVoicePermissions } from '@/utils/permissions';

interface VoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
  onInputReceived: (text: string) => void;
}

export default function VoiceInputModal({ 
  visible, 
  onClose, 
  onInputReceived 
}: VoiceInputModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // Animated values for mic pulsing effect
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Configure voice recognition on mount
  useEffect(() => {
    // Initialize voice recognition
    const setupVoice = async () => {
      try {
        await Voice.destroy();
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
      } catch (e) {
        console.error('Failed to initialize voice module', e);
      }
    };
    
    setupVoice();
    
    // Cleanup
    return () => {
      stopListening();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  
  // Check permissions when the modal becomes visible
  useEffect(() => {
    if (visible) {
      checkPermissions();
      setTranscript('');
      setError('');
      setIsListening(false);
    } else {
      stopListening();
    }
  }, [visible]);
  
  // Check if we have the required permissions
  const checkPermissions = async () => {
    const granted = await checkVoicePermissions();
    setHasPermission(granted);
    
    // If permissions are denied, show an error
    if (!granted) {
      setError('Microphone permission is required for voice input. Please enable it in your device settings.');
    }
  };
  
  // Request permissions if needed
  const requestPermissions = async () => {
    const granted = await requestVoicePermissions();
    setHasPermission(granted);
    
    if (granted) {
      // If permissions were just granted, clear any error
      setError('');
      // Start listening immediately
      startListening();
    } else {
      setError('Microphone permission denied. Voice input is not available.');
    }
  };
  
  // Start voice recognition
  const startListening = async () => {
    // First ensure we have permissions
    if (hasPermission === null) {
      await requestPermissions();
      return;
    } else if (hasPermission === false) {
      await requestPermissions();
      return;
    }
    
    setError('');
    setTranscript('');
    
    try {
      await Voice.start('en-US');
      setIsListening(true);
      
      // Start the pulsing animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1, // infinite repeats
        true // reverse
      );
      
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
      
      // Provide haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      console.error('Error starting voice recognition', e);
      setError('Failed to start listening. Please try again.');
    }
  };
  
  // Stop voice recognition
  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      
      // Stop animations
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = 1;
      opacity.value = 1;
      
      // Provide haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e) {
      console.error('Error stopping voice recognition', e);
    }
  };
  
  // Handle speech recognition events
  const onSpeechStart = () => {
    console.log('Speech recognition started');
  };
  
  const onSpeechEnd = () => {
    console.log('Speech recognition ended');
    setIsListening(false);
    
    // Stop animations
    cancelAnimation(scale);
    cancelAnimation(opacity);
    scale.value = 1;
    opacity.value = 1;
  };
  
  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      setTranscript(recognizedText);
    }
  };
  
  const onSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech recognition error', e);
    setError('Failed to recognize speech. Please try again.');
    setIsListening(false);
    
    // Stop animations
    cancelAnimation(scale);
    cancelAnimation(opacity);
    scale.value = 1;
    opacity.value = 1;
  };
  
  // Submit the recognized text
  const handleSubmit = () => {
    if (transcript.trim()) {
      onInputReceived(transcript.trim());
      
      // Provide success haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    onClose();
  };
  
  // Create animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  });
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Voice Input</Text>
          <Text style={styles.subtitle}>Speak the ingredients you want to add</Text>
          
          {/* Main content area */}
          <View style={styles.contentContainer}>
            {/* Microphone button */}
            <TouchableOpacity 
              style={styles.micContainer}
              onPress={isListening ? stopListening : startListening}
              disabled={hasPermission === false}
            >
              <Animated.View 
                style={[
                  styles.micRipple, 
                  animatedStyle,
                  hasPermission === false && styles.micDisabled
                ]} 
              />
              <View style={[
                styles.micButton, 
                isListening && styles.micButtonActive,
                hasPermission === false && styles.micButtonDisabled
              ]}>
                <Mic 
                  size={32} 
                  color={isListening ? colors.white : (hasPermission === false ? colors.textTertiary : colors.primary)} 
                />
              </View>
              <Text style={styles.micText}>
                {hasPermission === false 
                  ? 'Permission required' 
                  : (isListening ? 'Tap to stop' : 'Tap to speak')}
              </Text>
            </TouchableOpacity>
            
            {/* Transcript display */}
            <View style={styles.transcriptContainer}>
              {transcript ? (
                <Text style={styles.transcriptText}>{transcript}</Text>
              ) : (
                <Text style={[
                  styles.placeholderText,
                  error && styles.errorText
                ]}>
                  {error || (isListening ? 'Listening...' : 'Tap the microphone and start speaking')}
                </Text>
              )}
            </View>
          </View>
          
          {/* Add button */}
          <TouchableOpacity 
            style={[
              styles.addButton,
              (!transcript || hasPermission === false) && styles.addButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!transcript || hasPermission === false}
          >
            <Text style={styles.addButtonText}>Add</Text>
            <Check size={20} color={colors.white} style={styles.addIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  micRipple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    opacity: 0.5,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tagBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  micButtonActive: {
    backgroundColor: colors.primary,
  },
  micButtonDisabled: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
  },
  micText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transcriptContainer: {
    width: '100%',
    minHeight: 80,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
  },
  transcriptText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    color: colors.error,
  },
  micDisabled: {
    opacity: 0.2,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  addButtonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  addIcon: {
    marginLeft: 8,
  },
}); 