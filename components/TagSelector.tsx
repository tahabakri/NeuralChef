import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import CategoryTag from './CategoryTag';

interface TagSelectorProps {
  categories: string[];
  onSelectCategory: (category: string) => void;
  selectedCategory?: string;
}

export default function TagSelector({ 
  categories, 
  onSelectCategory,
  selectedCategory
}: TagSelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <CategoryTag
            key={category}
            label={category}
            selected={category === selectedCategory}
            onPress={() => onSelectCategory(category)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
}); 