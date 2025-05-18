import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '@/stores/userStore';
import typography from '@/constants/typography';

export interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ visible, onClose, onSuccess }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useUserStore();

  const handleDismiss = () => {
    // Reset form state when modal closes
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    
    // Basic validation
    if (!email.trim() || (activeTab === 'signup' && !name.trim()) || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (activeTab === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      
      // Clear form and handle success
      setEmail('');
      setPassword('');
      setName('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setError('');
    setIsLoading(true);
    
    try {
      // In a real implementation, you would integrate with the social auth provider
      // For this example, we'll just simulate a successful sign-in
      if (provider === 'google') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await signIn('google-user@example.com', '', 'Google User');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await signIn('apple-user@example.com', '', 'Apple User');
      }
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred with social sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
            >
              <View style={styles.modal}>
                <View style={styles.header}>
                  <Text style={styles.title}>
                    {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={handleDismiss}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.tabs}>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
                    onPress={() => setActiveTab('signin')}
                  >
                    <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                    onPress={() => setActiveTab('signup')}
                  >
                    <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.socialButtons}>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialAuth('google')}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-google" size={20} color={colors.text} />
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  </TouchableOpacity>
                  
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialAuth('apple')}
                      disabled={isLoading}
                    >
                      <Ionicons name="logo-apple" size={20} color={colors.text} />
                      <Text style={styles.socialButtonText}>Continue with Apple</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <View style={styles.form}>
                  {activeTab === 'signup' && (
                    <View style={styles.inputContainer}>
                      <Ionicons name="person-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor={colors.textTertiary}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  )}
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor={colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!isLoading}
                    />
                  </View>
                  
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  
                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#FFA726', '#FB8C00']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={handleDismiss}
                  disabled={isLoading}
                >
                  <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.subtitle1,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  socialButtons: {
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialButtonText: {
    ...typography.button,
    color: colors.text,
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.body2,
    color: colors.textTertiary,
    marginHorizontal: 16,
  },
  form: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    ...typography.body1,
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});

export default AuthModal; 