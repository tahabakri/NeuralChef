import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Pressable } from 'react-native';
import { Check, X, Info, AlertCircle } from 'lucide-react-native';

interface CustomToastProps {
  visible: boolean;
  message: string;
  description?: string;
  duration?: number;
  onHide?: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
}

const { width } = Dimensions.get('window');

const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  message,
  description,
  duration = 3000,
  onHide,
  type = 'success'
}) => {
  const translateYAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Show toast with animation
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Hide after duration
      const hideTimeout = setTimeout(() => {
        hideToast();
      }, duration);
      
      return () => clearTimeout(hideTimeout);
    }
  }, [visible]);
  
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      if (onHide) onHide();
    });
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      case 'warning':
        return '#FF9500';
      case 'info':
        return '#007AFF';
      default:
        return '#34C759';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check color="#fff" size={20} />;
      case 'error':
        return <X color="#fff" size={20} />;
      case 'warning':
        return <AlertCircle color="#fff" size={20} />;
      case 'info':
        return <Info color="#fff" size={20} />;
      default:
        return <Check color="#fff" size={20} />;
    }
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: translateYAnim }],
          opacity: opacityAnim,
          backgroundColor: getBackgroundColor()
        }
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.message} numberOfLines={1}>{message}</Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>{description}</Text>
          )}
        </View>
      </View>
      <Pressable 
        onPress={hideToast} 
        style={styles.closeButton}
        accessibilityLabel="Dismiss notification"
        accessibilityRole="button"
        accessibilityHint="Dismisses the current notification"
      >
        <X color="#fff" size={16} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: width - 40,
    maxWidth: 400,
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  }
});

export default CustomToast; 