import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  // Image, // For placeholder chef icon - Consider using an actual image or LottieView
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for now
// import colors from '@/constants/colors'; // Using local theme
import { dietaryProfiles } from './constants';
import { DietaryProfileSelectorProps, DietaryProfileType } from './types';

// New theme colors matching Home screen
const theme = {
  orange: '#FF8C00', // Brighter orange
  green: '#50C878', // Emerald green
  white: '#FFFFFF',
  glassBg: 'rgba(255, 255, 255, 0.2)', // Glassmorphic background
  softPeachGradientTop: '#FFDAB9', // Peachpuff for top of gradient
  softPeachGradientBottom: '#FFFFFF', // White for bottom of gradient
  borderColor: 'rgba(255, 255, 255, 0.3)', // Light border for glassmorphism
  shadowColor: 'rgba(0, 0, 0, 0.1)', // Softer shadow
};

// Placeholder for chef icon - ideally a Lottie animation or custom image
// For now, we'll use an Ionicons name that can be dynamically changed.
const WINKING_CHEF_ICON = "happy-outline"; // Or any suitable winking icon
const DEFAULT_CHEF_ICON = "person-circle-outline"; // Default chef icon

const DietaryProfileSelector: React.FC<DietaryProfileSelectorProps> = ({
  selectedProfile,
  onSelectProfile
}) => {
  const [chefIconName, setChefIconName] = React.useState(DEFAULT_CHEF_ICON);
  const chefIconScale = useRef(new Animated.Value(1)).current;

  const animatedScales = useRef<{ [key: string]: Animated.Value }>(
    dietaryProfiles.reduce((acc, profile) => ({
      ...acc,
      [profile.id]: new Animated.Value(1)
    }), {})
  ).current;

  const handleSelectProfile = (profileId: string) => {
    // Bounce animation for the card
    Animated.sequence([
      Animated.timing(animatedScales[profileId], {
        toValue: 1.1, // Slightly larger bounce
        duration: 100, // Faster bounce (200ms total for in & out)
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(animatedScales[profileId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();

    // Winking chef animation
    setChefIconName(WINKING_CHEF_ICON);
    Animated.sequence([
      Animated.timing(chefIconScale, {
        toValue: 1.2, // Chef icon bounce
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(chefIconScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset to default icon after animation (optional, or timed reset)
      // setTimeout(() => setChefIconName(DEFAULT_CHEF_ICON), 300); // Reset after a short delay
    });


    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectProfile(profileId as DietaryProfileType);
  };

  return (
    <View style={styles.section}>
      {/* Chef icon in the corner - Animated */}
      <Animated.View style={[styles.chefIconContainer, { transform: [{ scale: chefIconScale }] }]}>
        <Ionicons name={chefIconName as any} size={30} color={theme.orange} />
      </Animated.View>

      <Text style={styles.sectionTitle}>Your Food Style</Text>
      <Text style={styles.sectionSubtitle}>What's your lunch vibe?</Text>
      
      <View style={styles.optionsContainer}>
        {dietaryProfiles.map((profile) => (
          <Animated.View
            key={profile.id}
            style={{ transform: [{ scale: animatedScales[profile.id] }] }}
          >
            <TouchableOpacity
              style={[
                styles.profileOption,
                selectedProfile === profile.id ? styles.selectedOption : styles.unselectedOption,
              ]}
              onPress={() => handleSelectProfile(profile.id)}
              accessible={true}
              accessibilityLabel={`Select ${profile.label} dietary profile`}
              accessibilityRole="button"
            >
              <Text style={[
                styles.profileOptionText,
                selectedProfile === profile.id && styles.selectedOptionText,
              ]}>
                {profile.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20, // Increased padding
    marginBottom: 20,
    backgroundColor: theme.glassBg, // Glassmorphic background
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.borderColor, // Light border for glass effect
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 4 }, // Adjusted shadow
    shadowOpacity: 0.1,
    shadowRadius: 10, // Softer shadow
    elevation: 5, // For Android shadow
    position: 'relative', // For absolute positioning of chef icon
  },
  chefIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10, // Ensure it's above other elements
  },
  sectionTitle: {
    fontSize: 22, // Slightly larger
    fontWeight: 'bold', // Bold
    marginBottom: 5,
    color: theme.orange, // Orange color
    fontFamily: 'PlayfulFont-Bold', // Placeholder for playful font
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: theme.green, // Green color
    fontFamily: 'PlayfulFont-Regular', // Placeholder for playful font
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4, // Offset for card margins
  },
  profileOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15, // Rounded cards
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90, // Minimum width for smaller text options
    borderWidth: 2, // Outline
  },
  unselectedOption: {
    backgroundColor: theme.green,
    borderColor: theme.orange,
  },
  selectedOption: {
    backgroundColor: theme.orange, // Fully orange when selected
    borderColor: theme.orange, // Still orange border or could be green for contrast
  },
  profileOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.white, // White text for green cards
    fontFamily: 'PlayfulFont-SemiBold', // Placeholder for playful font
  },
  selectedOptionText: {
    color: theme.white, // White text for orange cards
    fontWeight: 'bold',
  },
  // Remove chefMessageOverlay, chefIcon, speechBubble, speechBubbleText, lunchIcon styles
  // as they are replaced or handled differently.
});

export default DietaryProfileSelector;

// Developer notes:
// - Replace 'PlayfulFont-Bold', 'PlayfulFont-Regular', 'PlayfulFont-SemiBold' with actual font family names.
// - Consider using react-native-blur for a more convincing glassmorphic effect if performance allows.
// - The chef icon (Ionicons) is a placeholder. A Lottie animation or a custom image (e.g., winking chef) would be ideal.
// - The gradient background for the entire screen should be handled at the parent screen level.
// - Ensure `dietaryProfiles` in `constants.ts` contains the necessary data.
// - Bounce animation duration is 200ms total (100ms in, 100ms out).
// - Chef winks in the corner when an option is tapped.
