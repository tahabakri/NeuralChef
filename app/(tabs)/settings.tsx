import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import ThemeSwitch from '@/components/ThemeSwitch';
import NotificationSwitch from '@/components/NotificationSwitch';
import VoiceSwitch from '@/components/VoiceSwitch';
import ConfirmModal from '@/components/ConfirmModal';

export default function SettingsScreen() {
  const router = useRouter();
  
  // State for modals
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteDataConfirmVisible, setDeleteDataConfirmVisible] = useState(false);
  
  // Handle theme change
  const handleThemeChange = (isDarkMode: boolean) => {
    // In a real app, you would apply the theme change to the entire app
    console.log('Theme changed to:', isDarkMode ? 'dark' : 'light');
  };
  
  // Handle notifications change
  const handleNotificationsChange = (enabled: boolean) => {
    console.log('Notifications:', enabled ? 'enabled' : 'disabled');
  };
  
  // Handle voice assistant change
  const handleVoiceAssistantChange = (enabled: boolean) => {
    console.log('Voice Assistant:', enabled ? 'enabled' : 'disabled');
  };
  
  // Handle edit preferences
  const handleEditPreferences = () => {
    router.push('/preferences');
  };
  
  // Handle logout
  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // In a real app, you would clear auth tokens and navigate to login
    setLogoutConfirmVisible(false);
    Alert.alert('Success', 'You have been logged out');
  };
  
  // Handle delete data
  const handleDeleteData = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // In a real app, you would call an API to delete user data
    setDeleteDataConfirmVisible(false);
    Alert.alert('Success', 'Your data has been deleted');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingsItem}>
            <ThemeSwitch onThemeChange={handleThemeChange} />
          </View>
          
          <View style={styles.settingsItem}>
            <NotificationSwitch onNotificationChange={handleNotificationsChange} />
          </View>
          
          <View style={styles.settingsItem}>
            <VoiceSwitch onVoiceAssistantChange={handleVoiceAssistantChange} />
          </View>
        </View>
        
        {/* Profile & Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile & Preferences</Text>
          
          <SettingsItem
            icon="restaurant-outline"
            title="Dietary Preferences"
            rightIcon="chevron-forward"
            onPress={handleEditPreferences}
          />
          
          <SettingsItem
            icon="language-outline"
            title="Language"
            rightText="English"
            rightIcon="chevron-forward"
          />
          
          <SettingsItem
            icon="color-palette-outline"
            title="Appearance"
            rightIcon="chevron-forward"
          />
        </View>
        
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingsItem
            icon="person-outline"
            title="Profile"
            rightIcon="chevron-forward"
          />
          
          <SettingsItem
            icon="log-out-outline"
            title="Logout"
            rightIcon="chevron-forward"
            onPress={() => setLogoutConfirmVisible(true)}
          />
          
          <SettingsItem
            icon="trash-outline"
            title="Delete My Data"
            titleStyle={{ color: colors.error }}
            rightIcon="chevron-forward"
            onPress={() => setDeleteDataConfirmVisible(true)}
          />
        </View>
        
        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingsItem
            icon="help-circle-outline"
            title="Help & Support"
            rightIcon="chevron-forward"
          />
          
          <SettingsItem
            icon="information-circle-outline"
            title="About"
            rightIcon="chevron-forward"
          />
        </View>
      </ScrollView>
      
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={logoutConfirmVisible}
        title="Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
      
      {/* Delete Data Confirmation Modal */}
      <ConfirmModal
        visible={deleteDataConfirmVisible}
        title="Delete Data"
        message="Are you sure you want to delete all your data? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteData}
        onCancel={() => setDeleteDataConfirmVisible(false)}
        isDestructive={true}
      />
    </SafeAreaView>
  );
}

interface SettingsItemProps {
  icon: string;
  title: string;
  rightText?: string;
  rightIcon?: string;
  onPress?: () => void;
  titleStyle?: object;
}

function SettingsItem({ icon, title, rightText, rightIcon, onPress, titleStyle }: SettingsItemProps) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon as any} size={22} color={colors.text} style={styles.settingsItemIcon} />
        <Text style={[styles.settingsItemTitle, titleStyle]}>{title}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {rightText && (
          <Text style={styles.settingsItemRightText}>{rightText}</Text>
        )}
        {rightIcon && (
          <Ionicons name={rightIcon as any} size={18} color={colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemIcon: {
    marginRight: 12,
  },
  settingsItemTitle: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins-Regular',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemRightText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginRight: 8,
    fontFamily: 'Poppins-Regular',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
});
