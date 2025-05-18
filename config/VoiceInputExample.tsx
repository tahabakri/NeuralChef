import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Mic } from 'lucide-react-native';
import colors from '@/constants/colors';
import TagInput from '@/components/TagInput';
import VoiceInputModal from '@/components/VoiceInputModal';
import { requestVoicePermissions } from '@/utils/permissions';

/**
 * Example screen demonstrating the voice input feature
 */
export default function VoiceInputExample() {
  const [ingredients, setIngredients] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceInputStatus, setVoiceInputStatus] = useState('');
  
  // Request permissions when the screen loads
  React.useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await requestVoicePermissions();
      setVoiceInputStatus(
        hasPermission 
          ? 'Voice input ready'
          : 'Microphone permission denied'
      );
    };
    
    checkPermissions();
  }, []);
  
  // Handle voice input received
  const handleVoiceInput = (text: string) => {
    // Add input to ingredients list
    const currentIngredients = ingredients ? ingredients.split(',').map(i => i.trim()) : [];
    
    // Parse multiple ingredients from a single voice input
    const newIngredients = text
      .split(/,|and|with|plus/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Add new ingredients to the list, avoiding duplicates
    const combinedIngredients = [...new Set([...currentIngredients, ...newIngredients])];
    setIngredients(combinedIngredients.join(', '));
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Recipe Ingredients</Text>
      <Text style={styles.subtitle}>Add ingredients by typing or using voice input</Text>
      
      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{voiceInputStatus}</Text>
      </View>
      
      {/* Ingredient input using TagInput */}
      <View style={styles.inputContainer}>
        <TagInput
          label="Ingredients"
          value={ingredients}
          onChangeText={setIngredients}
          placeholder="Add ingredients..."
          tags={ingredients.split(',').map(tag => tag.trim()).filter(tag => tag !== '')}
          onTagsChange={(tags) => setIngredients(tags.join(', '))}
          onVoiceInput={() => setShowVoiceModal(true)}
        />
      </View>
      
      {/* Alternative: Standalone voice button */}
      <View style={styles.alternativeContainer}>
        <Text style={styles.alternativeTitle}>Alternative Implementation</Text>
        <Text style={styles.alternativeSubtitle}>
          You can also use the VoiceInputModal component directly:
        </Text>
        
        <TouchableOpacity 
          style={styles.voiceButton}
          onPress={() => setShowVoiceModal(true)}
        >
          <Mic size={24} color={colors.white} />
          <Text style={styles.voiceButtonText}>Voice Input</Text>
        </TouchableOpacity>
      </View>
      
      {/* Standalone voice modal */}
      <VoiceInputModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onInputReceived={handleVoiceInput}
      />
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
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  statusContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 32,
  },
  alternativeContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    marginBottom: 32,
  },
  alternativeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  alternativeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  voiceButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  voiceButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 