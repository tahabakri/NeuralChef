import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import CardContainer from './CardContainer';

interface RecipeHeaderProps {
  title: string;
  description?: string;
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  difficulty?: string; // Added difficulty
}

export default function RecipeHeader({
  title,
  description,
  servings,
  prepTime,
  cookTime,
  difficulty // Added difficulty
}: RecipeHeaderProps) {
  return (
    <CardContainer style={styles.container} variant="elevated">
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      <View style={styles.metaContainer}>
        {servings && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Servings</Text>
            <Text style={styles.metaValue}>{servings}</Text>
          </View>
        )}
        
        {prepTime && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Prep Time</Text>
            <Text style={styles.metaValue}>{prepTime}</Text>
          </View>
        )}
        
        {cookTime && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Cook Time</Text>
            <Text style={styles.metaValue}>{cookTime}</Text>
          </View>
        )}
        {difficulty && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Difficulty</Text>
            <Text style={styles.metaValue}>{difficulty}</Text>
          </View>
        )}
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metaItem: {
    marginRight: 24,
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
