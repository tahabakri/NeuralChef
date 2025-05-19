import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Recipe } from '@/services/recipeService';
import colors from '@/constants/colors';

interface BulkShareModalProps {
  recipes: Recipe[];
  visible: boolean;
  onClose: () => void;
}

export default function BulkShareModal({ recipes, visible, onClose }: BulkShareModalProps) {
  // Share recipes as text message
  const shareAsText = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Format recipe list
      const recipeList = recipes.map(recipe => {
        return `• ${recipe.title}`;
      }).join('\n');
      
      // Create message text
      const message = `📚 My Recipe Collection\n\n` +
        `Here are ${recipes.length} recipes from my collection:\n\n` +
        `${recipeList}\n\n` +
        `Shared via ReciptAI`;
      
      const result = await Share.share({
        message,
        title: 'My Recipe Collection',
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error sharing recipes as text:', error);
    }
  };
  
  // Share recipes as list with details
  const shareWithDetails = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Format recipes with details
      const recipeDetails = recipes.map(recipe => {
        const ingredients = recipe.ingredients?.map(i => `  • ${i}`).join('\n') || '';
        
        return `🍽️ ${recipe.title}\n` +
          `${recipe.description ? recipe.description + '\n\n' : ''}` +
          `⏱️ Cook: ${recipe.cookTime || 'N/A'}\n` +
          `👨‍👩‍👧‍👦 Serves: ${recipe.servings || 'N/A'}\n\n` +
          `📋 Ingredients:\n${ingredients}\n`;
      }).join('\n\n---\n\n');
      
      // Create message text
      const message = `📚 My Recipe Collection\n\n` +
        `${recipeDetails}\n\n` +
        `Shared via ReciptAI`;
      
      const result = await Share.share({
        message,
        title: 'My Recipe Collection',
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error sharing recipes with details:', error);
    }
  };
  
  // Render share option button
  const ShareOption = ({ 
    icon, 
    label, 
    onPress, 
    color = colors.primary 
  }: { 
    icon: string; 
    label: string; 
    onPress: () => void; 
    color?: string;
  }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </TouchableOpacity>
  );
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Share {recipes.length} Recipes</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.recipesPreview}>
            <Text style={styles.previewTitle}>Selected Recipes:</Text>
            <FlatList
              data={recipes.slice(0, 3)} // Show just first 3 recipes in preview
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.recipeItem}>
                  <Ionicons name="restaurant-outline" size={16} color={colors.primary} />
                  <Text style={styles.recipeItemText} numberOfLines={1}>{item.title}</Text>
                </View>
              )}
              ListFooterComponent={
                recipes.length > 3 ? (
                  <Text style={styles.moreRecipes}>+{recipes.length - 3} more</Text>
                ) : null
              }
            />
          </View>
          
          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            <ShareOption
              icon="list-outline"
              label="Share Titles Only"
              onPress={shareAsText}
            />
            
            <ShareOption
              icon="document-text-outline"
              label="Share with Details"
              onPress={shareWithDetails}
              color={colors.secondary}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  recipesPreview: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.textSecondary,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  recipeItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  moreRecipes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionsContent: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: colors.text,
  },
}); 