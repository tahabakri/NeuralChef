import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  isEditable?: boolean;
  onRatingChange?: (rating: number) => void;
  style?: ViewStyle;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 24,
  color = colors.primary,
  emptyColor = colors.textTertiary,
  isEditable = false,
  onRatingChange,
  style,
}: StarRatingProps) {
  // Generate an array of length maxRating
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);
  
  // Animation ref for star press effect
  const scaleAnims = stars.map(() => new Animated.Value(1));
  
  const handleStarPress = (selectedRating: number) => {
    if (!isEditable) return;
    
    // Animate the pressed star
    Animated.sequence([
      Animated.timing(scaleAnims[selectedRating - 1], {
        toValue: 1.3,
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[selectedRating - 1], {
        toValue: 1,
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Call the onRatingChange callback
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {stars.map((star) => {
        // Determine if this star should be filled or not
        const isFilled = star <= Math.round(rating);
        
        return isEditable ? (
          <TouchableOpacity
            key={`star-${star}`}
            onPress={() => handleStarPress(star)}
            activeOpacity={0.7}
            accessibilityLabel={`Rate ${star} out of ${maxRating} stars`}
            accessibilityRole="button"
            accessibilityState={{ selected: star <= rating }}
            style={styles.starButton}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnims[star - 1] }] }}>
              <Ionicons
                name={isFilled ? 'star' : 'star-outline'}
                size={size}
                color={isFilled ? color : emptyColor}
              />
            </Animated.View>
          </TouchableOpacity>
        ) : (
          <Ionicons
            key={`star-${star}`}
            name={isFilled ? 'star' : 'star-outline'}
            size={size}
            color={isFilled ? color : emptyColor}
            style={styles.star}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
}); 