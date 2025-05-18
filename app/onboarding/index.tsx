import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import colors from '@/constants/colors';

export default function OnboardingWelcome() {
  const handleGetStarted = () => {
    router.push('/onboarding/search');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/chef.png')}
          style={styles.image}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.premiumText}>25K+ PREMIUM RECIPES</Text>
          <Text style={styles.titleText}>It's{'\n'}Cooking{'\n'}Time!</Text>
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
    height: '50%',
    marginTop: 40,
  },
  textContainer: {
    marginBottom: 40,
  },
  premiumText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  titleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    lineHeight: 56,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.white,
  },
}); 