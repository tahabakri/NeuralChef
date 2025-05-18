import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Camera as CameraIcon, PlusCircle, XCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import TagInput from '@/components/TagInput';
import CameraInput from '@/components/CameraInput';

export default function CameraInputExample() {
  const [ingredients, setIngredients] = useState<string>('');
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{ingredients: string[], timestamp: string}>>([]);
  
  // Handle detected ingredients from the camera
  const handleIngredientsDetected = (ingredients: string[]) => {
    if (ingredients.length > 0) {
      setDetectedIngredients(ingredients);
      
      // Add to history
      const timestamp = new Date().toLocaleTimeString();
      setHistory(prev => [{ ingredients, timestamp }, ...prev.slice(0, 9)]);
      
      // Add to the input field
      const currentIngredients = ingredients ? ingredients.split(',').map(i => i.trim()) : [];
      const combinedIngredients = [...new Set([...currentIngredients, ...ingredients])];
      setIngredients(combinedIngredients.join(', '));
    }
  };
  
  // Add a detected ingredient to the input field
  const addDetectedIngredient = (ingredient: string) => {
    const currentIngredients = ingredients ? ingredients.split(',').map(i => i.trim()) : [];
    
    if (!currentIngredients.includes(ingredient)) {
      const updated = [...currentIngredients, ingredient];
      setIngredients(updated.join(', '));
    }
  };
  
  // Clear all detected ingredients
  const clearDetectedIngredients = () => {
    setDetectedIngredients([]);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Camera Ingredient Detection</Text>
      <Text style={styles.subtitle}>
        Take photos of ingredients to detect them automatically
      </Text>
      
      {/* Ingredient input */}
      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <TagInput
            label="Ingredients"
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="Add ingredients..."
            tags={ingredients.split(',').map(tag => tag.trim()).filter(tag => tag !== '')}
            onTagsChange={(tags) => setIngredients(tags.join(', '))}
          />
        </View>
        
        {/* Camera button */}
        <View style={styles.cameraContainer}>
          <CameraInput onIngredientsDetected={handleIngredientsDetected} />
        </View>
      </View>
      
      {/* Detected ingredients section */}
      {detectedIngredients.length > 0 && (
        <View style={styles.detectedSection}>
          <View style={styles.detectedHeader}>
            <Text style={styles.detectedTitle}>Latest Detected Ingredients</Text>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearDetectedIngredients}
            >
              <XCircle size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detectedList}>
            {detectedIngredients.map((ingredient, index) => (
              <TouchableOpacity
                key={index}
                style={styles.detectedItem}
                onPress={() => addDetectedIngredient(ingredient)}
              >
                <Text style={styles.detectedItemText}>{ingredient}</Text>
                <PlusCircle size={16} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {/* Detection history */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Detection History</Text>
          
          {history.map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyTime}>{entry.timestamp}</Text>
              <View style={styles.historyIngredients}>
                {entry.ingredients.map((ingredient, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.historyIngredient}
                    onPress={() => addDetectedIngredient(ingredient)}
                  >
                    <Text style={styles.historyIngredientText}>{ingredient}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
      
      {/* Information about the mock implementation */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About This Mock Implementation</Text>
        <Text style={styles.infoText}>
          This is a simulated version of ingredient detection using the camera.
          In a production environment, this would use a computer vision API like
          Google Vision API, Azure Computer Vision, or a custom trained model.
        </Text>
        <Text style={styles.infoText}>
          The mock detection randomly selects ingredients from different food categories
          to simulate analyzing what's in the photo. Each photo will produce slightly
          different results.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  cameraContainer: {
    marginBottom: 16,
  },
  detectedSection: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  detectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detectedItem: {
    flexDirection: 'row',
    backgroundColor: colors.tagBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  detectedItemText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 6,
  },
  historySection: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  historyItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  historyIngredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyIngredient: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  historyIngredientText: {
    fontSize: 13,
    color: colors.text,
  },
  infoSection: {
    backgroundColor: colors.infoLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.info,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
}); 