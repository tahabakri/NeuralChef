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
}

export default function CameraInput({ onIngredientsDetected }: CameraInputProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
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
        setCameraVisible(true);
      }
    } catch (err) {
      console.error('Failed to request camera permission:', err);
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
    
    // Close all modals
    setShowConfirmation(false);
    setCameraVisible(false);
    resetCamera();
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Close camera
  const closeCamera = () => {
    setCameraVisible(false);
    resetCamera();
  };
  
  return (
    <View>
      {/* Camera button */}
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={requestCameraPermission}
      >
        <CameraIcon size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      
      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={closeCamera}
      >
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeCamera}
          >
            <X size={24} color={colors.white} />
          </TouchableOpacity>
          
          {/* Camera preview or captured image */}
          {!capturedImage ? (
            <View style={styles.cameraContainer}>
              {hasPermission ? (
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
                <View style={styles.permissionContainer}>
                  <Text style={styles.permissionText}>
                    {hasPermission === false
                      ? "Camera permission is required"
                      : "Requesting camera permission..."}
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
              
              {/* Simple processing indicator - the advanced confirmation is in a separate modal */}
              {isProcessing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.processingText}>
                    Detecting ingredients...
                  </Text>
                </View>
              )}
              
              {/* Simple controls for the preview */}
              <View style={styles.previewControls}>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={resetCamera}
                >
                  <RefreshCw size={20} color={colors.white} />
                  <Text style={styles.previewButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
      
      {/* Advanced Ingredient Detection Confirmation Modal */}
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
  cameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
