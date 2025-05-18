import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import CachedImage from './CachedImage';

interface ImageStepProps {
  imageUrl: string;
  isCompleted?: boolean;
  altText?: string;
  onRegenerateImage?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ImageStep({
  imageUrl,
  isCompleted = false,
  altText,
  onRegenerateImage,
}: ImageStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState(false);

  // Handle image load completion
  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  // Handle image load error
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // Toggle fullscreen image view
  const toggleFullScreen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFullScreen(!isFullScreen);
  };

  // Regenerate unclear image
  const handleRegenerateImage = () => {
    if (onRegenerateImage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRegenerateImage();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleFullScreen}
        disabled={error}
        accessibilityLabel={altText || "Step image"}
        accessibilityRole="image"
        accessibilityHint="Double tap to view image in full screen"
      >
        <View style={[styles.imageContainer, isCompleted && styles.completedImageContainer]}>
          <CachedImage
            source={imageUrl}
            style={styles.image}
            contentFit="cover"
            onLoad={handleLoadEnd}
            onError={handleError}
            placeholder={
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            }
            accessibilityLabel={altText || "Step image"}
          />
          
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
            </View>
          )}
          
          {!error && !isLoading && (
            <View style={styles.expandIconContainer}>
              <Ionicons name="expand-outline" size={20} color="white" />
            </View>
          )}
          
          {!error && !isLoading && onRegenerateImage && (
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={handleRegenerateImage}
              accessibilityLabel="Regenerate image"
              accessibilityRole="button"
            >
              <Ionicons name="refresh" size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={isFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleFullScreen}
            accessibilityLabel="Close fullscreen image"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <CachedImage
            source={imageUrl}
            style={styles.fullScreenImage}
            contentFit="contain"
            accessibilityLabel={altText || "Step image (fullscreen)"}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  completedImageContainer: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  expandIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  regenerateButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenWidth * 0.75,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
}); 