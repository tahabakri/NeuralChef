import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

const ErrorScreen = ({ error, onRetry, onBack }: ErrorScreenProps) => {
  return (
    <LinearGradient
      colors={[colors.softPeachStart, colors.softPeachEnd]}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <Image
          source={require('@/assets/images/error-image.png')}
          style={styles.errorImage}
          resizeMode="contain"
          defaultSource={require('@/assets/images/error-image.png')}
          // Fallback for when the image doesn't load
          onError={() => console.log('Error loading image')}
        />
        
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorMessage}>{error || 'Something went wrong'}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backHomeButton} onPress={onBack}>
            <Text style={styles.backHomeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  errorImage: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  errorTitle: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 10,
  },
  errorMessage: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    ...typography.bodyLarge,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
  backHomeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backHomeButtonText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});

export default ErrorScreen; 