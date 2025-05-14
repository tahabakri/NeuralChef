import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';

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
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <Text style={styles.instruction}>{instruction}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
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
  stepNumberText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  instruction: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: colors.cardAlt,
    marginTop: 8,
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