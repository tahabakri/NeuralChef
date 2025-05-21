import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { CameraView, Camera, CameraType } from 'expo-camera';
import { Camera as CameraIcon, X, RefreshCw, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import colors from '@/constants/colors';
import { mockIngredientRecognition } from '@/utils/mockImageRecognition';
import IngredientDetectionConfirmation from './IngredientDetectionConfirmation';

interface CameraInputProps {
  onIngredientsDetected: (ingredients: string[]) => void;
  onClose?: () => void; // Added onClose prop
}

export default function CameraInput({ onIngredientsDetected, onClose }: CameraInputProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  // cameraVisible state now controls if the camera UI is active within this component, not a modal
  const [cameraActive, setCameraActive] = useState(false); 
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        setCameraActive(true); // Activate camera UI directly
      } else {
        // Optionally handle permission denied more explicitly here if needed
        console.warn('Camera permission denied');
      }
    } catch (err) {
      console.error('Failed to request camera permission:', err);
    }
  };
  
  // Function to activate camera view if permission is already granted
  const openCameraView = () => {
    if (hasPermission) {
      setCameraActive(true);
    } else {
      requestCameraPermission(); // Request permission if not already granted or denied
    }
  };
  
  // Take a photo
  const takePicture = async () => {
    if (!cameraRef) return;
    
    try {
      const photo = await cameraRef.takePictureAsync({ quality: 0.7 });
      if (photo && photo.uri) {
        setCapturedImage(photo.uri);
        
        // Provide haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Simulate image processing
        processImage(photo.uri);
      } else {
        console.warn('Failed to capture image or URI is missing.');
      }
    } catch (err) {
      console.error('Failed to take picture:', err);
    }
  };
  
  // Process the image (mock)
  const processImage = async (imageUri: string) => {
    setIsProcessing(true);
    
    // Simulate API delay (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      // Get mock ingredients
      const ingredients = mockIngredientRecognition(imageUri);
      setDetectedIngredients(ingredients);
      setIsProcessing(false);
      
      // Show the advanced confirmation modal
      setShowConfirmation(true);
    }, delay);
  };
  
  // Reset the camera
  const resetCamera = () => {
    setCapturedImage(null);
    setDetectedIngredients([]);
    setShowConfirmation(false);
  };
  
  // Confirm detected ingredients via the advanced confirmation component
  const confirmIngredients = (ingredients: string[]) => {
    onIngredientsDetected(ingredients);
    
    setShowConfirmation(false);
    setCameraActive(false); // Deactivate camera UI
    resetCamera();
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose?.(); // Notify parent
  };
  
  // Close camera and notify parent
  const closeCameraAndNotifyParent = () => {
    setCameraActive(false); // Deactivate camera UI
    resetCamera();
    onClose?.(); // Notify parent
  };
  
  // If camera is not active, show a button to open it.
  // This button is part of the CameraInput component itself,
  // shown when the parent (HomeScreen) has made CameraInput visible.
  if (!cameraActive) {
    return (
      <View style={styles.openCameraPromptContainer}>
        <TouchableOpacity
          style={styles.cameraMainButton} // Re-using style from HomeScreen for consistency
          onPress={openCameraView}
        >
          <CameraIcon size={32} color="white" />
          <Text style={styles.cameraButtonText}>Open Camera</Text>
        </TouchableOpacity>
        {hasPermission === false && (
          <Text style={styles.permissionDeniedText}>
            Camera permission was denied. Please enable it in settings.
          </Text>
        )}
      </View>
    );
  }
  
  // If camera is active, show the camera view or preview.
  return (
    <View style={styles.cameraViewContainer}>
      {/* Close button for the active camera view */}
      <TouchableOpacity
        style={styles.closeButton} // This style was for the modal, ensure it's positioned correctly for embedded view
        onPress={closeCameraAndNotifyParent}
      >
        <X size={24} color={colors.white} />
      </TouchableOpacity>
      
      {/* Camera preview or captured image */}
      {!capturedImage ? (
        <View style={styles.cameraContainer}>
          {hasPermission ? ( // Should always be true if cameraActive is true and this renders
            <CameraView
              style={styles.camera}
              facing={'back'}
              ref={(ref: CameraView | null) => setCameraRef(ref)}
            >
              <View style={styles.captureButtonContainer}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </CameraView>
          ) : (
            // This case should ideally not be reached if cameraActive logic is correct
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>
                Requesting camera permission...
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: capturedImage }}
            style={styles.previewImage}
          />
          
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>
                Detecting ingredients...
              </Text>
            </View>
          )}
          
          <View style={styles.previewControls}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={resetCamera} // Retake photo
            >
              <RefreshCw size={20} color={colors.white} />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            {/* The "Use this photo" or confirm button is handled by IngredientDetectionConfirmation */}
          </View>
        </View>
      )}
      
      {/* Advanced Ingredient Detection Confirmation Modal (still a modal) */}
      <IngredientDetectionConfirmation
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        detectedIngredients={detectedIngredients}
        onConfirm={confirmIngredients}
        isProcessing={isProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles for the embedded camera view
  cameraViewContainer: {
    height: 300, // Or a flexible height, adjust as needed
    width: '100%',
    backgroundColor: colors.black,
    borderRadius: 12, // Optional: if you want rounded corners for the embedded view
    overflow: 'hidden', // Important if using borderRadius
    position: 'relative', // For positioning the close button
  },
  openCameraPromptContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cameraMainButton: { // Copied from HomeScreen for consistency, adjust if needed
    backgroundColor: colors.primary,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  cameraButtonText: { // Copied from HomeScreen
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Poppins-Medium',
  },
  permissionDeniedText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
  },
  // modalContainer style removed as Modal is removed
  closeButton: { // Adjusted for embedded view
    position: 'absolute',
    top: 10, // Adjust positioning
    right: 10, // Adjust positioning
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  permissionText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: colors.white,
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
  previewControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  previewButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  previewButtonText: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
});
