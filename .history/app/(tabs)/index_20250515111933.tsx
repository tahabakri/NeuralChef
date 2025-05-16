"use client";

import * as React from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ChevronRight, PlusCircle } from 'lucide-react-native';

import TagInput from '@/components/TagInput';
import Button from '@/components/Button';
import Card from '@/components/Card';
import colors from '@/constants/colors';
import { generateRecipeWithAI } from '@/services/recipeService';
import { useRecipeStore } from '@/stores/recipeStore';
import { handleVoiceInput } from '@/services/voiceService';
import { commonIngredients } from '@/constants/ingredients';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function HomeScreen() {
  const [ingredients, setIngredients] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = React.useState(false);
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
  
  const handleVoiceRecognition = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsVoiceLoading(true);
    
    handleVoiceInput(
      (recognizedText) => {
        setIngredients(recognizedText);
        setIsVoiceLoading(false);
        
        // Provide feedback on successful voice recognition
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      },
      (error) => {
        setIsVoiceLoading(false);
        
        // Provide feedback on error
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        
        Alert.alert(
          'Voice Recognition Failed',
          'Could not recognize your speech. Please try again or type your ingredients.',
          [{ text: 'OK' }]
        );
      }
    );
  };

  return (
    <View style={styles.container}>
      {isVoiceLoading && (
        <LoadingOverlay message="Listening..." />
      )}
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>What ingredients do you have?</Text>
          <Text style={styles.subtitle}>We'll generate a recipe for you</Text>
        </View>

        <Card
          style={styles.inputCard}
          variant="elevated"
        >
            <TagInput
              placeholder="e.g., chicken, rice, broccoli, soy sauce"
              value={ingredients}
              onChangeText={setIngredients}
              containerStyle={styles.textAreaContainer}
              suggestions={commonIngredients}
              onVoiceInput={handleVoiceRecognition}
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
              variant="gradient"
              icon={<ChevronRight size={20} color="white" />}
              iconPosition="right"
              gradientColors={['#34C759', '#28A745']}
            />
        </Card>

        <Text style={styles.sectionTitle}>Popular Combinations</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.examplesScroll}
        >
          <Pressable 
            onPress={() => handleExamplePress('chicken, rice, broccoli, soy sauce, ginger')} 
            style={styles.exampleCardContainer}
          >
            <Card
              style={styles.exampleCard}
              variant="elevated"
              imageOverlay={true}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop' }}
                style={styles.exampleImage}
                contentFit="cover"
              />
              <View style={styles.exampleContent}>
                <Text style={styles.exampleTitle}>Chicken Stir-Fry</Text>
                <Text style={styles.exampleIngredients}>chicken, rice, broccoli, soy sauce, ginger</Text>
                <View style={styles.tapToAddContainer}>
                  <PlusCircle size={14} color="#34C759" />
                  <Text style={[styles.tapToAddText, { color: '#34C759' }]}>Tap to Add</Text>
                </View>
              </View>
            </Card>
          </Pressable>

          <Pressable 
            onPress={() => handleExamplePress('ground beef, onions, tomatoes, garlic, pasta')} 
            style={styles.exampleCardContainer}
          >
            <Card
              style={styles.exampleCard}
              variant="elevated"
              imageOverlay={true}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?q=80&w=2070&auto=format&fit=crop' }}
                style={styles.exampleImage}
                contentFit="cover"
              />
              <View style={styles.exampleContent}>
                <Text style={styles.exampleTitle}>Pasta Dinner</Text>
                <Text style={styles.exampleIngredients}>ground beef, onions, tomatoes, garlic, pasta</Text>
                <View style={styles.tapToAddContainer}>
                  <PlusCircle size={14} color="#34C759" />
                  <Text style={[styles.tapToAddText, { color: '#34C759' }]}>Tap to Add</Text>
                </View>
              </View>
            </Card>
          </Pressable>

          <Pressable 
            onPress={() => handleExamplePress('salmon, lemon, butter, garlic, asparagus')} 
            style={styles.exampleCardContainer}
          >
            <Card
              style={styles.exampleCard}
              variant="elevated"
              imageOverlay={true}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop' }}
                style={styles.exampleImage}
                contentFit="cover"
              />
              <View style={styles.exampleContent}>
                <Text style={styles.exampleTitle}>Seafood</Text>
                <Text style={styles.exampleIngredients}>salmon, lemon, butter, garlic, asparagus</Text>
                <View style={styles.tapToAddContainer}>
                  <PlusCircle size={14} color="#34C759" />
                  <Text style={[styles.tapToAddText, { color: '#34C759' }]}>Tap to Add</Text>
                </View>
              </View>
            </Card>
          </Pressable>

          <Pressable 
            onPress={() => handleExamplePress('tofu, bell peppers, broccoli, rice, soy sauce, ginger')} 
            style={styles.exampleCardContainer}
          >
            <Card
              style={styles.exampleCard}
              variant="elevated"
              imageOverlay={true}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop' }}
                style={styles.exampleImage}
                contentFit="cover"
              />
              <View style={styles.exampleContent}>
                <Text style={styles.exampleTitle}>Vegetarian</Text>
                <Text style={styles.exampleIngredients}>tofu, bell peppers, broccoli, rice, soy sauce, ginger</Text>
                <View style={styles.tapToAddContainer}>
                  <PlusCircle size={14} color="#34C759" />
                  <Text style={[styles.tapToAddText, { color: '#34C759' }]}>Tap to Add</Text>
                </View>
              </View>
            </Card>
          </Pressable>
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
    backgroundColor: colors.card,
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
    marginTop: 16,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
  exampleCardContainer: {
    width: 220,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exampleCard: {
    padding: 0,
    width: 220,
    height: 280,
    marginRight: 0,
  },
  exampleImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  exampleContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    zIndex: 1,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  exampleIngredients: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tapToAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  tapToAddText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
