import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import colors from '@/constants/colors';
import { loadingMessages, cookingTips } from '@/constants/loadingMessages';
import { StatusBar } from 'expo-status-bar';

interface LoadingOverlayProps {
  message?: string;
  intensity?: number;
}

export default function LoadingOverlay({ 
  message = 'Loading...',
  intensity = 65
}: LoadingOverlayProps) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [currentTip, setCurrentTip] = useState('');
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  
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
  
  // Render content inside the overlay
  const renderContent = () => (
    <View style={styles.content} accessibilityLabel="Loading content">
      <View style={styles.animationContainer}>
        {!isAnimationLoaded && <ActivityIndicator size="large" color={colors.primary} />}
        <LottieView
          autoPlay
          loop
          style={styles.animation}
          source={require('@/assets/animations/cooking.json')}
          onAnimationLoaded={() => setIsAnimationLoaded(true)}
          speed={0.8}
          resizeMode="contain"
        />
      </View>
      
      <Text style={styles.message} accessibilityLabel={`Loading status: ${currentMessage}`}>
        {currentMessage}
      </Text>
      
      <View style={styles.tipContainer}>
        <Text style={styles.tipText} accessibilityLabel={`Cooking tip: ${currentTip}`}>
          {currentTip}
        </Text>
      </View>
    </View>
  );
  
  // Different implementation for web vs native
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={[styles.blurContainer, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          {renderContent()}
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BlurView intensity={intensity} tint="dark" style={styles.blurContainer}>
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
    backgroundColor: 'rgba(0,0,0,0.3)', // Lighter overlay as requested
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
    backdropFilter: 'blur(12px)',
  },
  animationContainer: {
    width: 160,
    height: 160,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
    position: 'absolute',
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
    padding: 14,
    borderRadius: 14,
    width: '100%',
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});