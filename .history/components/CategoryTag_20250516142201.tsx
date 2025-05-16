import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import colors from '@/constants/colors';

interface CategoryTagProps {
  category: string;
  size?: 'small' | 'medium' | 'large';
  onDelete?: () => void;
  isCustomTag?: boolean;
}

interface TagInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

const getCategoryColor = (category: string, isCustomTag: boolean = false) => {
  if (isCustomTag) {
    return '#5AC8FA'; // Default color for custom tags
  }

  switch (category.toLowerCase()) {
    case 'breakfast':
      return '#FF9500'; // Orange
    case 'lunch':
      return '#34C759'; // Green
    case 'dinner':
      return '#5856D6'; // Purple
    case 'dessert':
      return '#FF2D55'; // Red
    case 'snack':
      return '#5AC8FA'; // Blue
    case 'appetizer':
      return '#FFCC00'; // Yellow
    default:
      return '#8E8E93'; // Gray
  }
};

export function TagInput({ value, onChangeText, onSubmit, placeholder = 'Add a tag...' }: TagInputProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        maxLength={20} // Limit tag length
      />
    </View>
  );
}

export default function CategoryTag({ category, size = 'medium', onDelete, isCustomTag = false }: CategoryTagProps) {
  if (!category) return null;
  
  const backgroundColor = `${getCategoryColor(category, isCustomTag)}20`; // 20% opacity
  const borderColor = getCategoryColor(category, isCustomTag);
  const textColor = getCategoryColor(category, isCustomTag);
  
  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor, borderColor },
        size === 'small' && styles.smallContainer,
        size === 'large' && styles.largeContainer,
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { color: textColor },
          size === 'small' && styles.smallText,
          size === 'large' && styles.largeText,
        ]}
      >
        {category}
      </Text>
      
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <X size={size === 'small' ? 12 : 16} color={textColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  largeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: 4,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#8E8E93',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  input: {
    fontSize: 14,
    minWidth: 100,
    maxWidth: 150,
  },
}); 