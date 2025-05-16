import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import colors from '@/constants/colors'; // Assuming you have a colors constant file

// Placeholder data - replace with actual settings and state management
const settingsOptions = [
  {
    id: 'dietary',
    title: 'Dietary Preferences',
    description: 'Manage your dietary restrictions (e.g., vegan, gluten-free).',
    // onPress: () => console.log('Navigate to Dietary Preferences')
  },
  {
    id: 'measurement',
    title: 'Measurement Units',
    description: 'Choose between metric and imperial units.',
    // onPress: () => console.log('Navigate to Measurement Units')
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage your app notification settings.',
    // onPress: () => console.log('Navigate to Notifications')
  },
  {
    id: 'about',
    title: 'About ReciptAI',
    description: 'Version, terms of service, privacy policy.',
    // onPress: () => console.log('Navigate to About screen')
  }
];

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {settingsOptions.map((item) => (
          <View key={item.id} style={styles.settingsItemContainer}>
            <View style={styles.settingsItem}>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
              {/* Placeholder for a switch or navigation icon */}
              {/* <ChevronRight size={20} color={colors.textSecondary} /> */}
            </View>
          </View>
        ))}
        
        {/* Example for a future setting with a switch 
        <View style={styles.settingsItemContainer}>
          <View style={styles.settingsItem}>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Dark Mode</Text>
            </View>
            <Switch value={false} onValueChange={() => {}} />
          </View>
        </View>
        */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, // Use a background color from your constants
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 30, // Adjust for status bar
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card, // Optional: for a distinct header background
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  settingsItemContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 70, // Ensure consistent item height
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 16, // Space before any potential switch/icon
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
}); 