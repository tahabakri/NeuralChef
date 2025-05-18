import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, AppState, AppStateStatus } from 'react-native';
import { WifiOff, XCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing, withRepeat, runOnJS } from 'react-native-reanimated';
import colors from '@/constants/colors';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

interface OfflineBannerProps {
  onClose?: () => void;
  showCloseButton?: boolean;
  onOfflineChange?: (isOffline: boolean) => void;
}

// Create a singleton for network status
export const NetworkManager = {
  isOffline: false,
  listeners: new Set<(isOffline: boolean) => void>(),
  
  addListener(callback: (isOffline: boolean) => void) {
    this.listeners.add(callback);
    // Return current state immediately
    callback(this.isOffline);
    return () => this.listeners.delete(callback);
  },
  
  updateOfflineStatus(offline: boolean) {
    if (this.isOffline !== offline) {
      this.isOffline = offline;
      this.listeners.forEach(listener => listener(offline));
    }
  },
  
  // Helper method to check if recipe generation should be disabled
  isGenerationDisabled() {
    return this.isOffline;
  }
};

// Initialize NetInfo listener outside of component to persist between renders
let netInfoUnsubscribe: NetInfoSubscription | null = null;
const setupNetInfoListener = () => {
  if (netInfoUnsubscribe === null) {
    netInfoUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected === true && state.isInternetReachable !== false;
      NetworkManager.updateOfflineStatus(!isConnected);
    });
    
    // Initial network check
    NetInfo.fetch().then((state: NetInfoState) => {
      const isConnected = state.isConnected === true && state.isInternetReachable !== false;
      NetworkManager.updateOfflineStatus(!isConnected);
    });
  }
};

// Call setup when module is loaded
setupNetInfoListener();

export default function OfflineBanner({ 
  onClose, 
  showCloseButton = true,
  onOfflineChange 
}: OfflineBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isOffline, setIsOffline] = useState(NetworkManager.isOffline);
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);
  
  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = NetworkManager.addListener((offline) => {
      runOnJS(setIsOffline)(offline);
      
      if (onOfflineChange) {
        runOnJS(onOfflineChange)?.(offline);
      }
      
      if (offline && isVisible) {
        // Show the banner with animation
        translateY.value = withTiming(0, { 
          duration: 400, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
        });
        opacity.value = withTiming(1, { duration: 300 });
      } else if (!offline) {
        // Hide the banner with animation
        translateY.value = withTiming(-60, { 
          duration: 300, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
        });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(setIsVisible)(false);
          if (onClose) {
            runOnJS(onClose)();
          }
        });
      }
    });
    
    // Setup app state change listener to recheck network when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        NetInfo.fetch().then((state: NetInfoState) => {
          const isConnected = state.isConnected === true && state.isInternetReachable !== false;
          NetworkManager.updateOfflineStatus(!isConnected);
        });
      }
    };
    
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [isVisible, onOfflineChange]);
  
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
      runOnJS(setIsVisible)(false);
      if (onClose) {
        runOnJS(onClose)();
      }
    });
  };
  
  // If network is connected or banner is closed, don't render
  if (!isOffline || !isVisible) return null;
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <WifiOff size={18} color="white" />
      <Text style={styles.message}>
        Offline mode: Recipe generation disabled
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
    backgroundColor: colors.error,
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