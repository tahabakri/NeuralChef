import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Filter, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import { useRecipeHistoryStore } from '@/stores/recipeHistoryStore';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  showPopularTags?: boolean;
}

export default function TagFilter({ 
  selectedTags = [], 
  onTagsChange, 
  showPopularTags = true 
}: TagFilterProps) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  
  const savedRecipesTags = useSavedRecipesStore(state => state.getAllTags());
  const historyTags = useRecipeHistoryStore(state => state.getHistoryTags());
  
  useEffect(() => {
    // Combine tags from both stores and remove duplicates
    const combinedTags = [...new Set([...savedRecipesTags, ...historyTags])];
    setAllTags(combinedTags);
    
    // Determine popular tags (in a real app, this would be based on frequency)
    const popular = combinedTags.slice(0, 5); // Just take first 5 for now
    setPopularTags(popular);
  }, [savedRecipesTags, historyTags]);
  
  const handleSelectTag = (tag: string) => {
    // Toggle tag selection
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };
  
  const handleClearAll = () => {
    onTagsChange([]);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Filter size={16} color="#000000" />
          <Text style={styles.title}>Filter by Tags</Text>
        </View>
        
        {selectedTags.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {selectedTags.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.sectionTitle}>Selected:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {selectedTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagButton, styles.selectedTag]}
                onPress={() => handleSelectTag(tag)}
              >
                <Text style={styles.selectedTagText}>{tag}</Text>
                <X size={12} color="#FFFFFF" style={styles.tagIcon} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {showPopularTags && popularTags.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Popular Tags:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {popularTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  selectedTags.includes(tag) ? styles.selectedTag : styles.unselectedTag
                ]}
                onPress={() => handleSelectTag(tag)}
              >
                <Text 
                  style={selectedTags.includes(tag) ? styles.selectedTagText : styles.unselectedTagText}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {allTags.length > 0 && (
        <View style={styles.allTagsContainer}>
          <Text style={styles.sectionTitle}>All Tags:</Text>
          <View style={styles.allTagsGrid}>
            {allTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  selectedTags.includes(tag) ? styles.selectedTag : styles.unselectedTag
                ]}
                onPress={() => handleSelectTag(tag)}
              >
                <Text 
                  style={selectedTags.includes(tag) ? styles.selectedTagText : styles.unselectedTagText}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {allTags.length === 0 && (
        <Text style={styles.emptyText}>No tags found. Add tags to your recipes to enable filtering.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearAll: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#8E8E93',
  },
  selectedContainer: {
    marginBottom: 16,
  },
  tagsScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: '#5AC8FA',
  },
  unselectedTag: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#DCDCDC',
  },
  selectedTagText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  unselectedTagText: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  tagIcon: {
    marginLeft: 4,
  },
  allTagsContainer: {
    marginTop: 8,
  },
  allTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
}); 