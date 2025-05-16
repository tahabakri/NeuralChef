import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Tag, X } from 'lucide-react-native';
import CustomTag from './CustomTag';
import colors from '@/constants/colors';

interface TagFilterProps {
  allTags: string[];  // All available tags across recipes
  selectedTags: string[];  // Currently selected tags for filtering
  onSelectTag: (tag: string) => void;  // Toggle tag selection
  onClearFilters: () => void;  // Clear all filters
}

export default function TagFilter({
  allTags,
  selectedTags,
  onSelectTag,
  onClearFilters
}: TagFilterProps) {
  // Sort tags by usage (for a real app, you'd track usage count)
  // For now, we'll just use the order provided
  const popularTags = allTags;

  if (popularTags.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Tag size={16} color={colors.primaryText} />
          <Text style={styles.title}>Filter by Tags</Text>
        </View>
        
        {selectedTags.length > 0 && (
          <TouchableOpacity onPress={onClearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
            <X size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
      >
        {popularTags.map((tag) => (
          <CustomTag
            key={tag}
            tag={tag}
            selected={selectedTags.includes(tag)}
            onPress={() => onSelectTag(tag)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginLeft: 6,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  tagsContainer: {
    paddingVertical: 4,
    flexDirection: 'row',
  },
}); 