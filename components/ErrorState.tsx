import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import LottieView from 'lottie-react-native';

interface ErrorStateProps {
  title?: string;
  message?: string;
  retryButtonText?: string;
  onRetry?: () => void;
  hideAnimation?: boolean;
}

export default function ErrorState({
  title = 'No ingredients found',
  message = 'We couldn\'t detect any ingredients in the image. Please try again with a clearer image or add ingredients manually.',
  retryButtonText = 'Retry',
  onRetry,
  hideAnimation = false
}: ErrorStateProps) {
  
  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onRetry) onRetry();
  };
  
  return (
    <View style={styles.container}>
      {!hideAnimation ? (
        <View style={styles.animationContainer}>
          <LottieView
            source={require('@/assets/animations/empty-state.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>
      ) : (
        <AlertTriangle size={48} color={colors.warning} />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button 
          title={retryButtonText} 
          onPress={handleRetry}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  animationContainer: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 120,
  }
}); 