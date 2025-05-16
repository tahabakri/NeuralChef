import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Mic } from 'lucide-react-native';

interface CustomToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onHide?: () => void;
  type?: 'success' | 'error' | 'info';
}

const { width } = Dimensions.get('window');

const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  message,
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
      case 'info':
        return '#007AFF';
      default:
        return '#34C759';
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
    >
      <View style={styles.iconContainer}>
        {type === 'success' && <Mic color="#fff" size={20} />}
      </View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: width - 40,
    maxWidth: 400,
    alignSelf: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
});

export default CustomToast; 