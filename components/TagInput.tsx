import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  Keyboard,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { X, Mic, AlertCircle, Tag, Plus, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  Easing 
} from 'react-native-reanimated';
import colors from '@/constants/colors';
import { commonIngredients, validateIngredient } from '@/constants/ingredients';
import CustomTag from './CustomTag';
import VoiceInputModal from './VoiceInputModal';

interface TagInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onVoiceInput?: () => void;
  validateTag?: (tag: string) => boolean | string;
  initialOcrIngredients?: string[];
  isLoadingOcr?: boolean;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  recipeIngredients?: string[];
  recipeTitle?: string;
  maxTags?: number;
}

// Popular tags shown to users
const POPULAR_TAGS = [
  'breakfast', 'lunch', 'dinner',
  'quick', 'easy', 'healthy',
  'vegetarian', 'vegan',  
  'italian', 'mexican', 'asian', 'indian',
  'dessert', 'snack', 'soup', 'salad'
];

export default function TagInput({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  value,
  onChangeText,
  placeholder,
  suggestions = [],
  onVoiceInput,
  validateTag,
  initialOcrIngredients = [],
  isLoadingOcr = false,
  tags,
  onTagsChange,
  recipeIngredients = [],
  recipeTitle = '',
  maxTags = 5
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [invalidTags, setInvalidTags] = useState<Record<string, string>>({});
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  
  // Parse comma-separated string into array of tags
  const tagsArray = value.split(',').filter(tag => tag.trim() !== '').map(tag => tag.trim());
  
  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Show suggestions if text is not empty
    if (text.trim() !== '') {
      // Use the enhanced generateSuggestions function to get relevant matches
      const filtered = generateSuggestions(text);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      
      // Animate suggestion panel
      Animated.timing(animatedHeight, {
        toValue: filtered.length > 0 ? 250 : 0, // Increased height to show more suggestions
        duration: 200,
        useNativeDriver: false
      }).start();
    } else {
      // If text is empty, show a selection of common ingredients as suggestions
      const commonSuggestions = commonIngredients
        .filter(item => !tagsArray.includes(item))
        .slice(0, 15);
      
      if (commonSuggestions.length > 0) {
        setFilteredSuggestions(commonSuggestions);
        setShowSuggestions(true);
        
        // Animate suggestion panel
        Animated.timing(animatedHeight, {
          toValue: 250,
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
    }
  };
  
  const addTag = (tag: string) => {
    if (tag.trim() === '') return;
    
    // Don't add duplicates
    if (tagsArray.includes(tag.trim())) return;
    
    // Validate tag using the imported validateIngredient function
    const validationResult = validateTag ? validateTag(tag.trim()) : validateIngredient(tag.trim());
    
    if (typeof validationResult === 'string') {
      setInvalidTags({...invalidTags, [tag.trim()]: validationResult});
      
      // Provide haptic feedback for error
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    if (validationResult === false) {
      setInvalidTags({...invalidTags, [tag.trim()]: 'Invalid ingredient'});
      
      // Provide haptic feedback for error
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    const newValue = [...tagsArray, tag.trim()].join(', ');
    onChangeText(newValue);
    setInputValue('');
    setShowSuggestions(false);
    
    // Show empty suggestions after adding a tag
    const remainingSuggestions = commonIngredients
      .filter(item => !tagsArray.includes(item) && !item.includes(tag.trim()))
      .slice(0, 15);
    
    if (remainingSuggestions.length > 0) {
      setFilteredSuggestions(remainingSuggestions);
      setShowSuggestions(true);
      
      // Animate suggestion panel
      Animated.timing(animatedHeight, {
        toValue: 250,
        duration: 200,
        useNativeDriver: false
      }).start();
    }
    
    // Provide positive haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const removeTag = (index: number) => {
    const newTags = [...tagsArray];
    const removedTag = newTags[index];
    newTags.splice(index, 1);
    onChangeText(newTags.join(', '));
    
    // Remove from invalid tags if present
    if (invalidTags[removedTag]) {
      const newInvalidTags = {...invalidTags};
      delete newInvalidTags[removedTag];
      setInvalidTags(newInvalidTags);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (nativeEvent.key === 'Backspace' && inputValue === '' && tagsArray.length > 0) {
      // Remove the last tag
      removeTag(tagsArray.length - 1);
    }
  };
  
  const handleSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (inputValue.trim()) {
      addTag(inputValue);
    } else if (inputValue.includes(',')) {
      // Handle comma-separated input
      const newTags = inputValue.split(',').filter(t => t.trim() !== '').map(t => t.trim());
      if (newTags.length > 0) {
        const existingWithNew = [...tagsArray, ...newTags].join(', ');
        onChangeText(existingWithNew);
        setInputValue('');
      }
    }
  };
  
  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
    setShowSuggestions(false);
  };
  
  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };
  
  const handleVoiceInput = () => {
    // Show the voice input modal
    setVoiceModalVisible(true);
    
    // Also call the original onVoiceInput if provided (for backwards compatibility)
    if (onVoiceInput) {
      onVoiceInput();
    }
  };
  
  // Handle voice input result from the modal
  const handleVoiceInputReceived = (text: string) => {
    if (!text) return;
    
    // If the text contains multiple ingredients separated by common conjunctions,
    // split them and add each one separately
    const ingredients = text
      .split(/,|and|with|plus/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Add each ingredient as a tag
    ingredients.forEach(ingredient => {
      addTag(ingredient);
    });
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Animation scales for tag additions
  const getTagAnimatedStyle = (index: number) => {
    const scale = useSharedValue(1);
    
    // Create a subtle pop-in effect when tag is added
    const isNewlyAdded = index === tagsArray.length - 1;
    if (isNewlyAdded) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      );
    }

    return useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }]
      };
    });
  };

  // Effect to handle OCR-detected ingredients
  React.useEffect(() => {
    if (initialOcrIngredients.length > 0) {
      // Filter out any duplicate ingredients that are already in tags
      const filteredIngredients = initialOcrIngredients
        .filter(ing => !tagsArray.includes(ing.trim()));
      
      if (filteredIngredients.length > 0) {
        // Add new ingredients to existing ones
        const newValue = [...tagsArray, ...filteredIngredients].join(', ');
        onChangeText(newValue);
        
        // Provide haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
  }, [initialOcrIngredients]);

  // Function to render OCR loading indicator
  const renderOcrLoadingIndicator = () => {
    if (!isLoadingOcr) return null;
    
    return (
      <View style={styles.ocrLoadingContainer}>
        <Text style={styles.ocrLoadingText}>Processing image...</Text>
        <ActivityIndicator size="small" color={colors.primary} style={styles.ocrLoadingSpinner} />
      </View>
    );
  };

  // Generate suggestions based on recipe content
  useEffect(() => {
    generateSuggestions('');
  }, [recipeIngredients, recipeTitle]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filteredSuggestions = generateSuggestions(inputValue.trim().toLowerCase());
      setFilteredSuggestions(filteredSuggestions);
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
    // Start with common ingredients from our predefined list
    let tagSuggestions = [...commonIngredients];
    
    // Also include popular tags
    tagSuggestions = [...tagSuggestions, ...POPULAR_TAGS];
    
    // Add suggestions based on ingredients
    if (recipeIngredients.length > 0) {
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
    
    // Filter by query - improved matching for better suggestions
    if (query) {
      const lowerQuery = query.toLowerCase();
      
      // Prioritize suggestions: exact starts, contains, then fuzzy match
      const startsWithMatches = tagSuggestions.filter(tag => 
        tag.toLowerCase().startsWith(lowerQuery)
      );
      
      const containsMatches = tagSuggestions.filter(tag => 
        !tag.toLowerCase().startsWith(lowerQuery) && 
        tag.toLowerCase().includes(lowerQuery)
      );
      
      // Combine with priority order
      tagSuggestions = [...startsWithMatches, ...containsMatches];
    }
    
    // Filter out tags that are already added
    tagSuggestions = tagSuggestions.filter(tag => 
      !tagsArray.some(existingTag => existingTag.toLowerCase() === tag.toLowerCase())
    );
    
    // Limit suggestions but show more than before
    return tagSuggestions.slice(0, 15);
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
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      {renderOcrLoadingIndicator()}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : undefined,
      ]}>
        {/* Tags */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScrollView}
          contentContainerStyle={styles.tagsContainer}
        >
          {tagsArray.map((tag, index) => {
            const isInvalid = Boolean(invalidTags[tag]);
            const animatedStyle = getTagAnimatedStyle(index);
            
            return (
              <Animated.View key={index} style={animatedStyle}>
                <View style={[
                  styles.tag,
                  isInvalid && styles.invalidTag
                ]}>
                  {isInvalid && (
                    <AlertCircle size={14} color={colors.error} style={styles.errorIcon} />
                  )}
                  <Text style={[styles.tagText, isInvalid && styles.invalidTagText]}>
                    {tag}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeTag(index)}
                    style={[styles.tagRemove, isInvalid && styles.invalidTagRemove]}
                  >
                    <X size={14} color={isInvalid ? colors.error : colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          })}
          
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={[styles.input, inputStyle]}
              value={inputValue}
              onChangeText={handleInputChange}
              placeholder={tags.length === 0 ? placeholder : ''}
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={handleInputSubmit}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              onFocus={() => {
                if (inputValue.trim() !== '' && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              blurOnSubmit={false}
            />
          </View>
        </ScrollView>
        
        {/* Voice input button */}
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={handleVoiceInput}
        >
          <Mic size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Suggestions */}
      <Animated.View style={[styles.suggestionsContainer, { height: animatedHeight }]}>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              // Highlight matching text
              if (inputValue.trim()) {
                const index = item.toLowerCase().indexOf(inputValue.toLowerCase());
                if (index >= 0) {
                  const beforeMatch = item.substring(0, index);
                  const match = item.substring(index, index + inputValue.length);
                  const afterMatch = item.substring(index + inputValue.length);
                  
                  return (
                    <TouchableOpacity 
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(item)}
                    >
                      <Text style={styles.suggestionText}>
                        {beforeMatch}
                        <Text style={styles.highlightedText}>{match}</Text>
                        {afterMatch}
                      </Text>
                      {commonIngredients.includes(item) && (
                        <View style={styles.ingredientTag}>
                          <Text style={styles.ingredientTagText}>Ingredient</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }
              }
              
              // Default rendering without highlighting
              return (
                <TouchableOpacity 
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                  {commonIngredients.includes(item) && (
                    <View style={styles.ingredientTag}>
                      <Text style={styles.ingredientTagText}>Ingredient</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            horizontal={false}
            showsVerticalScrollIndicator={true}
          />
        )}
      </Animated.View>
      
      {/* Show main error if provided */}
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      
      {/* Show tooltip for invalid tag if hovered/focused */}
      {Object.keys(invalidTags).length > 0 && (
        <Text style={styles.errorSummary}>
          Some ingredients are not recognized. Please check and remove them.
        </Text>
      )}
      
      {/* Voice Input Modal */}
      <VoiceInputModal 
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onInputReceived={handleVoiceInputReceived}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    minHeight: 52,
  },
  inputError: {
    borderColor: colors.error,
  },
  tagsScrollView: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    paddingVertical: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tagBackground,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#28A745',  // Darker green border for better contrast
  },
  invalidTag: {
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    borderColor: colors.error,
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  invalidTagText: {
    color: colors.error,
  },
  tagRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  invalidTagRemove: {
    backgroundColor: 'rgba(255, 76, 76, 0.2)',
  },
  errorIcon: {
    marginRight: 4,
  },
  inputWrapper: {
    flex: 1,
    minWidth: 80,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    padding: 0,
    minWidth: 80,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  errorSummary: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  ocrLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  ocrLoadingText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  ocrLoadingSpinner: {
    marginLeft: 4,
  },
  highlightedText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  ingredientTag: {
    backgroundColor: colors.tagBackground,
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  ingredientTagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
}); 