import React, { createContext, useContext, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import CustomToast from './CustomToast';

// Types of feedback
export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

// Feedback message structure
interface FeedbackMessage {
  title: string;
  description?: string;
  type: FeedbackType;
  duration?: number;
}

// Context interface
interface FeedbackContextType {
  showFeedback: (message: FeedbackMessage) => void;
  hideFeedback: () => void;
}

// Create context with default values
const FeedbackContext = createContext<FeedbackContextType>({
  showFeedback: () => {},
  hideFeedback: () => {},
});

// Hook to use the feedback system
export const useFeedback = () => useContext(FeedbackContext);

// Provider component
export const FeedbackProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage>({
    title: '',
    type: 'info',
  });

  const showFeedback = (feedbackMessage: FeedbackMessage) => {
    // Haptic feedback based on type
    if (Platform.OS !== 'web') {
      switch (feedbackMessage.type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    setMessage(feedbackMessage);
    setVisible(true);
  };

  const hideFeedback = () => {
    setVisible(false);
  };

  const contextValue: FeedbackContextType = {
    showFeedback,
    hideFeedback,
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <CustomToast
        visible={visible}
        message={message.title}
        type={message.type}
        duration={message.duration || 3000}
        onHide={hideFeedback}
      />
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider; 