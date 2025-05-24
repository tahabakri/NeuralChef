import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import BackHeader from '@/components/BackHeader';
import typography from '@/constants/typography';

export default function AboutScreen() {
  const router = useRouter();
  
  // Handle back navigation
  const handleBackNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  // Handle opening links
  const openLink = (url: string, title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(url).catch(() => {
      alert(`Could not open ${title}. Please visit ${url} directly.`);
    });
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <BackHeader 
        title="About"
        transparent={false}
        onBackPress={handleBackNavigation}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo and Name */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Reciptai</Text>
          <Text style={styles.appTagline}>Your AI Cooking Assistant</Text>
        </View>
        
        {/* App Version */}
        <View style={styles.cardSection}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Version</Text>
            <Text style={styles.versionValue}>1.0.0 (42)</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => openLink('https://reciptai.com/releases', 'Release Notes')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.updateButtonGradient}
            >
              <Text style={styles.updateButtonText}>Check for Updates</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Developers */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Developed By</Text>
          <Text style={styles.developerName}>Reciptai Team</Text>
          <Text style={styles.developerDescription}>
            Our team of passionate developers and food enthusiasts created Reciptai to make cooking 
            easier and more enjoyable for everyone. We believe that AI can transform the way people 
            approach food preparation.
          </Text>
          
          <TouchableOpacity 
            style={styles.developerLink}
            onPress={() => openLink('https://reciptai.com/team', 'Our Team')}
          >
            <Text style={styles.linkText}>Meet Our Team</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Connect */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          
          <View style={styles.socialLinks}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://twitter.com/reciptai', 'Twitter')}
            >
              <Ionicons name="logo-twitter" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://instagram.com/reciptai', 'Instagram')}
            >
              <Ionicons name="logo-instagram" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://facebook.com/reciptai', 'Facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity 
            onPress={() => openLink('https://reciptai.com/terms', 'Terms of Service')}
            style={styles.legalButton}
          >
            <Text style={styles.legalText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <Text style={styles.legalDivider}>•</Text>
          
          <TouchableOpacity 
            onPress={() => openLink('https://reciptai.com/privacy', 'Privacy Policy')}
            style={styles.legalButton}
          >
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        
        {/* Copyright */}
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} Reciptai. All rights reserved.
        </Text>
      </ScrollView>
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
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  appTagline: {
    ...typography.subtitle1,
    color: colors.textSecondary,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  cardSection: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
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
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  versionLabel: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  versionValue: {
    ...typography.bodyLarge,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
  },
  updateButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  updateButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    ...typography.button,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
  },
  sectionTitle: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  developerName: {
    ...typography.subtitle2,
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  developerDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  developerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  linkText: {
    ...typography.button,
    color: colors.primary,
    marginRight: 4,
    fontFamily: 'Poppins-Medium',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  legalButton: {
    padding: 8,
  },
  legalText: {
    ...typography.button,
    color: colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  legalDivider: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  copyright: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
}); 