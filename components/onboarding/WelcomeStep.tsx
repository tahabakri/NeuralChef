import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

export interface WelcomeStepProps {
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

const { width, height } = Dimensions.get('window');

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <LinearGradient
      colors={['#FFF3E0', '#FFE0B2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/welcome-illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to ReciptAI</Text>
          <Text style={styles.subtitle}>
            Transform your ingredients into delicious recipes with the power of AI
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFA726', '#FB8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  illustration: {
    width: width * 0.8,
    height: height * 0.3,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '90%',
  },
  button: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});

export default WelcomeStep; 