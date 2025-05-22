import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Theme colors matching Home screen and other preference sections
const theme = {
  orange: '#FF8C00',
  green: '#50C878',
  white: '#FFFFFF',
  glassBg: 'rgba(255, 255, 255, 0.2)', // Glassmorphic background for content
  borderColor: 'rgba(255, 255, 255, 0.3)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  headerText: '#4A4A4A', // Darker text for header for contrast on potentially white/light main BG
};

// Chef icon states
const WINKING_CHEF_ICON = "happy-outline";
const DEFAULT_CHEF_ICON = "chevron-forward-outline"; // Default for chevron before animation logic

interface MoreOptionsSectionProps {
  children: React.ReactNode;
  title?: string;
}

const MoreOptionsSection: React.FC<MoreOptionsSectionProps> = ({ children, title = "More Options" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animationController = useRef(new Animated.Value(0)).current; // 0 for collapsed, 1 for expanded
  const chefIconScale = useRef(new Animated.Value(1)).current;
  const [chefIconName, setChefIconName] = useState<string>(DEFAULT_CHEF_ICON); // Will be chevron initially

  const playChefWinkAnimation = () => {
    // This will be a small winking chef icon appearing briefly, not related to chevron
    // Or, if the intent is for the CHEVRON to become a winking chef, that's different.
    // For now, assuming a separate small winking chef animation.
    // Let's keep the chevron as chevron and add a winking chef if required by overall design.
    // The prompt mentions "winking chef icon" on expand, separate from chevron.
    // For simplicity here, let's assume the chevron itself changes or a chef icon appears near it.
    // The current implementation focuses on chevron color and rotation.
    // The prompt says "chef icon winking" - this usually means the main chef icon of the screen.
    // For a collapsible section, a winking chevron is unusual. Let's stick to chevron color change.
    // If a separate winking chef is needed, it should be positioned absolutely.
  };

  const toggleExpansion = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.timing(animationController, {
      duration: 300, // Smooth slide-down animation (300ms)
      toValue: toValue,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false, 
    }).start();

    // LayoutAnimation for the height change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);

    if (!isExpanded) { // If expanding
      // Trigger winking chef animation (if a global chef icon is managed by a parent component)
      // For now, we'll just handle the chevron color change.
      // If a chef icon *within* this component should wink:
      setChefIconName(WINKING_CHEF_ICON); // Placeholder: imagine a chef icon appears and winks
      chefIconScale.setValue(0.8);
      Animated.spring(chefIconScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
      }).start();
      setTimeout(() => {
        // Revert if it was a temporary winking icon, or handle chevron state
      }, 800);
    }
  };

  const arrowRotation = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'], 
  });

  const headerStyle = {
    // backgroundColor: theme.white, // Header can be transparent or slightly different if main BG is gradient
    // For glassmorphism, the content area gets the glassBg.
    // Header might just be text and chevron over the screen background.
  };

  const contentHeight = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500], // Estimate max height, or use onLayout. For LayoutAnimation, this isn't strictly needed.
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpansion} style={[styles.header, headerStyle]} activeOpacity={0.8}>
        <Text style={styles.headerText}>{title}</Text>
        {/* Winking chef icon can be placed here if it's part of the header toggle */}
        {/* For now, only chevron that changes color based on isExpanded */} 
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Ionicons 
            name={"chevron-down-outline"} // Using chevron-down for open, chevron-forward for closed (or up)
            size={28}
            color={isExpanded ? theme.green : theme.orange} // Green when expanded, orange when collapsed
          />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          style={[
            styles.contentContainer, // This will have the glassmorphic background
            // If not using LayoutAnimation, you'd animate height here:
            // { maxHeight: contentHeight } 
          ]}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 15, // Match other sections
    overflow: 'hidden', // Crucial for animations and border radius on content
    // No background here, as the parent screen will have the gradient.
    // The contentContainer will have the glass effect.
    // Add border if the design calls for it around the entire collapsible unit
    // borderWidth: 1,
    // borderColor: theme.borderColor, // Optional border for the whole collapsible block
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15, // Increased padding
    paddingHorizontal: 20,
    // backgroundColor: 'transparent', // Header itself is transparent over the screen background
  },
  headerText: {
    fontSize: 20, // Larger title
    fontWeight: 'bold',
    color: theme.headerText, // Using a specific text color for contrast
    fontFamily: 'PlayfulFont-Bold', // Placeholder
  },
  contentContainer: {
    backgroundColor: theme.glassBg, // Glassmorphic background for the content area
    paddingHorizontal: 20,
    paddingBottom: 20, // Padding for content inside the glassmorphic box
    borderBottomLeftRadius: 15, // Ensure rounded corners if header is separate
    borderBottomRightRadius: 15,
    // Apply border to content if header is visually distinct and content needs its own border
    borderWidth: 1,
    borderColor: theme.borderColor,
    // Shadow for the content box to lift it
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default MoreOptionsSection;

// Developer notes:
// - The winking chef icon animation on expand needs clarification: 
//   Is it a global chef icon, or one specific to this section?
//   Current implementation makes the chevron icon change color.
//   A temporary winking icon logic is sketched but needs integration with a visual element.
// - Children of this component (SpiceLevelSelector, etc.) should have transparent backgrounds
//   if this component provides the glassmorphic background for the content area.
//   Alternatively, each child can implement its own glassmorphic background if they are visually distinct cards.
//   The prompt states "Subsections ... use the same glassmorphic background", implying the latter or this container styling them.
//   This implementation makes the contentContainer glassmorphic.
// - Font placeholders need to be replaced.
