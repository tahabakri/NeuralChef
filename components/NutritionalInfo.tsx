import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Card import removed, as NutritionalInfo will be its own styled container
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface NutritionalInfoProps {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  // Add more nutritional properties as needed
}

// Mock fetch function - replace with actual service call
const fetchNutritionalData = async (recipeId: string): Promise<NutritionalInfoProps> => {
  console.log(`Fetching nutritional data for recipe ${recipeId}... (mocked)`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return {
    calories: 350,
    protein: 25,
    carbs: 30,
    fat: 15,
  };
};

export default function NutritionalInfo({ recipeId }: { recipeId: string }) {
  const [data, setData] = useState<NutritionalInfoProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, fetch data using services/nutritionService.ts
        const fetchedData = await fetchNutritionalData(recipeId);
        setData(fetchedData);
      } catch (e) {
        setError('Failed to load nutritional information.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [recipeId]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading nutritional info...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'No nutritional information available.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setIsCollapsed(!isCollapsed)}>
        <Text style={styles.title}>Nutritional Insights</Text>
        <Ionicons name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={20} color={colors.primary} />
      </TouchableOpacity>
      {!isCollapsed && (
        <View style={styles.content}>
          {data.calories && <Text style={styles.infoItem}>Calories: {data.calories}kcal</Text>}
          {data.protein && <Text style={styles.infoItem}>Protein: {data.protein}g</Text>}
          {data.carbs && <Text style={styles.infoItem}>Carbs: {data.carbs}g</Text>}
          {data.fat && <Text style={styles.infoItem}>Fat: {data.fat}g</Text>}
          {/* Add more data points here */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { // Renamed from 'card' to 'container'
    backgroundColor: colors.backgroundAlt, 
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...typography.subtitle1,
    color: colors.text,
  },
  content: {
    marginTop: 8,
  },
  infoItem: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body1,
    color: colors.error,
    textAlign: 'center',
  },
});
