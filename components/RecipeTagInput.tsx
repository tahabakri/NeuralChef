import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Keyboard,
  Animated,
  FlatList,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Tag, Plus } from 'lucide-react-native';
import CustomTag from './CustomTag';
import colors from '@/constants/colors';

// Common recipe tags for suggestions
const POPULAR_TAGS = [
  'quick', 'easy', 'healthy', 'dinner', 'lunch', 'breakfast', 
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
  'comfort food', 'weeknight', 'meal prep', 'party',
  'italian', 'mexican', 'asian', 'dessert', 'snack',
  'high protein', 'low carb', 'keto', 'paleo', 'family favorite',
  'spicy', 'sweet', 'savory', 'baked', 'grilled', 'fried',
  '30 minutes', 'one pot', 'slow cooker', 'instant pot'
];

interface RecipeTagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  recipeIngredients?: string[]; // For generating auto suggestions
  recipeTitle?: string; // For generating auto suggestions
  maxTags?: number;
}

export default function RecipeTagInput({ 
  tags, 
  onTagsChange, 
  recipeIngredients = [], 
  recipeTitle = '',
  maxTags = 5
}: RecipeTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  
  // Generate suggestions based on recipe content
  useEffect(() => {
    generateSuggestions('');
  }, [recipeIngredients, recipeTitle]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filteredSuggestions = generateSuggestions(inputValue.trim().toLowerCase());
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
      
      // Animate suggestion panel
      Animated.timing(animatedHeight, {
        toValue: filteredSuggestions.length > 0 ? 150 : 0,
        duration: 200,
        useNativeDriver: false
      }).start();
    } else {
      setShowSuggestions(false);
      
      // Animate suggestion panel closed
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start();
    }
  }, [inputValue]);

  const generateSuggestions = (query: string): string[] => {
    // Start with popular tags
    let tagSuggestions = [...POPULAR_TAGS];
    
    // Add suggestions based on ingredients
    if (recipeIngredients && recipeIngredients.length > 0) {
      // Extract descriptive words from ingredients
      const descriptiveWords = recipeIngredients
        .flatMap(ingredient => ingredient.toLowerCase().split(' '))
        .filter(word => word.length > 3) // Only meaningful words
        .filter(word => !['with', 'and', 'the', 'from', 'fresh'].includes(word)); // Filter common words
      
      tagSuggestions = [...tagSuggestions, ...descriptiveWords];
    }
    
    // Add suggestions based on title
    if (recipeTitle) {
      const titleWords = recipeTitle
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 3)
        .filter(word => !['with', 'and', 'the', 'recipe'].includes(word));
      
      tagSuggestions = [...tagSuggestions, ...titleWords];
    }
    
    // Remove duplicates
    tagSuggestions = Array.from(new Set(tagSuggestions));
    
    // Filter by query
    if (query) {
      tagSuggestions = tagSuggestions.filter(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Filter out tags that are already added
    tagSuggestions = tagSuggestions.filter(tag => 
      !tags.some(existingTag => existingTag.toLowerCase() === tag.toLowerCase())
    );
    
    // Limit suggestions
    return tagSuggestions.slice(0, 10);
  };

  const handleAddTag = (tag: string) => {
    if (tags.length >= maxTags) {
      // Provide haptic feedback for error
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    // Don't add if already exists (case insensitive)
    if (tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
      return;
    }
    
    // Add new tag
    const updatedTags = [...tags, tag];
    onTagsChange(updatedTags);
    setInputValue('');
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveTag = (index: number) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    onTagsChange(updatedTags);
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      handleAddTag(inputValue.trim());
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleAddTag(suggestion);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.tagInputContainer}>
        <Tag size={18} color={colors.primaryText} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={tags.length >= maxTags ? `Maximum ${maxTags} tags reached` : "Add a tag..."}
          placeholderTextColor={colors.secondaryText}
          onSubmitEditing={handleInputSubmit}
          editable={tags.length < maxTags}
        />
        {inputValue.trim() && (
          <TouchableOpacity onPress={handleInputSubmit} style={styles.addButton}>
            <Plus size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      
      <Animated.View style={[styles.suggestionsContainer, { height: animatedHeight }]}>
        {showSuggestions && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            horizontal={false}
            showsVerticalScrollIndicator={true}
          />
        )}
      </Animated.View>
      
      <View style={styles.tagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagScrollContainer}>
          {tags.map((tag, index) => (
            <CustomTag
              key={`${tag}-${index}`}
              tag={tag}
              onDelete={() => handleRemoveTag(index)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    fontSize: 16,
    padding: 0,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagScrollContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  suggestionsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    color: colors.primaryText,
    fontSize: 14,
  },
}); 