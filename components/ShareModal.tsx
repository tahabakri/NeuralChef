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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Recipe } from '@/services/recipeService';
import colors from '@/constants/colors';

interface ShareModalProps {
  recipe: Recipe;
  visible: boolean;
  onClose: () => void;
}

export default function ShareModal({ recipe, visible, onClose }: ShareModalProps) {
  // Share recipe as text message
  const shareAsText = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Format ingredients and steps
      const ingredients = recipe.ingredients.map(i => `• ${i}`).join('\n');
      const steps = recipe.steps
        .map((step, i) => `${i + 1}. ${step.instruction}`)
        .join('\n\n');
      
      // Create message text
      const message = `🍽️ ${recipe.title}\n\n` +
        `${recipe.description}\n\n` +
        `⏱️ Prep: ${recipe.prepTime}\n` +
        `🔥 Cook: ${recipe.cookTime}\n` +
        `👨‍👩‍👧‍👦 Serves: ${recipe.servings}\n\n` +
        `📋 Ingredients:\n${ingredients}\n\n` +
        `📝 Instructions:\n${steps}\n\n` +
        `Shared via ReciptAI`;
      
      const result = await Share.share({
        message,
        title: recipe.title,
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing recipe as text:', error);
    }
  };
  
  // Share recipe as image (not implemented yet - would create an image from recipe data)
  const shareAsImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // This would normally create an image from the recipe data
    // For this demo, we'll just show an error message
    alert('Image sharing is not implemented in this demo');
    
    // Example of real implementation:
    /*
    try {
      // First check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        alert('Sharing is not available on this device');
        return;
      }
      
      // Create a dummy image for demo purposes
      const fileUri = FileSystem.cacheDirectory + 'recipe.png';
      
      // In a real app, this would be a call to a service that generates an image
      // For now, we'll just copy a placeholder image
      await FileSystem.downloadAsync(
        'https://example.com/placeholder.png',
        fileUri
      );
      
      // Share the image
      await Sharing.shareAsync(fileUri);
      
    } catch (error) {
      console.error('Error sharing recipe as image:', error);
      alert('Failed to share recipe as image');
    }
    */
  };
  
  // Save recipe image to device
  const saveToDevice = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Request permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to save the recipe');
        return;
      }
      
      // In a real app, this would create and save an image
      // For this demo, we'll just show a success message
      alert('Recipe image would be saved to your device (not implemented in this demo)');
      
      /*
      // Example of real implementation:
      const fileUri = FileSystem.cacheDirectory + 'recipe.png';
      
      // In a real app, this would be a call to a service that generates an image
      // For now, we'll just copy a placeholder image
      await FileSystem.downloadAsync(
        recipe.heroImage || 'https://example.com/placeholder.png',
        fileUri
      );
      
      // Save to media library
      await MediaLibrary.saveToLibraryAsync(fileUri);
      
      // Show success message
      alert('Recipe saved to your device');
      */
    } catch (error) {
      console.error('Error saving recipe to device:', error);
      alert('Failed to save recipe to device');
    }
  };
  
  // Copy recipe text to clipboard
  const copyToClipboard = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Format ingredients and steps
      const ingredients = recipe.ingredients.map(i => `• ${i}`).join('\n');
      const steps = recipe.steps
        .map((step, i) => `${i + 1}. ${step.instruction}`)
        .join('\n\n');
      
      // Create message text
      const message = `${recipe.title}\n\n` +
        `${recipe.description}\n\n` +
        `Prep: ${recipe.prepTime}\n` +
        `Cook: ${recipe.cookTime}\n` +
        `Serves: ${recipe.servings}\n\n` +
        `Ingredients:\n${ingredients}\n\n` +
        `Instructions:\n${steps}`;
      
      await navigator.clipboard.writeText(message);
      alert('Recipe copied to clipboard');
    } catch (error) {
      console.error('Error copying recipe to clipboard:', error);
      alert('Failed to copy recipe to clipboard');
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
            <Text style={styles.title}>Share Recipe</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            <ShareOption
              icon="share-social-outline"
              label="Share as Text"
              onPress={shareAsText}
            />
            
            <ShareOption
              icon="image-outline"
              label="Share as Image"
              onPress={shareAsImage}
            />
            
            <ShareOption
              icon="download-outline"
              label="Save to Device"
              onPress={saveToDevice}
              color={colors.secondary}
            />
            
            <ShareOption
              icon="copy-outline"
              label="Copy to Clipboard"
              onPress={copyToClipboard}
              color={colors.textSecondary}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: height * 0.7,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  optionsContainer: {
    maxHeight: height * 0.5,
  },
  optionsContent: {
    paddingBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    fontFamily: 'Poppins-Regular',
  },
}); 