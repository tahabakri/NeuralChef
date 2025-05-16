import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

interface CategoryTagProps {
  category: string;
  size?: 'small' | 'medium' | 'large';
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'breakfast':
      return '#FF9500'; // Orange
    case 'lunch':
      return '#34C759'; // Green
    case 'dinner':
      return '#5856D6'; // Purple
    case 'dessert':
      return '#FF2D55'; // Red
    case 'snack':
      return '#5AC8FA'; // Blue
    case 'appetizer':
      return '#FFCC00'; // Yellow
    default:
      return '#8E8E93'; // Gray
  }
};

export default function CategoryTag({ category, size = 'medium' }: CategoryTagProps) {
  if (!category) return null;
  
  const backgroundColor = `${getCategoryColor(category)}20`; // 20% opacity
  const borderColor = getCategoryColor(category);
  const textColor = getCategoryColor(category);
  
  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor, borderColor },
        size === 'small' && styles.smallContainer,
        size === 'large' && styles.largeContainer,
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { color: textColor },
          size === 'small' && styles.smallText,
          size === 'large' && styles.largeText,
        ]}
      >
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  smallContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  largeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 16,
  },
}); 