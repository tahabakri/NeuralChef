import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface InfoPillProps {
  backgroundColor: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
  label?: string;
  emoji?: string;
  iconSize?: number;
  valueIconName?: keyof typeof Ionicons.glyphMap; // For icon next to value, e.g., difficulty
  onPress?: () => void;
}

const InfoPill = ({
  backgroundColor,
  iconName,
  iconColor,
  value,
  label,
  emoji,
  iconSize = 28,
  valueIconName,
  onPress,
}: InfoPillProps) => {
  const content = (
    <>
      {emoji ? (
        <Text style={[styles.emoji, { color: iconColor }]}>{emoji}</Text>
      ) : iconName ? (
        <Ionicons name={iconName} size={iconSize} color={iconColor} style={styles.mainIcon} />
      ) : null}
      
      <View style={styles.valueContainer}>
        {valueIconName && (
          <Ionicons name={valueIconName} size={typography.bodyMedium.fontSize || 16} color={iconColor} style={styles.valueIcon} />
        )}
        <Text style={[styles.valueText, { color: iconColor }]}>
          {value}
        </Text>
      </View>
      
      {label && (
        <Text style={[styles.labelText, { color: iconColor }]}>
          {label}
        </Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.pillContainer, { backgroundColor }]}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.pillContainer, { backgroundColor }]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md, // Adjusted padding for better content fit
    minHeight: 90, // Use minHeight to allow content to expand
    flex: 1, // Allow pills to take equal width
    marginHorizontal: spacing.xs, // Add some margin between pills
  },
  mainIcon: {
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  valueIcon: {
    marginRight: spacing.xs,
  },
  valueText: {
    ...typography.bodyMedium,
    fontFamily: 'OpenSans-Bold',
    textAlign: 'center', // Ensure text is centered if it wraps
  },
  labelText: {
    ...typography.caption,
    fontFamily: 'OpenSans-Regular',
    marginTop: 2,
  },
});

export default InfoPill;
