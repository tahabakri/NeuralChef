import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

export interface TagSelectorProps {
  categories?: string[];
  selectedCategories?: string[];
  onSelectCategory?: (category: string) => void;
  allowMultiple?: boolean;
  containerStyle?: ViewStyle;
  // Add new props to support popular.tsx usage
  tags?: string[];
  selectedTag?: string;
  onSelectTag?: React.Dispatch<React.SetStateAction<string>>;
}

export default function TagSelector({ 
  categories = [], 
  selectedCategories = [], 
  onSelectCategory, 
  containerStyle,
  // Support both API styles
  tags = [],
  selectedTag = '',
  onSelectTag
}: TagSelectorProps) {
  // Use either tags or categories depending on which is provided
  const items = tags.length > 0 ? tags : categories;
  
  const handleItemSelect = (item: string) => {
    if (onSelectTag) {
      onSelectTag(item);
    } else if (onSelectCategory) {
      onSelectCategory(item);
    }
  };
  
  const isItemSelected = (item: string) => {
    if (tags.length > 0) {
      return item === selectedTag;
    }
    return selectedCategories.includes(item);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, containerStyle]}
    >
      {items.map(item => (
        <TouchableOpacity
          key={item}
          style={[
            styles.tag,
            isItemSelected(item) && styles.selectedTag
          ]}
          onPress={() => handleItemSelect(item)}
        >
          <Text style={[
            styles.tagText,
            isItemSelected(item) && styles.selectedTagText
          ]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  tag: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTag: {
    backgroundColor: colors.primary,
  },
  tagText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  selectedTagText: {
    color: colors.white,
    fontWeight: '600',
  },
});
