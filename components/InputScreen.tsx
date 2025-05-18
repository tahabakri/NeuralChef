import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { commonIngredients } from '@/constants/ingredients';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface InputScreenProps {
  onSubmit?: (ingredients: string[]) => void;
  onMicPress?: () => void;
  onCameraPress?: () => void;
}

const InputScreen: React.FC<InputScreenProps> = ({
  onSubmit,
  onMicPress,
  onCameraPress,
}) => {
  const [inputText, setInputText] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const insets = useSafeAreaInsets();

  const handleTextChange = (text: string) => {
    setInputText(text);
    
    // Show suggestions when user types
    if (text.length > 1) {
      const filteredSuggestions = commonIngredients
        .filter(item => 
          item.toLowerCase().includes(text.toLowerCase()) && 
          !ingredients.includes(item)
        )
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const addIngredient = (ingredient: string) => {
    if (ingredient.trim() && !ingredients.includes(ingredient)) {
      const updatedIngredients = [...ingredients, ingredient];
      setIngredients(updatedIngredients);
      setInputText('');
      setSuggestions([]);
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  const handleSubmit = () => {
    if (inputText.trim()) {
      addIngredient(inputText.trim());
    }
    
    if (ingredients.length > 0 && onSubmit) {
      onSubmit(ingredients);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    addIngredient(suggestion);
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Finder</Text>
        <Text style={styles.subtitle}>What ingredients do you have?</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleTextChange}
          placeholder="Type an ingredient..."
          placeholderTextColor="#888"
          returnKeyType="done"
          onSubmitEditing={() => {
            if (inputText.trim()) addIngredient(inputText.trim());
          }}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onMicPress}
            activeOpacity={0.7}
          >
            <Ionicons name="mic" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onCameraPress}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
              <Ionicons name="add-circle" size={18} color="#4CAF50" />
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {ingredients.length > 0 && (
        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsTitle}>Your ingredients:</Text>
          <FlatList
            data={ingredients}
            renderItem={({ item, index }) => (
              <View style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>{item}</Text>
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <Ionicons name="close-circle" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal={false}
            numColumns={2}
            columnWrapperStyle={styles.ingredientRow}
          />
        </View>
      )}
      
      {ingredients.length > 0 && (
        <TouchableOpacity 
          style={styles.findButton} 
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.findButtonText}>Find Recipes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 56,
    height: 56,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  ingredientsContainer: {
    marginTop: 8,
    flex: 1,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  ingredientRow: {
    justifyContent: 'flex-start',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    marginRight: 8,
    maxWidth: '48%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  findButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  findButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InputScreen; 