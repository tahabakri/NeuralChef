import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import colors from '@/constants/colors';

interface CustomTagProps {
  tag: string;
  size?: 'small' | 'medium' | 'large';
  onDelete?: () => void;
  onPress?: () => void;
  selected?: boolean;
}

// We'll generate a random but consistent color based on the tag text
const getTagColor = (tag: string) => {
  // Simple hash function to generate a consistent color for each tag
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Convert to a hue value between 0-360
  const hue = Math.abs(hash) % 360;
  
  // Use HSL to generate a pastel color (high lightness)
  return `hsl(${hue}, 70%, 65%)`;
};

export default function CustomTag({ 
  tag, 
  size = 'medium', 
  onDelete, 
  onPress,
  selected = false 
}: CustomTagProps) {
  if (!tag) return null;
  
  const tagColor = getTagColor(tag);
  const backgroundColor = selected ? tagColor : `${tagColor}20`; // 20% opacity if not selected
  const borderColor = tagColor;
  const textColor = selected ? '#FFFFFF' : tagColor;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container, 
        { backgroundColor, borderColor },
        size === 'small' && styles.smallContainer,
        size === 'large' && styles.largeContainer,
        selected && styles.selectedContainer
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
        {tag}
      </Text>
      
      {onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={onDelete}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <X size={size === 'small' ? 12 : size === 'large' ? 16 : 14} color={textColor} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 8,
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
  selectedContainer: {
    borderWidth: 1.5,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 