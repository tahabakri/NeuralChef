import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, AppState, AppStateStatus } from 'react-native';
import { WiFiOff, XCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing, withRepeat } from 'react-native-reanimated';
import colors from '@/constants/colors';

interface OfflineBannerProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function OfflineBanner({ 
  onClose, 
  showCloseButton = true 
}: OfflineBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);
  
  // Check network status when app state changes
  useEffect(() => {
    const checkNetwork = async () => {
      // In a real app, use NetInfo to check connectivity
      // https://github.com/react-native-netinfo/react-native-netinfo
      const isConnected = navigator?.onLine ?? true;
      setIsOffline(!isConnected);
      
      if (!isConnected && isVisible) {
        // Show the banner with animation
        translateY.value = withTiming(0, { 
          duration: 400, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
        });
        opacity.value = withTiming(1, { duration: 300 });
      } else if (isConnected) {
        // Hide the banner with animation
        translateY.value = withTiming(-60, { 
          duration: 300, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
        });
        opacity.value = withTiming(0, { duration: 200 });
      }
    };
    
    // Initial check
    checkNetwork();
    
    // Setup app state change listener
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkNetwork();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // For web, add online/offline event listeners
    if (Platform.OS === 'web') {
      window.addEventListener('online', checkNetwork);
      window.addEventListener('offline', checkNetwork);
    }
    
    return () => {
      subscription.remove();
      if (Platform.OS === 'web') {
        window.removeEventListener('online', checkNetwork);
        window.removeEventListener('offline', checkNetwork);
      }
    };
  }, [isVisible]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });
  
  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Hide with animation
    translateY.value = withTiming(-60, { 
      duration: 300, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      setIsVisible(false);
      if (onClose) onClose();
    });
  };
  
  // If network is connected or banner is closed, don't render
  if (!isOffline || !isVisible) return null;
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <WiFiOff size={18} color="white" />
      <Text style={styles.message}>
        Offline mode: Using cached recipes
      </Text>
      {showCloseButton && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close offline notification"
        >
          <XCircle size={18} color="white" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
}); 