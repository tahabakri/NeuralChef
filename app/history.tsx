import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import colors from '@/constants/colors';
import GradientCard from '@/components/common/GradientCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * History Screen
 * Displays recently viewed recipes
 */
export default function HistoryScreen() {
  const router = useRouter();

  // Mock history data
  const viewHistory = [
    {
      id: '1',
      title: 'Spaghetti Carbonara',
      cuisine: 'Italian',
      viewedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      title: 'Chicken Tikka Masala',
      cuisine: 'Indian',
      viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      title: 'Apple Pie',
      cuisine: 'American',
      viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      id: '4',
      title: 'Beef Stroganoff',
      cuisine: 'Russian',
      viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];

  // Format date for display
  const formatViewTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  // Navigate to recipe details
  const handleRecipePress = (id: string) => {
    router.push({
      pathname: '/recipe/[id]',
      params: { id }
    });
  };

  // Render each history item
  const renderHistoryItem = ({ item }: { item: typeof viewHistory[0] }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => handleRecipePress(item.id)}
      activeOpacity={0.9}
    >
      <GradientCard
        gradient="softBlue"
        roundness="medium"
        elevation={2}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Text style={styles.viewTime}>{formatViewTime(item.viewedAt)}</Text>
          </View>
          <Text style={styles.recipeCuisine}>{item.cuisine} Cuisine</Text>
        </View>
      </GradientCard>
    </TouchableOpacity>
  );

  // Empty state when no history
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={80} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Viewing History</Text>
      <Text style={styles.emptyText}>
        Recipes you view will appear here for quick access
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.replace('/')}
      >
        <LinearGradient
          colors={['#A5D6A7', '#81C784']} // Fresh Green gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.browseButtonGradient}
        >
          <Text style={styles.browseButtonText}>Browse Recipes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Recently Viewed</Text>
        {viewHistory.length > 0 && (
          <Text style={styles.subtitle}>Your recipe browsing history</Text>
        )}
      </View>
      
      <FlatList
        data={viewHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 16,
    minHeight: '100%',
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  viewTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  recipeCuisine: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  browseButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 