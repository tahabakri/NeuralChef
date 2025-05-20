import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import gradients from '@/constants/gradients';
import GradientButton from '@/components/common/GradientButton';

/**
 * Settings Screen
 * Allows users to configure app preferences
 */
export default function SettingsScreen() {
  const router = useRouter();
  
  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [showCalories, setShowCalories] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);
  const [voiceCommands, setVoiceCommands] = useState(false);
  
  // Clear data handler
  const handleClearData = () => {
    Alert.alert(
      "Clear App Data",
      "This will remove all your saved recipes and history. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => console.log("Clear data confirmed")
        }
      ]
    );
  };
  
  // Render a setting item with toggle
  const renderToggleSetting = (
    icon: keyof typeof Ionicons.glyphMap, 
    title: string, 
    description: string, 
    value: boolean, 
    onValueChange: (newValue: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <LinearGradient
          colors={value 
            ? [gradients.freshGreen.colors[0], gradients.freshGreen.colors[1]] as const
            : [gradients.subtleGray.colors[0], gradients.subtleGray.colors[1]] as const
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Ionicons name={icon} size={22} color="white" />
        </LinearGradient>
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="white"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderToggleSetting(
            "moon-outline",
            "Dark Mode",
            "Switch between light and dark theme",
            darkMode,
            setDarkMode
          )}
          {renderToggleSetting(
            "speedometer-outline",
            "Show Calories",
            "Display calorie information for recipes",
            showCalories,
            setShowCalories
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderToggleSetting(
            "notifications-outline",
            "Notifications",
            "Receive updates and new recipe alerts",
            notifications,
            setNotifications
          )}
          {renderToggleSetting(
            "compass-outline",
            "Metric Units",
            "Use metric system for measurements",
            metricUnits,
            setMetricUnits
          )}
          {renderToggleSetting(
            "mic-outline",
            "Voice Commands",
            "Enable voice navigation and search",
            voiceCommands,
            setVoiceCommands
          )}
          {renderToggleSetting(
            "time-outline",
            "Save History",
            "Keep track of your recently viewed recipes",
            saveHistory,
            setSaveHistory
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/preferences')}
          >
            <Ionicons name="options-outline" size={20} color={colors.primary} />
            <Text style={styles.buttonText}>Dietary Preferences</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={[styles.buttonText, styles.dangerText]}>Clear App Data</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <GradientButton
            title="Log Out"
            gradient="subtleGray"
            size="small"
            onPress={() => console.log('Log out')}
          />
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 16,
    color: colors.text,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: colors.error,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  version: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
}); 