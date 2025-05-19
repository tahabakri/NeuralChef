import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import BackHeader from '@/components/BackHeader';
import { usePreferencesStore } from '@/stores/preferencesStore';
import StylePreferencesStep from '@/components/onboarding/StylePreferencesStep';

interface PreferenceOption {
  id: string;
  label: string;
  icon: string;
}

export default function PreferencesScreen() {
  const router = useRouter();
  const preferences = usePreferencesStore();
  
  // Mock onNext function for the StylePreferencesStep component
  const handleNext = () => {
    // This function is just here to satisfy the component props
    // In a real implementation, you'd update preferences
    console.log('Next pressed');
  };
  
  // Mock onPrevious function for the StylePreferencesStep component
  const handlePrevious = () => {
    // Just go back to the settings screen
    router.back();
  };
  
  // Handle save button press
  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real implementation, you'd save the preferences here
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Use the new BackHeader component */}
      <BackHeader 
        title="Preferences"
        rightContent={
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Reuse the StylePreferencesStep component */}
        <StylePreferencesStep
          onNext={handleNext}
          onPrevious={handlePrevious}
          stepIndex={0} // We're using as a standalone component
          totalSteps={1} // Just one step here
        />
        
        {/* Additional preference sections could go here */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Preferences</Text>
          
          {/* Allergens */}
          <TouchableOpacity style={styles.preferenceItem}>
            <View style={styles.preferenceIconContainer}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']} // Red gradient
                style={styles.iconGradient}
              >
                <Ionicons name="alert-circle" size={20} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>Allergens</Text>
              <Text style={styles.preferenceDescription}>
                {preferences.allergies?.length > 0
                  ? preferences.allergies.join(', ')
                  : 'No allergens specified'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          
          {/* Cuisine Preferences */}
          <TouchableOpacity style={styles.preferenceItem}>
            <View style={styles.preferenceIconContainer}>
              <LinearGradient
                colors={['#4CAF50', '#81C784']} // Green gradient
                style={styles.iconGradient}
              >
                <Ionicons name="globe" size={20} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>Cuisine Types</Text>
              <Text style={styles.preferenceDescription}>
                {preferences.cuisineTypes?.length > 0
                  ? preferences.cuisineTypes.join(', ')
                  : 'All cuisines'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          
          {/* Spice Level */}
          <TouchableOpacity style={styles.preferenceItem}>
            <View style={styles.preferenceIconContainer}>
              <LinearGradient
                colors={['#FF9800', '#FFB74D']} // Orange gradient
                style={styles.iconGradient}
              >
                <Ionicons name="flame" size={20} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>Spice Level</Text>
              <Text style={styles.preferenceDescription}>
                {preferences.spiceLevel ? preferences.spiceLevel.charAt(0).toUpperCase() + preferences.spiceLevel.slice(1) : 'Medium'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferenceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
}); 