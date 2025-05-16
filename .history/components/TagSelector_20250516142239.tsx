import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Plus } from 'lucide-react-native';
import CategoryTag, { TagInput } from '@/components/CategoryTag';
import colors from '@/constants/colors';

// Common tags that might be auto-suggested
const COMMON_TAGS = [
  'quick', 'easy', 'healthy', 'vegetarian', 'vegan', 
  'gluten-free', 'dairy-free', 'low-carb', 'keto',
  'breakfast', 'lunch', 'dinner', 'dessert', 'snack',
  'comfort food', 'meal prep', 'weeknight', 'special occasion'
];

// Auto-suggestion based on ingredients or recipe title
const generateSuggestions = (recipeTitle: string, ingredients: string[] = []): string[] => {
  const suggestions: string[] = [];
  
  // Ingredient-based suggestions
  const lowerIngredients = ingredients.map(i => i.toLowerCase());
  if (lowerIngredients.some(i => i.includes('chicken'))) suggestions.push('poultry');
  if (lowerIngredients.some(i => i.includes('beef') || i.includes('pork') || i.includes('lamb'))) suggestions.push('meat');
  if (lowerIngredients.some(i => i.includes('pasta') || i.includes('rice') || i.includes('grain'))) suggestions.push('grain-based');
  if (lowerIngredients.some(i => i.includes('fish') || i.includes('salmon') || i.includes('tuna'))) suggestions.push('seafood');
  if (lowerIngredients.some(i => i.includes('vegetable'))) suggestions.push('veggie-rich');
  
  // Time-based suggestions
  const lowerTitle = recipeTitle.toLowerCase();
  if (lowerTitle.includes('quick') || lowerTitle.includes('15 min') || lowerTitle.includes('30 min')) {
    suggestions.push('quick');
  }
  
  // Meal type suggestions
  if (lowerTitle.includes('soup') || lowerTitle.includes('stew')) suggestions.push('soup');
  if (lowerTitle.includes('salad')) suggestions.push('salad');
  if (lowerTitle.includes('sandwich')) suggestions.push('sandwich');
  if (lowerTitle.includes('pasta')) suggestions.push('pasta');
  if (lowerTitle.includes('dessert') || lowerTitle.includes('cake') || lowerTitle.includes('cookie')) suggestions.push('dessert');
  
  return suggestions.slice(0, 5); // Limit to 5 suggestions
};

interface TagSelectorProps {
  recipeTags: string[];
  onTagsChange: (tags: string[]) => void;
  recipeTitle: string;
  ingredients?: string[];
  maxTags?: number;
}

export default function TagSelector({ 
  recipeTags = [], 
  onTagsChange, 
  recipeTitle, 
  ingredients = [],
  maxTags = 5 
}: TagSelectorProps) {
  const [newTag, setNewTag] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate tag suggestions based on recipe title and ingredients
    const suggestions = generateSuggestions(recipeTitle, ingredients);
    
    // Filter out suggestions that are already added as tags
    const filteredSuggestions = suggestions.filter(
      tag => !recipeTags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
    
    setSuggestedTags(filteredSuggestions);
    
    // Set some popular tags (in a real app, these would come from analytics)
    setPopularTags(COMMON_TAGS.slice(0, 5));
  }, [recipeTitle, ingredients, recipeTags]);
  
  const handleAddTag = () => {
    if (newTag.trim() && recipeTags.length < maxTags) {
      // Check for duplicates (case insensitive)
      if (!recipeTags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
        onTagsChange([...recipeTags, newTag.trim()]);
      }
      setNewTag('');
      setShowInput(false);
    }
  };
  
  const handleDeleteTag = (index: number) => {
    const updatedTags = [...recipeTags];
    updatedTags.splice(index, 1);
    onTagsChange(updatedTags);
  };
  
  const handleAddSuggestion = (tag: string) => {
    if (recipeTags.length < maxTags) {
      // Check for duplicates (case insensitive)
      if (!recipeTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        onTagsChange([...recipeTags, tag]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tags</Text>
      
      <View style={styles.tagsContainer}>
        {recipeTags.map((tag, index) => (
          <CategoryTag
            key={`${tag}-${index}`}
            category={tag}
            isCustomTag={true}
            onDelete={() => handleDeleteTag(index)}
          />
        ))}
        
        {showInput ? (
          <TagInput
            value={newTag}
            onChangeText={setNewTag}
            onSubmit={handleAddTag}
          />
        ) : recipeTags.length < maxTags && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowInput(true)}
          >
            <Plus size={16} color="#5AC8FA" />
            <Text style={styles.addButtonText}>Add Tag</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {suggestedTags.length > 0 && (
        <View>
          <Text style={styles.sectionHeader}>Suggested Tags</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
            {suggestedTags.map((tag) => (
              <TouchableOpacity 
                key={tag} 
                style={styles.suggestionButton}
                onPress={() => handleAddSuggestion(tag)}
              >
                <Text style={styles.suggestionText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {popularTags.length > 0 && (
        <View>
          <Text style={styles.sectionHeader}>Popular Tags</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
            {popularTags.map((tag) => (
              <TouchableOpacity 
                key={tag} 
                style={styles.suggestionButton}
                onPress={() => handleAddSuggestion(tag)}
              >
                <Text style={styles.suggestionText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {recipeTags.length >= maxTags && (
        <Text style={styles.maxTagsNote}>Maximum of {maxTags} tags reached</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5AC8FA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#5AC8FA20',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5AC8FA',
    marginLeft: 4,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    color: '#8E8E93',
  },
  suggestionsScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  suggestionButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#5AC8FA',
  },
  maxTagsNote: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 8,
  },
}); 