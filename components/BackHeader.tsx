import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';

interface BackHeaderProps {
  title?: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  transparent?: boolean;
}

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  onBack,
  rightContent,
  transparent = false
}) => {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[
      styles.container,
      transparent && styles.transparentContainer
    ]}>
      <StatusBar barStyle={transparent ? "light-content" : "dark-content"} />
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <ArrowLeft 
          size={24} 
          color={transparent ? colors.white : colors.text}
          strokeWidth={2}
        />
      </TouchableOpacity>
      
      {title && (
        <Text style={[
          styles.title,
          transparent && styles.transparentTitle
        ]}>
          {title}
        </Text>
      )}
      
      <View style={styles.rightContentContainer}>
        {rightContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  transparentTitle: {
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rightContentContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
});

export default BackHeader; 