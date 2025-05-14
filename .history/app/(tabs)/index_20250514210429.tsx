import * as React from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ChevronRight } from 'lucide-react-native';

import TextArea from '@/components/TextArea';
import Button from '@/components/Button';
import Card from '@/components/Card';
import colors from '@/constants/colors';
import { generateRecipeWithAI } from '@/services/recipeService';
import { useRecipeStore } from '@/stores/recipeStore';

export default function HomeScreen() {
  const [ingredients, setIngredients] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { setRecipe, setLoading, setError } = useRecipeStore();
  const router = useRouter();

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      Alert.alert('Missing Ingredients', 'Please enter some ingredients to generate a recipe.');
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      setIsGenerating(true);
      setLoading(true);
      
      // Navigate to the recipe screen first to show loading state
      router.push('/recipe');
      
      // Generate the recipe
      const recipe = await generateRecipeWithAI(ingredients);
      
      // Update the store with the generated recipe
      setRecipe(recipe);
    } catch (error) {
      console.error('Error generating recipe:', error);
      setError('Failed to generate recipe. Please try again.');
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      Alert.alert(
        'Error',
        'Failed to generate recipe. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExamplePress = (example: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIngredients(example);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>What would you like to cook?</Text>
          <Text style={styles.subtitle}>Enter ingredients you have on hand</Text>
        </View>

        <Card 
          style={styles.inputCard} 
          variant="elevated"
        >
            <TextArea
              placeholder="e.g., chicken, rice, broccoli, soy sauce"
              value={ingredients}
              onChangeText={setIngredients}
              height={120}
              containerStyle={styles.textAreaContainer}
            />
            
            <Text style={styles.tip}>
              Tip: List ingredients separated by commas for best results
            </Text>
            
            <Button
              title="Generate Recipe"
              onPress={handleGenerateRecipe}
              loading={isGenerating}
              disabled={isGenerating || !ingredients.trim()}
              style={styles.button}
              size="large"
              icon={<ChevronRight size={20} color="white" />}
              iconPosition="right"
            />
        </Card>

        <Text style={styles.sectionTitle}>Popular Combinations</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
          <Card 
            style={styles.exampleCard} 
            variant="elevated"
            onPress={() => handleExamplePress('pasta, tomatoes, garlic, olive oil, basil')}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=2032&auto=format&fit=crop' }}
              style={styles.exampleImage}
              contentFit="cover"
            />
            <View style={styles.exampleContent}>
              <Text style={styles.exampleTitle}>Pasta Dinner</Text>
              <Text style={styles.exampleIngredients}>pasta, tomatoes, garlic, olive oil, basil</Text>
            </View>
          </Card>
          
          <Card 
            style={styles.exampleCard} 
            variant="elevated"
            onPress={() => handleExamplePress('eggs, bread, avocado, cheese, spinach')}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080&auto=format&fit=crop' }}
              style={styles.exampleImage}
              contentFit="cover"
            />
            <View style={styles.exampleContent}>
              <Text style={styles.exampleTitle}>Breakfast</Text>
              <Text style={styles.exampleIngredients}>eggs, bread, avocado, cheese, spinach</Text>
            </View>
          </Card>
          
          <Card 
            style={styles.exampleCard} 
            variant="elevated"
            onPress={() => handleExamplePress('tofu, bell peppers, broccoli, rice, soy sauce, ginger')}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop' }}
              style={styles.exampleImage}
              contentFit="cover"
            />
            <View style={styles.exampleContent}>
              <Text style={styles.exampleTitle}>Vegetarian</Text>
              <Text style={styles.exampleIngredients}>tofu, bell peppers, broccoli, rice, soy sauce, ginger</Text>
            </View>
          </Card>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  inputCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  textAreaContainer: {
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  examplesScroll: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  exampleCard: {
    width: 220,
    marginRight: 12,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16,
  },
  exampleImage: {
    width: '100%',
    height: 120,
  },
  exampleContent: {
    padding: 12,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  exampleIngredients: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
