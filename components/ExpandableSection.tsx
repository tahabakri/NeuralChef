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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ExpandableSectionProps {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColors?: [string, string];
  children: React.ReactNode;
  initiallyExpanded?: boolean;
}

const ExpandableSection = ({ 
  title, 
  iconName, 
  iconColors = ['#4CAF50', '#81C784'], 
  children,
  initiallyExpanded = false
}: ExpandableSectionProps) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  
  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        {iconName && (
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={iconColors}
              style={styles.iconGradient}
            >
              <Ionicons name={iconName} size={20} color="white" />
            </LinearGradient>
          </View>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.textTertiary} 
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
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 16,
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
    padding: 16,
    borderBottomWidth: expanded => expanded ? 1 : 0,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.subtitle1,
    flex: 1,
    color: colors.text,
    marginLeft: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    // No specific styling needed here as each child component will define its own padding
  },
});

export default ExpandableSection; 