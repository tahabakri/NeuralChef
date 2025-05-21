import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

type GenerationStage = 'initial' | 'text' | 'images' | 'complete';

interface GenerationProgressProps {
  stage: GenerationStage;
  message?: string;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
  stage,
  message = "Crafting your recipe..." 
}) => {
  const [progress] = useState(new Animated.Value(0));
  const [stageProgress, setStageProgress] = useState(0);
  
  // Animate progress based on current stage
  useEffect(() => {
    let targetValue = 0;
    
    switch(stage) {
      case 'initial':
        targetValue = 0.1;
        break;
      case 'text':
        targetValue = 0.5;
        break;
      case 'images':
        targetValue = 0.9;
        break;
      case 'complete':
        targetValue = 1;
        break;
    }
    
    Animated.timing(progress, {
      toValue: targetValue,
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
    
    setStageProgress(targetValue * 100);
  }, [stage]);

  // Get the appropriate animation based on stage
  const getAnimationSource = () => {
    switch(stage) {
      case 'initial':
        return require('@/assets/animations/cooking.json');
      case 'text':
        return require('@/assets/animations/magic-wand.json');
      case 'images':
        return require('@/assets/animations/shopping-list.json');
      case 'complete':
        return require('@/assets/animations/recipe-success.json');
      default:
        return require('@/assets/animations/cooking.json');
    }
  };

  // Calculate stage-specific text
  const getStageText = (): string => {
    switch(stage) {
      case 'initial':
        return 'Preparing...';
      case 'text':
        return 'Creating recipe...';
      case 'images':
        return 'Visualizing dish...';
      case 'complete':
        return 'Recipe complete!';
      default:
        return 'Generating...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.animationContainer}>
          <LottieView
            source={getAnimationSource()}
            autoPlay
            loop={stage !== 'complete'}
            style={styles.animation}
          />
        </View>
        
        <Text style={styles.messageText}>{message}</Text>
        
        <Text style={styles.stageText}>{getStageText()}</Text>
        
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }) 
            }]}
          />
        </View>
        
        <Text style={styles.percentText}>{Math.round(stageProgress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  animationContainer: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  messageText: {
    ...typography.heading2,
    textAlign: 'center',
    marginBottom: 8,
    color: colors.text,
  },
  stageText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  percentText: {
    ...typography.caption,
    color: colors.textSecondary,
  }
});

export default GenerationProgress; 