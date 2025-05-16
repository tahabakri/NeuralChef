import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { 
  ArrowLeft, 
  Moon, 
  Bell, 
  Eye, 
  Lock, 
  HelpCircle, 
  ExternalLink, 
  LifeBuoy,
  LogOut
} from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useRecipeStore } from '@/stores/recipeStore';
import TutorialModal from '@/components/TutorialModal';
import { useFeedback } from '@/components/FeedbackSystem';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const { clearAllRecipes } = useRecipeStore();
  const feedback = useFeedback();

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    feedback.showFeedback({
      title: value ? 'Dark Mode Enabled' : 'Dark Mode Disabled',
      type: 'info',
      duration: 2000
    });
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    feedback.showFeedback({
      title: value ? 'Notifications Enabled' : 'Notifications Disabled',
      type: 'info',
      duration: 2000
    });
  };

  const handleHistoryToggle = (value: boolean) => {
    setSaveHistory(value);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    feedback.showFeedback({
      title: value ? 'History Saving Enabled' : 'History Saving Disabled',
      type: 'info',
      duration: 2000
    });
  };

  const handleClearData = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    // In a real app you'd show a confirmation dialog here
    clearAllRecipes();
    
    feedback.showFeedback({
      title: 'All Data Cleared',
      description: 'Your recipes and history have been removed',
      type: 'warning',
      duration: 3000
    });
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    action: React.ReactNode,
    accessibilityLabel: string
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {action}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            <Moon size={22} color={colors.primary} />,
            'Dark Mode',
            'Switch to dark theme for low-light environments',
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.divider, true: colors.primaryAlt }}
              thumbColor={darkMode ? colors.primary : colors.card}
              ios_backgroundColor={colors.divider}
              accessibilityLabel={darkMode ? 'Turn off dark mode' : 'Turn on dark mode'}
              accessibilityHint="Toggles between light and dark theme"
              accessibilityRole="switch"
              accessibilityState={{ checked: darkMode }}
            />,
            'Dark mode toggle'
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            <Bell size={22} color={colors.primary} />,
            'Push Notifications',
            'Get updates about new recipes and features',
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.divider, true: colors.primaryAlt }}
              thumbColor={notifications ? colors.primary : colors.card}
              ios_backgroundColor={colors.divider}
              accessibilityLabel={notifications ? 'Turn off notifications' : 'Turn on notifications'}
              accessibilityRole="switch"
              accessibilityState={{ checked: notifications }}
            />,
            'Push notifications toggle'
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          {renderSettingItem(
            <Eye size={22} color={colors.primary} />,
            'Save History',
            'Keep a record of your recipe searches',
            <Switch
              value={saveHistory}
              onValueChange={handleHistoryToggle}
              trackColor={{ false: colors.divider, true: colors.primaryAlt }}
              thumbColor={saveHistory ? colors.primary : colors.card}
              ios_backgroundColor={colors.divider}
              accessibilityLabel={saveHistory ? 'Turn off history saving' : 'Turn on history saving'}
              accessibilityRole="switch"
              accessibilityState={{ checked: saveHistory }}
            />,
            'Save history toggle'
          )}
          
          {renderSettingItem(
            <Lock size={22} color={colors.primary} />,
            'Clear All Data',
            'Delete all recipes and history data',
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearData}
              accessibilityLabel="Clear all data"
              accessibilityHint="Deletes all your recipes and history"
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>,
            'Clear all data button'
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          {renderSettingItem(
            <HelpCircle size={22} color={colors.primary} />,
            'Tutorial',
            'Learn how to use ReciptAI',
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleShowTutorial}
              accessibilityLabel="Open tutorial"
            >
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>,
            'Open tutorial button'
          )}
          
          {renderSettingItem(
            <LifeBuoy size={22} color={colors.primary} />,
            'Contact Support',
            'Get help with any issues',
            <TouchableOpacity 
              style={styles.iconButton}
              accessibilityLabel="Contact support"
            >
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>,
            'Contact support button'
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          accessibilityLabel="Log out"
          accessibilityRole="button"
        >
          <LogOut size={18} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.errorBackground,
  },
  clearButtonText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 