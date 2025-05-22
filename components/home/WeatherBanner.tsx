import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

// Define the spacing values if not imported from a constants file
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 22,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

interface WeatherBannerProps {
  mainText: string;
  subText: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const WeatherBanner: React.FC<WeatherBannerProps> = ({
  mainText,
  subText,
  iconName,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={onPress}
      accessibilityLabel={`${mainText} ${subText} Tap to view recipe.`}
    >
      <Ionicons 
        name={iconName} 
        size={24} 
        color={colors.accentOrange || '#FF7643'} 
        style={styles.icon} 
      />
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>{mainText}</Text>
        <Text style={styles.subText}>{subText}</Text>
      </View>
      <Ionicons 
        name="chevron-forward-outline" 
        size={22} 
        color={colors.textTertiary || '#999'} 
        style={styles.arrow} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.backgroundAlt || '#FEF7F0', // Light peach/beige
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  subText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});

export default WeatherBanner; 