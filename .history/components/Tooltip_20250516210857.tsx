import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'bottom' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  
  const handleOpen = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setVisible(true);
  };
  
  const handleClose = () => {
    setVisible(false);
  };
  
  // Position styling based on the position prop
  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return {
          bottom: 40,
          left: 0,
          right: 0,
        };
      case 'left':
        return {
          right: '100%',
          top: 0,
          marginRight: 10,
        };
      case 'right':
        return {
          left: '100%',
          top: 0,
          marginLeft: 10,
        };
      default: // bottom
        return {
          top: '100%',
          left: -100,
          marginTop: 10,
        };
    }
  };
  
  const getArrowStyle = () => {
    switch (position) {
      case 'top':
        return {
          bottom: -8,
          left: '50%',
          marginLeft: -8,
          transform: [{ rotate: '45deg' }],
        };
      case 'left':
        return {
          right: -8,
          top: '50%',
          marginTop: -8,
          transform: [{ rotate: '45deg' }],
        };
      case 'right':
        return {
          left: -8,
          top: '50%',
          marginTop: -8,
          transform: [{ rotate: '45deg' }],
        };
      default: // bottom
        return {
          top: -8,
          left: '50%',
          marginLeft: -8,
          transform: [{ rotate: '45deg' }],
        };
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleOpen}>
        <View>{children}</View>
      </TouchableWithoutFeedback>
      
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.tooltipContainer}>
                <BlurView intensity={Platform.OS === 'ios' ? 60 : 40} style={styles.blurView}>
                  <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipText}>{content}</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={handleClose}
                    >
                      <Text style={styles.closeButtonText}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurView: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  tooltipContent: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.96)',
    padding: 16,
  },
  tooltipText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  tooltipArrow: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: colors.card,
  },
  closeButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
}); 