import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import RecipeCard, { prepareRecipeForCard } from '@/components/RecipeCard';
import { useRecipeStore } from '@/stores/recipeStore';

export default function SavedScreen() {
  const router = useRouter();
  const { recipes } = useRecipeStore();

  // Mock saved recipes for now
  const savedRecipes = recipes.filter(recipe => recipe.id.startsWith('1'));

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  if (savedRecipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No saved recipes yet</Text>
        <Text style={styles.emptySubText}>
          Recipes you save will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedRecipes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={prepareRecipeForCard(item)}
            type="horizontal"
            style={styles.card}
            onPress={() => handleRecipePress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  emptyText: {
    ...typography.titleMedium,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
