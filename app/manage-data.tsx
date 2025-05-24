import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import BackHeader from '@/components/BackHeader';
import ConfirmModal from '@/components/ConfirmModal';
import { useUserStore } from '@/stores/userStore';
import Toast from 'react-native-toast-message';
import typography from '@/constants/typography';

export default function ManageDataScreen() {
  const router = useRouter();
  const { user, signOut } = useUserStore();
  
  // State for modals
  const [deleteDataConfirmVisible, setDeleteDataConfirmVisible] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  
  // Handle back navigation
  const handleBackNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  // Handle export data
  const handleExportData = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setExportingData(true);
      
      // Simulate data preparation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Prepare data for export
      const userData = {
        profile: user,
        preferences: {
          // Mock preferences data
          dietary: 'Vegetarian',
          allergies: ['Peanuts', 'Gluten'],
          cookingTime: '30 minutes',
        },
        // Add more user data here
      };
      
      // Format as JSON string
      const dataString = JSON.stringify(userData, null, 2);
      
      // Share data
      await Share.share({
        title: 'Your Reciptai Data',
        message: dataString,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Data Exported',
        text2: 'Your data has been exported successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export your data. Please try again.');
    } finally {
      setExportingData(false);
    }
  };
  
  // Handle delete account request
  const handleDeleteAccountRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleteDataConfirmVisible(true);
  };
  
  // Handle delete data confirmation
  const handleDeleteData = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Close the modal
      setDeleteDataConfirmVisible(false);
      
      // Simulate API call to delete data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sign out the user
      signOut();
      
      // Show toast message
      Toast.show({
        type: 'success',
        text1: 'Data Deleted',
        text2: 'Your data has been deleted successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });
      
      // Navigate to onboarding screen
      router.replace('/onboarding');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete your data. Please try again.');
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <BackHeader 
        title="Manage My Data"
        transparent={false}
        onBackPress={handleBackNavigation}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Manage your personal data and privacy settings. You can export your data or delete your account.
          </Text>
        </View>
        
        {/* Data Management Options */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Data Options</Text>
          
          {/* Export My Data */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleExportData}
            activeOpacity={0.7}
            disabled={exportingData}
          >
            <View style={styles.actionButtonLeft}>
              <View style={[styles.iconContainer, styles.exportIconContainer]}>
                <Ionicons name="download-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionButtonTitle}>Export My Data</Text>
                <Text style={styles.actionButtonDescription}>
                  Download a copy of all your personal data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {/* Data Storage */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Navigate to storage settings
            }}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonLeft}>
              <View style={[styles.iconContainer, styles.storageIconContainer]}>
                <Ionicons name="save-outline" size={20} color={colors.text} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionButtonTitle}>Data Storage</Text>
                <Text style={styles.actionButtonDescription}>
                  Manage how your data is stored and cached
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Danger Zone */}
        <View style={styles.cardSection}>
          <Text style={styles.dangerSectionTitle}>Danger Zone</Text>
          
          {/* Delete My Account */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDeleteAccountRequest}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonLeft}>
              <View style={[styles.iconContainer, styles.deleteIconContainer]}>
                <Ionicons name="trash-outline" size={20} color={colors.white} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionButtonTitle, styles.deleteText]}>Delete My Account</Text>
                <Text style={styles.actionButtonDescription}>
                  Permanently delete your account and all your data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Delete Data Confirmation Modal */}
      <ConfirmModal
        visible={deleteDataConfirmVisible}
        title="Delete My Data"
        message="This action is permanent and cannot be undone. All your personal data, recipes, and preferences will be permanently deleted."
        confirmText="Delete Data"
        cancelText="Cancel"
        onConfirm={handleDeleteData}
        onCancel={() => setDeleteDataConfirmVisible(false)}
        isDestructive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  cardSection: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exportIconContainer: {
    backgroundColor: colors.primaryLight,
  },
  storageIconContainer: {
    backgroundColor: colors.backgroundLight || '#F5F5F5',
  },
  deleteIconContainer: {
    backgroundColor: colors.error,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  deleteText: {
    color: colors.error,
  },
  actionButtonDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
}); 