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
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors'; // Import global colors
import { dietaryProfiles } from './constants';
import { DietaryProfileSelectorProps, DietaryProfileType } from './types';

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
        <Ionicons name={chefIconName as any} size={30} color={colors.primary} />
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
                selectedProfile === profile.id ? styles.selectedOptionText : styles.unselectedOptionText,
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
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 15,
    position: 'relative',
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chefIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: colors.textSecondary,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4, 
  },
  profileOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90, 
    borderWidth: 1.5,
  },
  unselectedOption: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  profileOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  unselectedOptionText: {
    color: colors.textSecondary,
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
