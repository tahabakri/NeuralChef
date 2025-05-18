import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import colors from '@/constants/colors';

interface SearchHeaderProps {
  onSearch: (query: string) => void;
}

export default function SearchHeader({ onSearch }: SearchHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you{'\n'}like to Cook?</Text>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={handleSearchSubmit}>
          <Search size={20} color={colors.textTertiary} style={styles.searchIcon} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for your query"
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10, // Adjusted from image, original was 20 after menu
    marginBottom: 20, // Adjusted from image, original was 30
  },
  title: {
    fontFamily: 'Poppins-Bold', // Assuming Poppins-Bold is loaded
    fontSize: 32,
    color: colors.text,
    lineHeight: 38, // Adjusted line height
    marginBottom: 20, // Space between title and search bar
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBackground, // Using updated color constant
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins-Regular', // Assuming Poppins-Regular is loaded
    fontSize: 14,
    color: colors.text,
  },
}); 