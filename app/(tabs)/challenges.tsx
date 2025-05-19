import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function ChallengesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Challenges' }} />
      <Text style={styles.text}>Challenges Screen - Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
