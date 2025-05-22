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
}

const BackHeader = ({ title, rightContent }: BackHeaderProps) => {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <BackArrow onClick={handleGoBack} />
        <Text style={styles.title}>{title}</Text>
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.heading3,
    color: colors.text,
  },
  rightSection: {
    justifyContent: 'center',
  },
});

export default BackHeader; 