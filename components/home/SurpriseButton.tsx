import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Sparkles } from 'lucide-react-native'; // Changed Dice to Gift for testing
import { router } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming,
  Easing
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SurpriseButtonProps {
  onPress?: () => void;
}

const SurpriseButton: React.FC<SurpriseButtonProps> = ({ onPress }) => {
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateZ: `${rotation.value}deg` }
      ],
      width: '100%'
    };
  });

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animation sequence - press animation
    scale.value = withSequence(
      withTiming(0.92, { duration: 100, easing: Easing.inOut(Easing.quad) }),
      withTiming(1.05, { duration: 150, easing: Easing.inOut(Easing.quad) }),
      withSpring(1, { damping: 12, stiffness: 120 })
    );
    
    // Slight rotation animation
    rotation.value = withSequence(
      withTiming(-3, { duration: 100 }),
      withTiming(3, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    if (onPress) {
      onPress();
    } else {
      // Navigate to generate random recipe
      router.push('/generate?random=true');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity 
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
          accessibilityLabel="Surprise me with a random recipe"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#FCE38A', '#F38181']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Gift
              size={22}
              color="#FFFFFF"
              style={styles.icon}
            />
            <Text style={styles.text}>Surprise Me</Text>
            <Sparkles
              size={18}
              color="#FFFFFF"
              style={styles.sparklesIcon}
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: SCREEN_WIDTH - 40, // Full width minus padding
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  icon: {
    marginRight: 10,
  },
  sparklesIcon: {
    marginLeft: 10,
  },
  text: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SurpriseButton;
