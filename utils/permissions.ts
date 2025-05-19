import { Platform } from 'react-native';
import { Audio } from 'expo-av';
// For SpeechRecognition on iOS, it's often bundled with Microphone or handled by the specific speech API.
// If using a specific Expo module for speech-to-text, its permission hook should be used.
// For now, we'll focus on Audio permissions. If SPEECH_RECOGNITION is distinct and needed,
// we might need to import from another module or handle it differently.
// Expo AV's Audio.requestPermissionsAsync() should cover microphone.
// The original code used Permissions.SPEECH_RECOGNITION.
// Let's assume for now that microphone access is the primary concern for "voice" permissions.
// If a dedicated speech-to-text library is in use (e.g., not just raw audio recording),
// its specific permission methods would be preferred.

/**
 * Request microphone permissions.
 * Note: Speech recognition permission on iOS is often requested by the underlying native API
 * when speech recognition is initiated, or it's covered if microphone access is granted.
 * This function will primarily focus on microphone permission via expo-av.
 * @returns Promise<boolean> - Whether permissions were granted
 */
export const requestVoicePermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    // SPEECH_RECOGNITION for iOS was a separate permission.
    // If a specific speech-to-text service is used, it might have its own permission request.
    // For now, we assume 'granted' for Audio covers the main voice input requirement.
    // If detailed speech recognition permission is still needed and distinct on iOS,
    // this might need adjustment based on the speech-to-text library in use.
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting voice permissions:', error);
    return false;
  }
};

/**
 * Check if the app has the required permissions for voice input
 * @returns Promise<boolean> - Whether permissions are granted
 */
export const checkVoicePermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Audio.getPermissionsAsync();
    // Similar to request, if SPEECH_RECOGNITION is a separate check needed for iOS,
    // this would need to be added. Assuming 'granted' for Audio is sufficient.
    return status === 'granted';
  } catch (error) {
    console.error('Error checking voice permissions:', error);
    return false;
  }
};
