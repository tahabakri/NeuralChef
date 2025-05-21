import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
// import * as Permissions from 'expo-permissions'; // Deprecated and unused
import colors from '@/constants/colors';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '@/constants/typography';

interface PermissionsStepProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void; // Added onSkip as optional
  isLastStep: boolean;
  stepIndex: number;
  totalSteps: number;
}

const { width } = Dimensions.get('window');

export default function PermissionsStep({ onNext, onBack, isLastStep, stepIndex, totalSteps }: PermissionsStepProps) {
  const { setCameraPermission, setMicrophonePermission } = useOnboardingStore();
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [microphoneStatus, setMicrophoneStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

  // Request permission when component mounts
  useEffect(() => {
    checkPermissions();
  }, []);

  // Check current permission status
  const checkPermissions = async () => {
    // Check camera permission
    const cameraPermission = await Camera.getCameraPermissionsAsync();
    setCameraStatus(cameraPermission.status === 'granted' ? 'granted' : 'pending');
    setCameraPermission(cameraPermission.status === 'granted');

    // Check microphone permission
    const micPermissionResponse = await Camera.getMicrophonePermissionsAsync();
    setMicrophoneStatus(micPermissionResponse.status === 'granted' ? 'granted' : 'pending');
    setMicrophonePermission(micPermissionResponse.status === 'granted');
  };

  // Request camera permission
  const requestCameraPermission = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraStatus(status === 'granted' ? 'granted' : 'denied');
    setCameraPermission(status === 'granted');
    
    if (status !== 'granted') {
      showPermissionDeniedAlert('camera');
    }
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await Camera.requestMicrophonePermissionsAsync();
    setMicrophoneStatus(status === 'granted' ? 'granted' : 'denied');
    setMicrophonePermission(status === 'granted');
    
    if (status !== 'granted') {
      showPermissionDeniedAlert('microphone');
    }
  };

  // Show alert if permission denied
  const showPermissionDeniedAlert = (permissionType: 'camera' | 'microphone') => {
    Alert.alert(
      `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1)} Permission Required`,
      `For the best experience, please enable ${permissionType} access in your device settings.`,
      [
        { text: 'OK', style: 'default' },
      ]
    );
  };

  // Continue to next step
  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  };

  // Go back to previous step
  const handleBack = () => {
    if (onBack) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onBack();
    }
  };

  const handleRequestAll = async () => {
    await requestCameraPermission();
    await requestMicrophonePermission();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${((stepIndex + 1) / totalSteps) * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Image
          source={require('@/assets/images/permissions-illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>App Permissions</Text>
          <Text style={styles.subtitle}>
            ReciptAI needs access to your camera and microphone to scan ingredients 
            and allow you to use voice commands
          </Text>
        </View>
        
        <View style={styles.permissionsContainer}>
          <View style={styles.permissionItem}>
            <View style={styles.permissionIconContainer}>
              <Ionicons name="camera" size={28} color={colors.primary} />
            </View>
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionTitle}>Camera Access</Text>
              <Text style={styles.permissionDescription}>
                To scan ingredients and take photos of your meals
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.permissionButton, 
                cameraStatus === 'granted' && styles.permissionGranted
              ]}
              onPress={requestCameraPermission}
            >
              <Text style={styles.permissionButtonText}>
                {cameraStatus === 'granted' ? 'Granted' : 'Allow'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.permissionItem}>
            <View style={styles.permissionIconContainer}>
              <Ionicons name="mic" size={28} color={colors.primary} />
            </View>
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionTitle}>Microphone Access</Text>
              <Text style={styles.permissionDescription}>
                For voice commands and audio notes
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.permissionButton, 
                microphoneStatus === 'granted' && styles.permissionGranted
              ]}
              onPress={requestMicrophonePermission}
            >
              <Text style={styles.permissionButtonText}>
                {microphoneStatus === 'granted' ? 'Granted' : 'Allow'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleNext}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleRequestAll}
            disabled={cameraStatus === 'granted' && microphoneStatus === 'granted'}
          >
            <LinearGradient
              colors={['#FFA726', '#FB8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.continueButtonText}>
                {cameraStatus === 'granted' && microphoneStatus === 'granted' ? 'Continue' : 'Allow All'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    paddingRight: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  illustration: {
    width: '80%',
    height: 180,
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '90%',
  },
  permissionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  permissionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: 4,
  },
  permissionDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  permissionButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  permissionGranted: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
  },
  permissionButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 12,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  continueButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});
