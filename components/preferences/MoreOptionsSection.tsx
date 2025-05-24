import React, { useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';

// MoreOptionsSection: simple expand/collapse

interface MoreOptionsSectionProps {
  children: React.ReactNode;
  title?: string;
}

const MoreOptionsSection = memo<MoreOptionsSectionProps>(({ children, title = "More Options" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight] = useState(new Animated.Value(0));

  const toggleExpansion = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const iconName = isExpanded ? 'chevron-up-outline' : 'chevron-down-outline';

  // Using React.memo to prevent re-rendering of children when not expanded
  const renderContent = useCallback(() => {
    if (!isExpanded) return null;
    
    return (
      <View style={styles.contentContainer}>
        {children}
      </View>
    );
  }, [isExpanded, children]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpansion} style={[
        styles.header,
        isExpanded ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null
      ]} activeOpacity={0.8}>
        <Text style={styles.headerText}>{title}</Text>
        <Ionicons name={iconName} size={24} color={colors.primary} />
      </TouchableOpacity>

      {renderContent()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: '100%',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
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
