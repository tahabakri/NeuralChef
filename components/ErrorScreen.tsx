import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import LottieIllustration from './LottieIllustration'; // Added LottieIllustration import
import colors from '@/constants/colors';
import { RecipeErrorType } from '@/services/recipeService'; // Import RecipeErrorType

interface ErrorScreenProps {
  title?: string;
  message?: string;
  buttonText?: string;
  errorType?: RecipeErrorType; // Use RecipeErrorType
  imageUri?: string;
  onTryAgain?: () => void;
}

export default function ErrorScreen({
  title: propTitle, // Renamed to avoid conflict
  message: propMessage, // Renamed to avoid conflict
  buttonText = 'Try Again',
  errorType = RecipeErrorType.GENERATE_ERROR, // Default to an enum member
  imageUri = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=2029&auto=format&fit=crop',
  onTryAgain
}: ErrorScreenProps) {

  // Determine if it's a "Recipe Not Found" error
  const isRecipeNotFound = errorType === RecipeErrorType.RECIPE_NOT_FOUND;

  const title = propTitle ?? (isRecipeNotFound ? "Recipe Not Found" : "Generation Failed");
  const message = propMessage ?? (isRecipeNotFound
    ? "Oops! No recipe magic here! Let’s try something tasty instead!"
    : "We couldn't create a recipe with these ingredients. Please try different ingredients or try again later.");

  const handleTryAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onTryAgain) onTryAgain();
  };
  
  // Different icons based on error type
  const renderIcon = () => {
    switch (errorType) {
      case RecipeErrorType.FETCH_ERROR: // Assuming 'network' maps to FETCH_ERROR
        return <AlertCircle size={48} color={colors.error} />;
      // case RecipeErrorType.TIMEOUT_ERROR: // Add if you have a timeout error type
      //   return <AlertCircle size={48} color={colors.warning} />;
      // case RecipeErrorType.VALIDATION_ERROR: // Add if you have a validation error type
      //   return <AlertCircle size={48} color={colors.primary} />;
      case RecipeErrorType.GENERATE_ERROR:
      // case RecipeErrorType.UNKNOWN_ERROR: // Add if you have an unknown error type
      default:
        return <AlertCircle size={48} color={colors.error} />;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {isRecipeNotFound ? (
          <LottieIllustration
            type="magic-wand" // Corrected to use type prop
            style={styles.lottieAnimation}
            autoPlay
            loop
          />
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
          />
        ) : (
          renderIcon()
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {onTryAgain && (
          <TouchableOpacity
            onPress={handleTryAgain}
            style={styles.buttonContainer}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FF9966', '#FF5E62']} // Sunrise Orange gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  lottieAnimation: { // Added style for Lottie animation
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
