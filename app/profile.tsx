import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import BackHeader from '@/components/BackHeader';
import { useUserStore, User } from '@/stores/userStore';
import typography from '@/constants/typography';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from 'react-native-toast-message';

// Update User type to include phone
declare module '@/stores/userStore' {
  interface User {
    phone?: string;
  }
}

// Define spacing constants for consistent layout
const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    pill: 24
  }
};

// Mock dietary profile data - replace with actual data from your preferences store
const mockDietaryProfile = {
  dietType: 'Vegetarian',
  allergies: ['Peanuts', 'Gluten'],
  dislikedIngredients: ['Mushrooms', 'Onion'],
  preferredCuisines: ['Indian', 'Italian'],
  maxCookingTime: '30 minutes',
  spiceTolerance: 'Medium',
  cookingGoals: ['Healthy weight loss', 'Low carb'],
};

// Mock activity stats - replace with actual data from your analytics/stats store
const mockActivityStats = {
  recipeCooked: 32,
  favoritesSaved: 14,
  weeklyGoal: {
    current: 4,
    target: 5
  },
  streak: 5,
  lastRecipe: {
    name: 'Chickpea Stir-fry',
    id: 'recipe-123'
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, signIn, signOut } = useUserStore();
  
  // Local state for form fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  
  // State for confirm modals
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteAccountConfirmVisible, setDeleteAccountConfirmVisible] = useState(false);
  const [deleteDataConfirmVisible, setDeleteDataConfirmVisible] = useState(false);
  
  // Handle save profile changes
  const handleSaveProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Validate fields
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // Update user data
    if (user) {
      updateUser({ name, email, phone });
      setIsEditing(false);
      
      // Show success message
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      // If not signed in, perform mock sign in
      signIn(email, 'password123', name)
        .then(() => {
          setIsEditing(false);
          // Show success message
          Alert.alert('Success', 'Profile created successfully');
        })
        .catch(error => {
          Alert.alert('Error', error.message);
        });
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(!isEditing);
  };
  
  // Handle back navigation with haptic feedback
  const handleBackNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate back to the settings screen
    router.back();
  };
  
  // Handle sign out button press
  const handleSignOutPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogoutConfirmVisible(true);
  };
  
  // Handle sign out confirmation
  const handleSignOutConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Close the modal
    setLogoutConfirmVisible(false);
    
    // Sign out the user
    signOut();
    
    // Show toast message
    Toast.show({
      type: 'success',
      text1: 'Logged out',
      text2: 'You have been logged out successfully',
      position: 'bottom',
      visibilityTime: 2000,
    });
    
    // Navigate back to settings
    router.back();
  };

  // Navigate to preferences screen
  const navigateToPreferences = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/preferences');
  };

  // Navigate to recipe details
  const navigateToRecipe = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/recipe/${recipeId}`);
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    setDeleteAccountConfirmVisible(true);
  };
  
  // Handle delete account confirmation
  const handleDeleteAccountConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Close the modal
    setDeleteAccountConfirmVisible(false);
    
    // Add account deletion logic here
    Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
    signOut();
    router.push('/');
  };

  // Handle delete data
  const handleDeleteData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to manage data screen
    router.push('/manage-data');
  };
  
  // Handle delete data confirmation
  const handleDeleteDataConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Close the modal
    setDeleteDataConfirmVisible(false);
    
    // Add data deletion logic here
    Alert.alert('Data Deleted', 'Your data has been successfully deleted.');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <BackHeader 
        title="Profile"
        transparent={false}
        onBackPress={handleBackNavigation}
        rightContent={
          <TouchableOpacity
            style={styles.editButton}
            onPress={toggleEditMode}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {user?.photoUrl ? (
              <Image 
                source={{ uri: user.photoUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {name ? name[0].toUpperCase() : "G"}
                </Text>
              </View>
            )}
          </View>
          
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Profile Form */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                autoCapitalize="words"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={styles.fieldValue}>{name || 'Not specified'}</Text>
            )}
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={styles.fieldValue}>{email || 'Not specified'}</Text>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Phone Number (optional)</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={styles.fieldValue}>{phone || 'Not specified'}</Text>
            )}
          </View>
          
          {isEditing && (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.orangeAccentStart, colors.orangeAccentEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Dietary Profile Snapshot */}
        <View style={styles.cardSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Dietary Profile</Text>
            <TouchableOpacity 
              onPress={navigateToPreferences}
              style={styles.manageButton}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Diet Type */}
          <View style={styles.dietaryItem}>
            <Text style={styles.dietaryLabel}>Diet Type</Text>
            <Text style={styles.dietaryValue}>{mockDietaryProfile.dietType}</Text>
          </View>

          {/* Allergies */}
          <View style={styles.dietaryItem}>
            <Text style={styles.dietaryLabel}>Allergies</Text>
            <View style={styles.tagsContainer}>
              {mockDietaryProfile.allergies.map((allergy, index) => (
                <View key={`allergy-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{allergy}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Disliked Ingredients */}
          <View style={styles.dietaryItem}>
            <Text style={styles.dietaryLabel}>Disliked Ingredients</Text>
            <View style={styles.tagsContainer}>
              {mockDietaryProfile.dislikedIngredients.map((ingredient, index) => (
                <View key={`disliked-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Preferred Cuisines */}
          <View style={styles.dietaryItem}>
            <Text style={styles.dietaryLabel}>Preferred Cuisines</Text>
            <View style={styles.tagsContainer}>
              {mockDietaryProfile.preferredCuisines.map((cuisine, index) => (
                <View key={`cuisine-${index}`} style={[styles.tag, styles.tagHighlight]}>
                  <Text style={[styles.tagText, styles.tagTextHighlight]}>{cuisine}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Max Cooking Time */}
          <View style={styles.dietaryItem}>
            <Text style={styles.dietaryLabel}>Max Cooking Time</Text>
            <Text style={styles.dietaryValue}>{mockDietaryProfile.maxCookingTime}</Text>
          </View>

          {/* Spice Tolerance */}
          <View style={styles.dietaryItem}>
            <Text style={styles.dietaryLabel}>Spice Tolerance</Text>
            <Text style={styles.dietaryValue}>{mockDietaryProfile.spiceTolerance}</Text>
          </View>

          {/* Cooking Goals */}
          <View style={styles.dietaryItem}>
            <Text style={styles.dietaryLabel}>Cooking Goals</Text>
            <View style={styles.tagsContainer}>
              {mockDietaryProfile.cookingGoals.map((goal, index) => (
                <View key={`goal-${index}`} style={[styles.tag, styles.tagGoal]}>
                  <Text style={[styles.tagText, styles.tagTextGoal]}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* Activity & Usage Stats */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Activity Stats</Text>
          
          <View style={styles.statsGrid}>
            {/* Recipes Cooked */}
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{mockActivityStats.recipeCooked}</Text>
              <Text style={styles.statLabel}>Recipes Cooked</Text>
            </View>
            
            {/* Favorites Saved */}
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="heart-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{mockActivityStats.favoritesSaved}</Text>
              <Text style={styles.statLabel}>Favorites Saved</Text>
            </View>
            
            {/* Weekly Cooking Goal */}
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {mockActivityStats.weeklyGoal.current}/{mockActivityStats.weeklyGoal.target}
              </Text>
              <Text style={styles.statLabel}>Weekly Goal</Text>
            </View>
            
            {/* App Usage Streak */}
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame" size={24} color={colors.orangeAccentEnd} />
              </View>
              <View style={styles.streakContainer}>
                <Text style={styles.statValue}>{mockActivityStats.streak}</Text>
                <Text style={styles.statBadge}>🔥</Text>
              </View>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
          
          {/* Last Recipe Cooked */}
          <TouchableOpacity 
            style={styles.lastRecipeCard}
            onPress={() => navigateToRecipe(mockActivityStats.lastRecipe.id)}
            activeOpacity={0.8}
          >
            <View style={styles.lastRecipeContent}>
              <View style={styles.lastRecipeIcon}>
                <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.lastRecipeLabel}>Last Recipe Cooked</Text>
                <Text style={styles.lastRecipeName}>{mockActivityStats.lastRecipe.name}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Account Actions */}
        {user?.id && !isEditing && (
          <>
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Account</Text>
              
              {/* Edit Profile */}
              <TouchableOpacity 
                style={styles.accountActionButton}
                onPress={toggleEditMode}
                activeOpacity={0.7}
              >
                <Ionicons name="person-outline" size={20} color={colors.text} />
                <Text style={styles.accountActionText}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.actionArrow} />
              </TouchableOpacity>
              
              {/* Change Password */}
              <TouchableOpacity 
                style={styles.accountActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Add password change navigation or modal here
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="key-outline" size={20} color={colors.text} />
                <Text style={styles.accountActionText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.actionArrow} />
              </TouchableOpacity>
              
              {/* Manage Login Method */}
              <TouchableOpacity 
                style={styles.accountActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Add login methods management navigation here
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="finger-print-outline" size={20} color={colors.text} />
                <Text style={styles.accountActionText}>Manage Login Method</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.actionArrow} />
              </TouchableOpacity>
              
              {/* Delete My Data */}
              <TouchableOpacity 
                style={styles.accountActionButton}
                onPress={handleDeleteData}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-bin-outline" size={20} color={colors.warning} />
                <Text style={[styles.accountActionText, { color: colors.warning }]}>Delete My Data</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.actionArrow} />
              </TouchableOpacity>
              
              {/* Delete Account */}
              <TouchableOpacity 
                style={styles.accountActionButton}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                <Text style={[styles.accountActionText, { color: colors.error }]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.actionArrow} />
              </TouchableOpacity>
            </View>
            
            {/* Sign Out Button */}
            <TouchableOpacity 
              style={styles.signOutButtonContainer}
              onPress={handleSignOutPress}
              activeOpacity={0.8}
            >
              <View style={styles.signOutButton}>
                <Ionicons name="log-out-outline" size={20} color={colors.white} style={styles.signOutIcon} />
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={logoutConfirmVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleSignOutConfirm}
        onCancel={() => setLogoutConfirmVisible(false)}
        confirmButtonColor={colors.error}
        isDestructive={true}
      />
      
      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        visible={deleteAccountConfirmVisible}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={handleDeleteAccountConfirm}
        onCancel={() => setDeleteAccountConfirmVisible(false)}
        isDestructive={true}
      />
      
      {/* Delete Data Confirmation Modal */}
      <ConfirmModal
        visible={deleteDataConfirmVisible}
        title="Delete My Data"
        message="Are you sure you want to delete all your data? This includes saved recipes, preferences, and history."
        confirmText="Delete Data"
        cancelText="Cancel"
        onConfirm={handleDeleteDataConfirm}
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
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.md,
  },
  editButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: colors.primaryDark || colors.primary,
  },
  changePhotoButton: {
    marginTop: spacing.md,
    padding: spacing.xs,
  },
  changePhotoText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  cardSection: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: spacing.md,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  formField: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins-Medium',
  },
  fieldValue: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  textInput: {
    fontSize: typography.bodyLarge.fontSize,
    fontFamily: typography.bodyLarge.fontFamily,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  saveButton: {
    borderRadius: spacing.borderRadius.pill,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  saveButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  signOutButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: spacing.borderRadius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  signOutIcon: {
    marginRight: spacing.sm,
  },
  signOutButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  dietaryItem: {
    marginBottom: spacing.md,
  },
  dietaryLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins-Medium',
  },
  dietaryValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagHighlight: {
    backgroundColor: colors.primaryLight,
  },
  tagGoal: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  tagTextHighlight: {
    color: colors.primary,
  },
  tagTextGoal: {
    color: colors.orangeAccentEnd,
  },
  // Activity Stats styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
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
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.heading3,
    color: colors.textPrimary,
    fontFamily: 'Poppins-SemiBold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadge: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  lastRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
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
  lastRecipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastRecipeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  lastRecipeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lastRecipeName: {
    ...typography.subtitle2,
    color: colors.textPrimary,
  },
  // Account Action styles
  accountActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountActionText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  actionArrow: {
    marginLeft: 'auto',
  },
  warning: {
    color: colors.warning || '#F9A825',
  },
}); 