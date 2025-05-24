import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography, { fontSize } from '@/constants/typography';
import spacing from '@/constants/spacing';
import * as Haptics from 'expo-haptics';

interface ImageInputOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePicture: () => void;
  onChooseFromGallery: () => void;
}

export default function ImageInputOptionsModal({
  visible,
  onClose,
  onTakePicture,
  onChooseFromGallery,
}: ImageInputOptionsModalProps) {

  const handleOptionPress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Image</Text>
            <Text style={styles.modalSubtitle}>How would you like to add an image?</Text>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOptionPress(onTakePicture)}
            >
              <Ionicons name="camera-outline" size={24} color={colors.primary} style={styles.optionIcon} />
              <Text style={styles.optionText}>Take a Picture</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOptionPress(onChooseFromGallery)}
            >
              <Ionicons name="images-outline" size={24} color={colors.primary} style={styles.optionIcon} />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.optionButton, styles.cancelButton]}
              onPress={() => handleOptionPress(onClose)}
            >
              <Ionicons name="close-circle-outline" size={24} color={colors.textSecondary} style={styles.optionIcon} />
              <Text style={[styles.optionText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent backdrop
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.xl, // 16px
    padding: spacing.xl, // 24px
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.sm, // 8px
  },
  modalSubtitle: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg, // 16px
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.md, // 12px
    paddingHorizontal: spacing.lg, // 16px
    borderRadius: spacing.borderRadius.md, // 8px
    width: '100%',
    marginBottom: spacing.md, // 12px
  },
  optionIcon: {
    marginRight: spacing.md, // 12px
  },
  optionText: {
    ...typography.button,
    color: colors.primary,
    fontSize: fontSize.lg,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginTop: spacing.sm, // 8px
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
}); 