import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface TutorialStepProps {
  onNext: () => void;
  onPrevious: () => void;
  stepIndex: number;
  totalSteps: number;
  step: number; // Tutorial step number (1-4)
}

const { width } = Dimensions.get('window');

const tutorials = [
  {
    id: 1,
    title: 'Scan Your Ingredients',
    description: 'Take a photo of your ingredients or scan your grocery receipt to quickly input what you have available.',
    image: require('@/assets/images/tutorial-1.png'),
  },
  {
    id: 2,
    title: 'Get AI-Powered Recipes',
    description: 'Our AI will suggest personalized recipes based on your ingredients, preferences, and dietary restrictions.',
    image: require('@/assets/images/tutorial-2.png'),
  },
  {
    id: 3,
    title: 'Follow Step-by-Step Instructions',
    description: 'Each recipe comes with detailed, easy-to-follow instructions and cooking tips.',
    image: require('@/assets/images/tutorial-3.png'),
  },
  {
    id: 4,
    title: 'Save & Share Your Favorites',
    description: 'Save recipes you love for quick access later, and share them with friends and family.',
    image: require('@/assets/images/tutorial-4.png'),
  },
];

const TutorialStep = ({ onNext, onPrevious, stepIndex, totalSteps, step }: TutorialStepProps) => {
  const tutorial = tutorials[step - 1];
  const isLastTutorial = step === tutorials.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevious} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${((stepIndex + 1) / totalSteps) * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Image
          source={tutorial.image}
          style={styles.illustration}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{tutorial.title}</Text>
          <Text style={styles.description}>{tutorial.description}</Text>
        </View>
        
        <View style={styles.paginationContainer}>
          {tutorials.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot, 
                index === step - 1 && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={onNext}
        >
          <LinearGradient
            colors={['#FFA726', '#FB8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.continueButtonText}>
              {isLastTutorial ? 'Get Started' : 'Continue'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {!isLastTutorial && (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => {
              // This will skip to the end of the tutorial steps
              for (let i = step; i < tutorials.length; i++) {
                onNext();
              }
            }}
          >
            <Text style={styles.skipButtonText}>Skip Tutorial</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    paddingRight: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  illustration: {
    width: width * 0.85,
    height: width * 0.85,
    marginTop: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  continueButton: {
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
  continueButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  skipButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});

export default TutorialStep; 