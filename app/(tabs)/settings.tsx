import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsItem
            icon="person-outline"
            title="Profile"
            rightIcon="chevron-forward"
          />
          <SettingsItem
            icon="notifications-outline"
            title="Notifications"
            rightIcon="chevron-forward"
          />
          <SettingsItem
            icon="cloud-outline"
            title="Data & Storage"
            rightIcon="chevron-forward"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsItem
            icon="color-palette-outline"
            title="Appearance"
            rightIcon="chevron-forward"
          />
          <SettingsItem
            icon="language-outline"
            title="Language"
            rightText="English"
            rightIcon="chevron-forward"
          />
          <SettingsItem
            icon="restaurant-outline"
            title="Dietary Preferences"
            rightIcon="chevron-forward"
          />
        </View>
        
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
    </SafeAreaView>
  );
}

interface SettingsItemProps {
  icon: string;
  title: string;
  rightText?: string;
  rightIcon?: string;
  onPress?: () => void;
}

function SettingsItem({ icon, title, rightText, rightIcon, onPress }: SettingsItemProps) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon as any} size={22} color={colors.text} style={styles.settingsItemIcon} />
        <Text style={styles.settingsItemTitle}>{title}</Text>
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
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemRightText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginRight: 8,
  },
}); 