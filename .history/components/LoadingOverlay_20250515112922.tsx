import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Lottie from 'lottie-react-native';
import colors from '@/constants/colors';
import { loadingMessages, cookingTips } from '@/constants/loadingMessages';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [currentTip, setCurrentTip] = useState('');
  
  // Set up cycling through messages and tips
  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    let tipInterval: NodeJS.Timeout;
    
    // Only cycle through messages if using the default ones
    if (message === 'Loading...') {
      // Initial random message
      const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      setCurrentMessage(randomMessage);
      
      // Cycle messages every 3 seconds
      messageInterval = setInterval(() => {
        const nextMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        setCurrentMessage(nextMessage);
      }, 3000);
    }
    
    // Initial random tip
    const randomTip = cookingTips[Math.floor(Math.random() * cookingTips.length)];
    setCurrentTip(randomTip);
    
    // Cycle tips every 5 seconds
    tipInterval = setInterval(() => {
      const nextTip = cookingTips[Math.floor(Math.random() * cookingTips.length)];
      setCurrentTip(nextTip);
    }, 5000);
    
    // Clear intervals on unmount
    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (tipInterval) clearInterval(tipInterval);
    };
  }, [message]);
  
  // Use BlurView on iOS/Android, fallback to regular overlay on web
  const renderContent = () => (
    <View style={styles.content}>
      <View style={styles.animationContainer}>
        <Lottie.default
          autoPlay
          loop
          style={styles.animation}
          source={require('@/assets/animations/cooking.json')}
        />
      </View>
      
      <Text style={styles.message}>{currentMessage}</Text>
      
      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>{currentTip}</Text>
      </View>
    </View>
  );
  
  // Different implementation for web vs native
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={[styles.blurContainer, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          {renderContent()}
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
        {renderContent()}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  animationContainer: {
    width: 150,
    height: 150,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  message: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  tipContainer: {
    backgroundColor: colors.cardAlt,
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});