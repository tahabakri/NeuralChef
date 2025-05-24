import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import BackHeader from '@/components/BackHeader';
import typography from '@/constants/typography';

// FAQ data
const faqs = [
  {
    question: "How do I create a new recipe?",
    answer: "To create a new recipe, go to the home screen and tap the '+' button. Follow the guided steps to add ingredients, instructions, and images for your recipe."
  },
  {
    question: "Can I share my recipes with friends?",
    answer: "Yes! Open any recipe and tap the 'Share' button to send it via message, email, or social media."
  },
  {
    question: "How do I set my dietary preferences?",
    answer: "Go to Settings > Preferences > Dietary Preferences and select your diet type, allergies, and other preferences."
  },
  {
    question: "Can I sync my recipes across devices?",
    answer: "Yes, your recipes are automatically synced to all your devices when you're signed in with the same account."
  },
  {
    question: "How do I report a bug?",
    answer: "You can report bugs through the 'Contact Support' option on this screen, or email us directly at support@reciptai.com."
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  
  // Handle back navigation
  const handleBackNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  // Toggle FAQ expansion
  const toggleFaq = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };
  
  // Handle email support
  const handleEmailSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('mailto:support@reciptai.com?subject=Support%20Request')
      .catch(() => {
        Alert.alert('Cannot Open Email', 'Please email us directly at support@reciptai.com');
      });
  };
  
  // Handle visit website
  const handleVisitWebsite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('https://reciptai.com/support')
      .catch(() => {
        Alert.alert('Cannot Open Website', 'Please visit reciptai.com/support in your browser');
      });
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <BackHeader 
        title="Help & Support"
        transparent={false}
        onBackPress={handleBackNavigation}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Options */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          {/* Email Support */}
          <TouchableOpacity 
            style={styles.contactOption}
            onPress={handleEmailSupport}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.emailIconContainer]}>
              <Ionicons name="mail-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDescription}>support@reciptai.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {/* Visit Website */}
          <TouchableOpacity 
            style={styles.contactOption}
            onPress={handleVisitWebsite}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, styles.webIconContainer]}>
              <Ionicons name="globe-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactTitle}>Support Website</Text>
              <Text style={styles.contactDescription}>reciptai.com/support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* FAQs */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqs.map((faq, index) => (
            <TouchableOpacity 
              key={`faq-${index}`}
              style={[
                styles.faqItem,
                index === faqs.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => toggleFaq(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons 
                  name={expandedFaqIndex === index ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={colors.textSecondary} 
                />
              </View>
              
              {expandedFaqIndex === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* App Information */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>42</Text>
          </View>
          
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://reciptai.com/terms')}
              style={styles.termsButton}
            >
              <Text style={styles.termsText}>Terms of Service</Text>
            </TouchableOpacity>
            
            <Text style={styles.termsDivider}>•</Text>
            
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://reciptai.com/privacy')}
              style={styles.termsButton}
            >
              <Text style={styles.termsText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emailIconContainer: {
    backgroundColor: colors.primaryLight,
  },
  webIconContainer: {
    backgroundColor: colors.primaryLight,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Poppins-Medium',
  },
  contactDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Poppins-Medium',
    paddingRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  termsButton: {
    padding: 8,
  },
  termsText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'Poppins-Medium',
  },
  termsDivider: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
}); 