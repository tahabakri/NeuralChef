import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  StyleProp, 
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import colors from '@/constants/colors';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  autoFocus?: boolean;
  debounceTime?: number;
  onDebounce?: (text: string) => void;
}

export default function SearchBar({
  placeholder = 'Search recipes...',
  value,
  onChangeText,
  onSubmitEditing,
  onClear,
  containerStyle,
  inputStyle,
  autoFocus = false,
  debounceTime = 300,
  onDebounce,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  
  // Handle debounced search
  useEffect(() => {
    if (!onDebounce) return;
    
    const handler = setTimeout(() => {
      onDebounce(localValue);
    }, debounceTime);
    
    return () => {
      clearTimeout(handler);
    };
  }, [localValue, debounceTime, onDebounce]);
  
  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText(text);
  };
  
  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
      
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={localValue}
        onChangeText={handleChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        clearButtonMode="never" // We'll use our own clear button
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      
      {localValue.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <X size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 8,
  },
}); 