import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGetStarted();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFEFCC', '#FFA500']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/chef.png')}
          style={styles.image}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.premiumText}>25K+ PREMIUM RECIPES</Text>
          <Text style={styles.titleText}>It's{'\n'}Cooking{'\n'}Time!</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          accessibilityLabel="Get Started with Reciptai"
          accessibilityRole="button"
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    alignSelf: 'center',
    marginTop: height * 0.05,
  },
  textContainer: {
    marginTop: -height * 0.1,
  },
  premiumText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
  },
  titleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 52,
    lineHeight: 60,
    color: '#222222',
  },
  getStartedButton: {
    backgroundColor: '#4CAF83',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'center',
    width: width * 0.5,
  },
  getStartedText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
  },
});

export default WelcomeScreen; 