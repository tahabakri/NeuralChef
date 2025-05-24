import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import colors from '@/constants/colors';
import NotificationSwitch from '@/components/NotificationSwitch';
import ConfirmModal from '@/components/ConfirmModal';
import { usePreferenceSelector } from '@/stores/preferencesStore';
import { useUserStore, Language } from '@/stores/userStore';

export default function SettingsScreen() {
  const router = useRouter();
  
  // State for modals
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteDataConfirmVisible, setDeleteDataConfirmVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Get dietary preferences from the store
  const dietaryProfile = usePreferenceSelector(state => state.dietaryProfile);
  const allergies = usePreferenceSelector(state => state.allergies || []);
  const spiceLevel = usePreferenceSelector(state => state.spiceLevel);
  const medicalConditions = usePreferenceSelector(state => state.medicalConditions || []);
  
  // Get language from user store
  const currentLanguage = useUserStore(state => state.language);
  
  // Get display name for dietary profile
  const getDietaryProfileDisplayName = (profile: string): string => {
    switch (profile) {
      case 'noRestrictions': return 'No Restrictions';
      case 'vegetarian': return 'Vegetarian';
      case 'vegan': return 'Vegan';
      case 'pescatarian': return 'Pescatarian';
      case 'paleo': return 'Paleo';
      case 'keto': return 'Keto';
      case 'lowCarb': return 'Low Carb';
      case 'glutenFree': return 'Gluten Free';
      case 'dairyFree': return 'Dairy Free';
      default: return 'No Restrictions';
    }
  };
  
  // Get display name for spice level
  const getSpiceLevelDisplayName = (level: string): string => {
    switch (level) {
      case 'none': return 'No Spice';
      case 'mild': return 'Mild Spice';
      case 'medium': return 'Medium Spice';
      case 'spicy': return 'Spicy';
      case 'extraSpicy': return 'Extra Spicy';
      default: return 'Medium Spice';
    }
  };
  
  // Get display name for language
  const getLanguageDisplayName = (lang: Language): string => {
    switch (lang) {
      case 'en': return 'English';
      case 'ar': return 'Arabic';
      case 'es': return 'Spanish';
      case 'fr': return 'French';
      case 'de': return 'German';
      case 'it': return 'Italian';
      case 'pt': return 'Portuguese';
      case 'ru': return 'Russian';
      case 'zh': return 'Chinese';
      case 'ja': return 'Japanese';
      case 'ko': return 'Korean';
      case 'hi': return 'Hindi';
      case 'tr': return 'Turkish';
      case 'nl': return 'Dutch';
      case 'sv': return 'Swedish';
      default: return 'English';
    }
  };
  
  // Create a summarized preferences display
  const dietaryPreferencesSummary = useMemo(() => {
    let summary = getDietaryProfileDisplayName(dietaryProfile);
    
    // Add allergies if present (up to 2 for UI clarity)
    if (allergies.length > 0) {
      const allergyText = allergies.length === 1 
        ? allergies[0] 
        : allergies.length === 2 
          ? `${allergies[0]}, ${allergies[1]}` 
          : `${allergies[0]} + ${allergies.length - 1} more`;
      
      summary += `, ${allergyText}`;
    }
    
    // Add medical conditions if present (just indicate them rather than listing)
    if (medicalConditions.length > 0) {
      summary += ", Health-conscious";
    }
    
    // Add spice preference if it's not medium (medium is default)
    if (spiceLevel && spiceLevel !== 'medium') {
      summary += `, ${getSpiceLevelDisplayName(spiceLevel)}`;
    }
    
    return summary;
  }, [dietaryProfile, allergies, medicalConditions, spiceLevel]);
  
  // Load notification settings on component mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('notificationsEnabled');
        if (savedPreference !== null) {
          setNotificationsEnabled(savedPreference === 'true');
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    
    loadNotificationSettings();
  }, []);
  
  // Handle notifications change
  const handleNotificationsChange = async (enabled: boolean) => {
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Update local state
    setNotificationsEnabled(enabled);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('notificationsEnabled', enabled.toString());
      console.log('Notifications:', enabled ? 'enabled' : 'disabled');
      
      // You could also update a global state here if using a state management solution
      // Example: useUserStore.setState({ notificationsEnabled: enabled });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };
  
  // Handle edit preferences
  const handleEditPreferences = () => {
    // Provide haptic feedback for good UX
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Navigate to the preferences screen
    router.push('/preferences');
  };
  
  // Handle language settings
  const handleLanguageSettings = () => {
    // Provide haptic feedback for good UX
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Navigate to the language settings screen
    router.push('/language-settings');
  };
  
  // Handle logout
  const handleLogout = () => {
    // Close the confirmation modal
    setLogoutConfirmVisible(false);
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Clear user session
    useUserStore.getState().signOut();
    
    // Show toast message
    Toast.show({
      type: 'success',
      text1: 'Logged out',
      text2: 'You have been logged out successfully',
      position: 'bottom',
      visibilityTime: 2000,
    });
    
    // Navigate to onboarding screen
    router.replace('/onboarding');
  };
  
  // Handle manage data (formerly delete data)
  const handleManageData = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Close the confirmation modal if open
    setDeleteDataConfirmVisible(false);
    
    // Navigate to the manage data screen
    router.push('/manage-data');
  };
  
  // Handle navigation to profile screen
  const handleProfile = () => {
    router.push('/profile');
  };
  
  // Handle navigation to help & support screen
  const handleHelpSupport = () => {
    // Provide haptic feedback for good UX
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Navigate to the help & support screen
    router.push('/help-support');
  };
  
  // Handle navigation to about screen
  const handleAbout = () => {
    // Provide haptic feedback for good UX
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Navigate to the dedicated about screen
    router.push('/about');
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
          <Text style={styles.sectionTitle}>🔧 App Settings</Text>
          
          <View style={styles.settingsItem}>
            <NotificationSwitch onNotificationChange={handleNotificationsChange} />
          </View>
        </View>
        
        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Preferences</Text>
          
          <SettingsItem
            icon="restaurant-outline"
            title="Dietary Preferences"
            rightText={dietaryPreferencesSummary}
            rightIcon="chevron-forward"
            onPress={handleEditPreferences}
          />
          
          <SettingsItem
            icon="language-outline"
            title="Language"
            rightText={getLanguageDisplayName(currentLanguage)}
            rightIcon="chevron-forward"
            onPress={handleLanguageSettings}
          />
        </View>
        
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>
          
          <SettingsItem
            icon="person-outline"
            title="Profile"
            rightIcon="chevron-forward"
            onPress={handleProfile}
          />
          
          <SettingsItem
            icon="log-out-outline"
            title="Logout"
            rightIcon="chevron-forward"
            onPress={() => setLogoutConfirmVisible(true)}
          />
          
          <SettingsItem
            icon="settings-outline"
            title="Manage My Data"
            rightIcon="chevron-forward"
            onPress={() => setDeleteDataConfirmVisible(true)}
          />
        </View>
        
        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Support</Text>
          
          <SettingsItem
            icon="help-circle-outline"
            title="Help & Support"
            rightIcon="chevron-forward"
            onPress={handleHelpSupport}
          />
          
          <SettingsItem
            icon="information-circle-outline"
            title="About"
            rightIcon="chevron-forward"
            onPress={handleAbout}
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
        confirmButtonColor={colors.primary}
      />
      
      {/* Manage Data Confirmation Modal */}
      <ConfirmModal
        visible={deleteDataConfirmVisible}
        title="Manage My Data"
        message="This will reset your preferences and remove your stored data. Are you sure you want to continue?"
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={handleManageData}
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
          <Text style={styles.settingsItemRightText} numberOfLines={1} ellipsizeMode="tail">
            {rightText}
          </Text>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Poppins-Bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 21,
    marginBottom: 4,
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
    flex: 1, 
    justifyContent: 'flex-end',
  },
  settingsItemRightText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginRight: 8,
    fontFamily: 'Poppins-Regular',
    maxWidth: '80%',
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
