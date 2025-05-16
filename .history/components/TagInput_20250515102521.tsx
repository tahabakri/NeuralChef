import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { X, Mic } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import colors from '@/constants/colors';

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
}

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
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  
  // Parse comma-separated string into array of tags
  const tags = value.split(',').filter(tag => tag.trim() !== '').map(tag => tag.trim());
  
  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Show suggestions if text is not empty
    if (text.trim() !== '') {
      const filtered = suggestions.filter(item => 
        item.toLowerCase().includes(text.toLowerCase()) && 
        !tags.includes(item)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const addTag = (tag: string) => {
    if (tag.trim() === '') return;
    
    // Don't add duplicates
    if (tags.includes(tag.trim())) return;
    
    const newValue = [...tags, tag.trim()].join(', ');
    onChangeText(newValue);
    setInputValue('');
    setShowSuggestions(false);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChangeText(newTags.join(', '));
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (nativeEvent.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove the last tag
      removeTag(tags.length - 1);
    }
  };
  
  const handleSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (inputValue.trim()) {
      addTag(inputValue);
    } else if (inputValue.includes(',')) {
      // Handle comma-separated input
      const newTags = inputValue.split(',').filter(t => t.trim() !== '').map(t => t.trim());
      if (newTags.length > 0) {
        const existingWithNew = [...tags, ...newTags].join(', ');
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
    if (onVoiceInput) {
      onVoiceInput();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
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
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => removeTag(index)}
                style={styles.tagRemove}
              >
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
          
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={[styles.input, inputStyle]}
              value={inputValue}
              onChangeText={handleInputChange}
              placeholder={tags.length === 0 ? placeholder : ''}
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={handleSubmitEditing}
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
        {onVoiceInput && (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoiceInput}
          >
            <Mic size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Suggestions */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            nestedScrollEnabled 
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => selectSuggestion(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
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
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
    marginRight: 6,
  },
  tagRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionsList: {
    padding: 8,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
  },
}); 