import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
// import { Image } from 'expo-image'; // Replaced with CachedImage
import CachedImage from './CachedImage'; // Added CachedImage
import colors from '@/constants/colors';

export interface PopularCombinationCardProps {
  combination: {
    id: string;
    name: string;
    ingredients: string[];
    image: string;
  };
  onPress: () => void;
}

export default function PopularCombinationCard({ combination, onPress }: PopularCombinationCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <CachedImage source={combination.image} style={styles.image} contentFit="cover" />
      <View style={styles.overlay}>
        <Text style={styles.title}>{combination.name}</Text>
        <Text style={styles.ingredients}>{combination.ingredients.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 200,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  ingredients: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
