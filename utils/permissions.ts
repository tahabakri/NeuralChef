import { Platform } from 'react-native';
import * as Permissions from 'expo-permissions';

/**
 * Request microphone and speech recognition permissions
 * @returns Promise<boolean> - Whether permissions were granted
 */
export const requestVoicePermissions = async (): Promise<boolean> => {
  try {
    // For iOS, we need to request both microphone and speech recognition
    if (Platform.OS === 'ios') {
      const { status: microphoneStatus } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      const { status: speechStatus } = await Permissions.askAsync(Permissions.SPEECH_RECOGNITION);
      
      return microphoneStatus === 'granted' && speechStatus === 'granted';
    } 
    // For Android, we only need to request microphone permission
    else if (Platform.OS === 'android') {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      return status === 'granted';
    }
    
    return false;
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
    if (Platform.OS === 'ios') {
      const { status: microphoneStatus } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
      const { status: speechStatus } = await Permissions.getAsync(Permissions.SPEECH_RECOGNITION);
      
      return microphoneStatus === 'granted' && speechStatus === 'granted';
    } else if (Platform.OS === 'android') {
      const { status } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
      return status === 'granted';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking voice permissions:', error);
    return false;
  }
}; 