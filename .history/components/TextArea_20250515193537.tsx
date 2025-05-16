import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import { Microphone } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { commonIngredients } from '../constants/ingredients';

interface Tag {
  id: string;
  text: string;
}

interface TextAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  tags: Tag[];
  placeholder?: string;
  style?: ViewStyle;
  onVoiceInput?: (text: string) => void;
  maxHeight?: number;
  minHeight?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChangeText,
  onAddTag,
  onRemoveTag,
  tags,
  placeholder = 'Type ingredients separated by commas...',
  style,
  onVoiceInput,
  maxHeight = 120,
  minHeight = 50,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [height, setHeight] = useState(minHeight);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  // Handle suggestions based on current input
  useEffect(() => {
    if (value.trim() && isFocused) {
      // Get the current word being typed
      const lastWord = value.split(',').pop()?.trim().toLowerCase() || '';
      
      if (lastWord.length > 1) {
        const matchedSuggestions = commonIngredients
          .filter(ingredient => 
            ingredient.toLowerCase().startsWith(lastWord) &&
            !tags.some(tag => tag.text.toLowerCase() === ingredient.toLowerCase())
          )
          .slice(0, 5); // Limit to 5 suggestions
        
        setSuggestions(matchedSuggestions);
        setShowSuggestions(matchedSuggestions.length > 0);
        
        // Animate the suggestions in
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        setShowSuggestions(false);
        // Animate the suggestions out
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }
    } else {
      setShowSuggestions(false);
      // Animate the suggestions out
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [value, isFocused, tags, animatedOpacity]);

  // This function is a placeholder for voice input implementation
  // In a real app, you would integrate react-native-voice or a similar library
  const startVoiceRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    
    // Mock voice recording with a timeout
    setTimeout(() => {
      setIsRecording(false);
      // This is where you would normally get the actual transcribed text
      const mockTranscribedText = "chicken, rice, broccoli";
      
      if (onVoiceInput) {
        onVoiceInput(mockTranscribedText);
      } else {
        // Add the transcribed text to the input
        const newText = value ? `${value}, ${mockTranscribedText}` : mockTranscribedText;
        onChangeText(newText);
        
        // Process the transcribed text into tags
        mockTranscribedText.split(',').forEach(item => {
          const trimmedItem = item.trim();
          if (trimmedItem) {
            onAddTag({
              id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              text: trimmedItem
            });
          }
        });
      }
    }, 2000); // Simulate 2 seconds of recording
  };

  // Handle selecting a suggestion
  const handleSuggestionPress = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Replace the current word being typed with the selected suggestion
    const words = value.split(',');
    words.pop(); // Remove the last word (which is incomplete)
    
    // Add the selected suggestion
    const newText = [...words, suggestion].join(', ');
    onChangeText(newText + ', ');
    
    // Add the suggestion as a tag
    onAddTag({
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: suggestion
    });
    
    setShowSuggestions(false);
  };

  // Handle comma detection to create tags
  const handleTextChange = (text: string) => {
    onChangeText(text);
    
    // Check if the last character is a comma
    if (text.endsWith(',')) {
      const lastItem = text.split(',').slice(-2)[0]?.trim();
      
      if (lastItem && !tags.some(tag => tag.text.toLowerCase() === lastItem.toLowerCase())) {
        // Add the item before the comma as a tag
        onAddTag({
          id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: lastItem
        });
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Tags */}
      <View style={styles.tagsContainer}>
        <FlatList
          data={tags}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tag}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRemoveTag(item.id);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.tagText}>{item.text}</Text>
              <Text style={styles.removeTag}>×</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.placeholderText}>No ingredients added yet</Text>
          )}
        />
      </View>
      
      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { height: Math.max(minHeight, Math.min(height, maxHeight)) }
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9E9E9E"
          multiline
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onContentSizeChange={(e) => {
            setHeight(e.nativeEvent.contentSize.height);
          }}
        />
        
        {/* Voice Input Button */}
        <TouchableOpacity
          style={[
            styles.voiceButton,
            isRecording && styles.recordingButton
          ]}
          onPress={startVoiceRecording}
          disabled={isRecording}
        >
          <Microphone 
            size={20} 
            color={isRecording ? "#fff" : "#34C759"} 
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
      
      {/* Autocomplete Suggestions */}
      {showSuggestions && (
        <Animated.View 
          style={[
            styles.suggestionsContainer,
            { opacity: animatedOpacity }
          ]}
        >
          <BlurView intensity={30} style={styles.blur}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`suggestion-${index}`}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    overflow: 'visible',
  },
  tagsContainer: {
    padding: 8,
    minHeight: 50,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#34C759',
    fontWeight: '600',
    marginRight: 4,
  },
  removeTag: {
    color: '#34C759',
    fontWeight: '700',
    fontSize: 16,
  },
  placeholderText: {
    color: '#9E9E9E',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recordingButton: {
    backgroundColor: '#34C759',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    maxHeight: 200,
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  blur: {
    padding: 4,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TextArea;