import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import BackArrow from './BackArrow';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface BackHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  transparent?: boolean;
  onBackPress?: () => void;
}

const BackHeader = ({ 
  title, 
  rightContent, 
  transparent = false,
  onBackPress,
}: BackHeaderProps) => {
  const router = useRouter();
  
  const handleGoBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };
  
  return (
    <View style={[
      styles.container, 
      transparent && styles.transparentContainer
    ]}>
      <View style={styles.leftSection}>
        <BackArrow 
          onClick={handleGoBack} 
          color={transparent ? colors.white : colors.text}
        />
        <Text style={[
          styles.title,
          transparent && styles.transparentTitle
        ]}>
          {title}
        </Text>
      </View>
      
      {rightContent && (
        <View style={styles.rightSection}>
          {rightContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.heading3,
    color: colors.text,
  },
  transparentTitle: {
    color: colors.white,
  },
  rightSection: {
    justifyContent: 'center',
  },
});

export default BackHeader; 