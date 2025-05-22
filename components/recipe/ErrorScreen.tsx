import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

const ErrorScreen = ({ error, onRetry, onBack }: ErrorScreenProps) => {
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <LinearGradient
      colors={[colors.softPeachStart, colors.softPeachEnd]}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <View style={styles.illustrationContainer}>
          <Animated.View style={animatedStyle}>
            <LottieView
              source={require('@/assets/animations/error.json')}
              autoPlay
              loop={true}
              style={styles.errorAnimation}
            />
          </Animated.View>
        </View>
        
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorMessage}>{error || 'Something went wrong'}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onRetry}>
            <LinearGradient
              colors={[colors.sunriseOrangeStart, colors.sunriseOrangeEnd]}
              style={styles.retryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="refresh" size={20} color={colors.white} />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
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
  illustrationContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  errorAnimation: {
    width: 200,
    height: 200,
  },
  errorTitle: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 10,
  },
  errorMessage: {
    ...typography.bodyLarge,
    lineHeight: typography.bodyLarge.fontSize ? typography.bodyLarge.fontSize * 1.4 : 22,
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
    color: colors.success,
  },
});

export default ErrorScreen;
