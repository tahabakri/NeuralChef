import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ExpandableSectionProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
}

const ExpandableSection = ({ 
  title, 
  icon, 
  iconColor = colors.primary,
  children, 
  initiallyExpanded = false 
}: ExpandableSectionProps) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.titleContainer}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
              <Ionicons name={icon} size={20} color={iconColor} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.text} 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    ...typography.subtitle1,
    color: colors.text,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default ExpandableSection; 