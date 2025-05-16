import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';

export interface CardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export default function Card({ 
  title, 
  description, 
  imageUrl, 
  onPress, 
  style, 
  children 
}: CardProps) {
  const content = children || (
    <>
      <Image 
        source={{ uri: imageUrl || 'https://via.placeholder.com/150?text=No+Image' }} 
        style={styles.image} 
        contentFit="cover" 
      />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 250,
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
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});