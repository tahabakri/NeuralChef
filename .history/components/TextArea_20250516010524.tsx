import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
  ViewStyle,
} from 'react-native';
import { Mic } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  Easing,
  interpolateColor,
  withSpring,
  withRepeat,
  withDelay,
  cancelAnimation
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { commonIngredients } from '../constants/ingredients';

interface Tag {
  id: string;
  text: string;
  isValid?: boolean;
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
  validateTag?: (tag: string) => boolean | string;
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
  validateTag,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [height, setHeight] = useState(minHeight);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const animatedOpacity = useSharedValue(0);
  const recordingAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  
  // Animated styles
  const recordingAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        recordingAnimation.value,
        [0, 1],
        ['#F0F0F0', '#34C759']
      ),
      transform: [
        { scale: isRecording ? pulseAnimation.value : (1 + recordingAnimation.value * 0.1) }
      ]
    };
  });
  
  const suggestionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
      transform: [
        { translateY: (1 - animatedOpacity.value) * -10 }
      ]
    };
  });

  // Handle suggestions based on current input
  useEffect(() => {
    if (value.trim() && isFocused) {
      // Get the current word being typed
      const lastWord = value.split(',').pop()?.trim().toLowerCase() || '';
      
      if (lastWord.length > 1) {
        const matchedSuggestions = commonIngredients
          .filter(ingredient => 
            ingredient.toLowerCase().includes(lastWord) &&
            !tags.some(tag => tag.text.toLowerCase() === ingredient.toLowerCase())
          )
          .slice(0, 5); // Limit to 5 suggestions
        
        setSuggestions(matchedSuggestions);
        setShowSuggestions(matchedSuggestions.length > 0);
        
        // Animate the suggestions in
        animatedOpacity.value = withTiming(1, {
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      } else {
        setShowSuggestions(false);
        // Animate the suggestions out
        animatedOpacity.value = withTiming(0, {
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
    } else {
      setShowSuggestions(false);
      // Animate the suggestions out
      animatedOpacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [value, isFocused, tags, animatedOpacity]);

  // This function is a placeholder for voice input implementation
  // In a real app, you would integrate react-native-voice or a similar library
  const startVoiceRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    
    // Animate the recording button color
    recordingAnimation.value = withTiming(1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Start pulsing animation
    pulseAnimation.value = 1;
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite loop
      true // Reverse
    );
    
    // Mock voice recording with a timeout
    setTimeout(() => {
      setIsRecording(false);
      
      // Cancel any ongoing animations
      cancelAnimation(pulseAnimation);
      pulseAnimation.value = withTiming(1, { duration: 300 });
      
      // Reset color animation to initial state
      recordingAnimation.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      // This is where you would normally get the actual transcribed text
      const mockTranscribedText = "chicken, rice, broccoli";
      
      if (onVoiceInput) {
        onVoiceInput(mockTranscribedText);
      } else {
        // Add the transcribed text to the input
        const newText = value ? `${value}, ${mockTranscribedText}` : mockTranscribedText;
        onChangeText(newText);
        
        // Process the transcribed text into tags
        const addedItems: string[] = [];
        
        mockTranscribedText.split(',').forEach(item => {
          const trimmedItem = item.trim();
          if (trimmedItem) {
            addedItems.push(trimmedItem);
            const isValid = validateTag ? validateTag(trimmedItem) === true : true;
            
            onAddTag({
              id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              text: trimmedItem,
              isValid: isValid,
            });
          }
        });
        
        // Show confirmation toast
        if (addedItems.length > 0) {
          Toast.show({
            type: 'success',
            text1: 'Voice Input Processed',
            text2: `Added: ${addedItems.join(', ')}`,
            position: 'bottom',
            visibilityTime: 3000,
            topOffset: 60,
            props: { 
              icon: 'mic'  // Custom icon if Toast library supports it
            }
          });
        }
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
    
    // Add the suggestion as a tag with a small animation
    onAddTag({
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: suggestion,
      isValid: true,
    });
    
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Handle comma detection to create tags
  const handleTextChange = (text: string) => {
    onChangeText(text);
    
    // Check if the last character is a comma
    if (text.endsWith(',')) {
      const lastItem = text.split(',').slice(-2)[0]?.trim();
      
      if (lastItem && !tags.some(tag => tag.text.toLowerCase() === lastItem.toLowerCase())) {
        // Validate the tag if a validation function is provided
        const isValid = validateTag ? validateTag(lastItem) === true : true;
        
        // Add the item before the comma as a tag
        onAddTag({
          id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: lastItem,
          isValid: isValid,
        });
      }
    }
  };
  
  // Handle keyboard navigation through suggestions
  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (showSuggestions && suggestions.length > 0) {
      if (nativeEvent.key === 'ArrowDown') {
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0);
      } else if (nativeEvent.key === 'ArrowUp') {
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1);
      } else if (nativeEvent.key === 'Enter' && selectedSuggestionIndex >= 0) {
        handleSuggestionPress(suggestions[selectedSuggestionIndex]);
      }
    }
  };

  // Add TagItem component to handle individual tag rendering and animations
  const TagItem = React.memo(({ 
    tag, 
    onRemove,
    isNewestTag 
  }: { 
    tag: Tag, 
    onRemove: () => void,
    isNewestTag: boolean 
  }) => {
    const scale = useSharedValue(isNewestTag ? 0.8 : 1);
    
    // If it's the newest tag, animate it
    useEffect(() => {
      if (isNewestTag) {
        scale.value = withSequence(
          withTiming(1.1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
        );
      }
    }, [isNewestTag]);
    
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }]
      };
    });
    
    const isInvalid = tag.isValid === false;
    
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.tag,
            isInvalid && styles.invalidTag
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRemove();
          }}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tagText,
            isInvalid && styles.invalidTagText
          ]}>
            {tag.text}
          </Text>
          <Text style={[
            styles.removeTag,
            isInvalid && styles.invalidRemoveTag
          ]}>×</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  });

  return (
    <View style={[styles.container, style]}>
      {/* Tags */}
      <View style={styles.tagsContainer}>
        <FlatList
          data={tags}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TagItem 
              tag={item}
              onRemove={() => onRemoveTag(item.id)}
              isNewestTag={index === tags.length - 1}
            />
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
          onKeyPress={handleKeyPress}
        />
        
        {/* Voice Input Button */}
        <Animated.View style={recordingAnimatedStyle}>
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isRecording && styles.recordingButton
            ]}
            onPress={startVoiceRecording}
            disabled={isRecording}
          >
            <Mic size={20} color={isRecording ? "#fff" : "#34C759"} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Autocomplete Suggestions */}
      {showSuggestions && (
        <Animated.View 
          style={[
            styles.suggestionsContainer,
            suggestionsAnimatedStyle
          ]}
        >
          <BlurView intensity={30} style={styles.blur}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`suggestion-${index}`}
                style={[
                  styles.suggestionItem,
                  index === selectedSuggestionIndex && styles.selectedSuggestion
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={[
                  styles.suggestionText,
                  index === selectedSuggestionIndex && styles.selectedSuggestionText
                ]}>
                  {suggestion}
                </Text>
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
    borderWidth: 1,
    borderColor: '#28A745',  // Darker green border for better contrast
  },
  invalidTag: {
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    borderColor: '#FF4C4C',
  },
  tagText: {
    color: '#34C759',
    fontWeight: '600',
    marginRight: 4,
  },
  invalidTagText: {
    color: '#FF4C4C',
  },
  removeTag: {
    color: '#34C759',
    fontWeight: '700',
    fontSize: 16,
  },
  invalidRemoveTag: {
    color: '#FF4C4C',
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
  selectedSuggestion: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSuggestionText: {
    fontWeight: '600',
    color: '#34C759',
  },
});

export default TextArea;