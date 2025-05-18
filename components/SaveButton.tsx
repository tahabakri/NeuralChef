import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSavedRecipesStore } from '@/stores/savedRecipesStore';
import colors from '@/constants/colors';

interface SaveButtonProps {
  recipe: any;  // Use Recipe type from your service when available
  style?: ViewStyle;
  textStyle?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  showText?: boolean;
  onSaved?: () => void;
}

export default function SaveButton({
  recipe,
  style,
  textStyle,
  size = 'medium',
  variant = 'primary',
  showText = true,
  onSaved,
}: SaveButtonProps) {
  const { saveRecipe, removeSavedRecipe, isSaved } = useSavedRecipesStore();
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation for button press
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const bounceAnim = React.useRef(new Animated.Value(1)).current;
  
  // Check if recipe is already saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      const recipeIsSaved = isSaved(recipe.title);
      setSaved(recipeIsSaved);
    };
    
    checkSavedStatus();
  }, [recipe.title, isSaved]);
  
  // Button size based on size prop
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, iconSize: 18 };
      case 'large':
        return { width: 56, height: 56, iconSize: 28 };
      case 'medium':
      default:
        return { width: 44, height: 44, iconSize: 22 };
    }
  };
  
  // Button style based on variant prop
  const getButtonStyle = () => {
    const buttonSize = getButtonSize();
    
    switch (variant) {
      case 'secondary':
        return { 
          ...buttonSize, 
          backgroundColor: saved ? colors.primary : colors.backgroundAlt,
        };
      case 'outline':
        return { 
          ...buttonSize,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: saved ? colors.primary : colors.border,
        };
      case 'primary':
      default:
        return {
          ...buttonSize,
          backgroundColor: saved ? colors.primary : colors.white,
        };
    }
  };
  
  // Icon color based on saved state and variant
  const getIconColor = () => {
    if (saved) {
      return variant === 'outline' ? colors.primary : 'white';
    }
    
    switch (variant) {
      case 'secondary':
        return colors.textSecondary;
      case 'outline':
        return colors.textSecondary;
      case 'primary':
      default:
        return colors.primary;
    }
  };
  
  // Text color based on saved state and variant
  const getTextColor = () => {
    if (saved) {
      return variant === 'outline' ? colors.primary : 'white';
    }
    
    switch (variant) {
      case 'secondary':
        return colors.textSecondary;
      case 'outline':
        return colors.textSecondary;
      case 'primary':
      default:
        return colors.primary;
    }
  };
  
  // Handle save/unsave
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Haptic feedback
      Haptics.impactAsync(
        saved ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
      );
      
      // Animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      if (saved) {
        // Unsave recipe
        await removeSavedRecipe(recipe.title);
        setSaved(false);
      } else {
        // Save recipe
        await saveRecipe(recipe);
        setSaved(true);
        
        // Bounce animation when saved
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Call onSaved callback if provided
        if (onSaved) {
          onSaved();
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const buttonSize = getButtonSize();
  const buttonStyle = getButtonStyle();
  const iconColor = getIconColor();
  const textColor = getTextColor();
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.container,
          buttonStyle,
          style,
        ]}
        activeOpacity={0.7}
        onPress={handleSave}
        disabled={isLoading}
        accessibilityLabel={saved ? "Remove from saved recipes" : "Save recipe"}
        accessibilityRole="button"
        accessibilityState={{ checked: saved }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <>
            <Animated.View style={{ transform: [{ scale: saved ? bounceAnim : 1 }] }}>
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={buttonSize.iconSize}
                color={iconColor}
              />
            </Animated.View>
            
            {showText && variant !== 'small' && (
              <Text style={[
                styles.text,
                { color: textColor },
                textStyle,
              ]}>
                {saved ? "Saved" : "Save"}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    paddingHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  text: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
}); 