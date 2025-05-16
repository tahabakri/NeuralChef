import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { CheckCircle, Circle } from 'lucide-react-native'; // Assuming lucide-react-native is installed

interface RecipeStepProps {
  number: number;
  instruction: string;
  imageUrl?: string;
  isLoading?: boolean;
}

export default function RecipeStep({
  number,
  instruction,
  imageUrl,
  isLoading = false
}: RecipeStepProps) {
  const [isDone, setIsDone] = useState(false);

  const handlePress = () => {
    setIsDone(!isDone);
    // No state store update here due to dependency issues
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, isDone && styles.containerDone]}>
      <View style={styles.header}>
        <View style={[styles.stepNumber, isDone && styles.stepNumberDone]}>
          <Text style={[styles.stepNumberText, isDone && styles.stepNumberTextDone]}>{number}</Text>
        </View>
        <Text style={[styles.instruction, isDone && styles.instructionDone]}>{instruction}</Text>
        <View style={styles.checkboxContainer}>
           {isDone ? (
             <CheckCircle size={24} color={colors.primary} />
           ) : (
             <Circle size={24} color={colors.textSecondary} />
           )}
         </View>
      </View>
      
      {(imageUrl || isLoading) && (
        <View style={styles.imageContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Generating image...</Text>
            </View>
          ) : imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
    padding: 16, // Add padding to the container instead of header
  },
  containerDone: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16, // Add spacing below header if image/loading is present
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberDone: {
    backgroundColor: colors.textSecondary,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  stepNumberTextDone: {
    // No change needed for text color usually
  },
  instruction: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginRight: 12, // Add space before checkbox
  },
  instructionDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  checkboxContainer: {
    // No change needed for checkbox container
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: colors.cardAlt,
    // marginTop: 8, // Removed, spacing handled by header margin
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
});