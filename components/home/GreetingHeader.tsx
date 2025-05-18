import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';

interface GreetingHeaderProps {
  onGetStartedPress: () => void;
}

export default function GreetingHeader({ onGetStartedPress }: GreetingHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>It's Cooking Time!</Text>
      <Image source={require('../../assets/images/chef.png')} style={styles.chefImage} />
      <TouchableOpacity style={styles.button} onPress={onGetStartedPress}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  chefImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 