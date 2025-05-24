import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors'; // Assuming you have this
import { Tag } from '@/components/TextArea'; // Assuming Tag type is exported from TextArea or a shared types file

interface IngredientPillListProps {
  ingredients: Tag[];
  onRemoveIngredient: (tagId: string) => void;
}

const IngredientPillList: React.FC<IngredientPillListProps> = ({ ingredients, onRemoveIngredient }) => {
  // If there are no ingredients, this component won't render anything,
  // allowing the main screen to show its empty state.
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.listContainer}
      contentContainerStyle={styles.listContentContainer}
      keyboardShouldPersistTaps="handled" // To ensure taps on pills work when keyboard is up
    >
      {ingredients.map(ingredient => (
        <View key={ingredient.id} style={styles.pill}>
          <Text style={styles.pillText}>{ingredient.text}</Text>
          <TouchableOpacity onPress={() => onRemoveIngredient(ingredient.id)} style={styles.removeButton}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    maxHeight: 50, // Adjust as needed, or remove for dynamic height
    minHeight: 50, // Ensure it takes up space even with one row
    flexGrow: 0, // Prevent ScrollView from taking too much space if not needed
  },
  listContentContainer: {
    alignItems: 'center', // Vertically center pills if listContainer has fixed height
    paddingVertical: 4, // Add some vertical padding for the pills
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentOrangeLight, // Using a light orange for pills
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    marginRight: 8,
    height: 32, // Fixed height for pills
  },
  pillText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.accentOrange, // Darker orange text
    marginRight: 6,
  },
  removeButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IngredientPillList;
