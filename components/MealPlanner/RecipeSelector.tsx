import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { RecipeSelectorProps } from './types';
import { Recipe } from '@/services/recipeService';
import RecipeCard from '@/components/RecipeCard';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';

export default function RecipeSelector({ visible, onClose, onSelectRecipe }: RecipeSelectorProps) {
  const savedRecipes = useSavedRecipesStore(state => state.savedRecipes);
  const [isLoading] = React.useState(false);

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    const cardRecipe = {
      id: item.id,
      title: item.title,
      image: item.heroImage || 'assets/images/placeholder.png',
      cookTime: item.cookTime || 0,
      difficulty: item.difficulty,
      rating: item.rating || 0,
      tags: item.tags,
      description: item.description, // Added missing property
      servings: item.servings,     // Added missing property
    };

    return (
      <RecipeCard
        recipe={cardRecipe}
        style={styles.recipeCard}
        onPress={() => onSelectRecipe(item)}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Select Recipe</Text>
          <View style={styles.placeholder} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Saved Recipes</Text>
            {savedRecipes.length > 0 ? (
              <FlatList
                data={savedRecipes}
                renderItem={renderRecipeItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No saved recipes yet</Text>
                <Text style={styles.emptyStateSubText}>
                  Save recipes to quickly add them to your meal plan
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontFamily: typography?.heading3?.fontFamily ?? 'Poppins-Bold',
    fontSize: typography?.heading3?.fontSize ?? 24,
    lineHeight: typography?.heading3?.lineHeight ?? 36,
    fontWeight: typography?.heading3?.fontWeight ?? '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  sectionTitle: {
    fontFamily: typography?.heading4?.fontFamily ?? 'Poppins-SemiBold',
    fontSize: typography?.heading4?.fontSize ?? 20,
    lineHeight: typography?.heading4?.lineHeight ?? 30,
    fontWeight: typography?.heading4?.fontWeight ?? '600',
    color: colors.text,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    padding: 16,
  },
  recipeCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography?.bodyMedium?.fontFamily ?? 'Poppins-Regular',
    fontSize: typography?.bodyMedium?.fontSize ?? 16,
    lineHeight: typography?.bodyMedium?.lineHeight ?? 24,
    fontWeight: typography?.bodyMedium?.fontWeight ?? '400',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontFamily: typography?.bodyLarge?.fontFamily ?? 'Poppins-Medium',
    fontSize: typography?.bodyLarge?.fontSize ?? 18,
    lineHeight: typography?.bodyLarge?.lineHeight ?? 27,
    fontWeight: typography?.bodyLarge?.fontWeight ?? '500',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontFamily: typography?.bodyMedium?.fontFamily ?? 'Poppins-Regular',
    fontSize: typography?.bodyMedium?.fontSize ?? 16,
    lineHeight: typography?.bodyMedium?.lineHeight ?? 24,
    fontWeight: typography?.bodyMedium?.fontWeight ?? '400',
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
