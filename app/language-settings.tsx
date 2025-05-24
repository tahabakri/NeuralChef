import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore, Language } from '@/stores/userStore';
import { useUndoStore } from '@/stores/undoStore';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Define supported languages
interface LanguageOption {
  id: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { id: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' },
  { id: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { id: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { id: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { id: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { id: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { id: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { id: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { id: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { id: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { id: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { id: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
];

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const currentLanguage = useUserStore(state => state.language);
  const setLanguage = useUserStore(state => state.setLanguage);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  const originalLanguage = useRef<Language>(currentLanguage);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confirmBtnAnim = useRef(new Animated.Value(0)).current;
  
  // Show the confirm button when language changes from original
  useEffect(() => {
    if (selectedLanguage !== originalLanguage.current) {
      Animated.spring(confirmBtnAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.spring(confirmBtnAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedLanguage, confirmBtnAnim]);

  // Handle language selection
  const handleSelectLanguage = (language: Language) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.03,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    setSelectedLanguage(language);
  };
  
  // Undo selection to original language
  const handleUndo = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    // Show undo toast animation
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    setSelectedLanguage(originalLanguage.current);
  };

  // Save selected language and go back
  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Only save if there was a change
    if (selectedLanguage !== originalLanguage.current) {
      // Update language in store (which will also save to AsyncStorage via middleware)
      setLanguage(selectedLanguage);
    }
    
    // Navigate back to settings explicitly
    router.push('/(tabs)/settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{
          title: 'Select Language',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            fontFamily: 'Poppins-SemiBold',
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleUndo}
              style={[
                styles.headerButton,
                selectedLanguage === originalLanguage.current && styles.disabledButton
              ]}
              disabled={selectedLanguage === originalLanguage.current}
            >
              <Ionicons 
                name="refresh-outline" 
                size={22} 
                color={selectedLanguage === originalLanguage.current ? 
                  colors.background : colors.white} 
              />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.searchBarPlaceholder}>
        <Text style={styles.languagesCount}>{LANGUAGES.length} languages available</Text>
      </View>

      <Animated.View style={[
        styles.languageListContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.languageItem,
                selectedLanguage === item.id && styles.selectedLanguageItem
              ]}
              onPress={() => handleSelectLanguage(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{item.flag}</Text>
                <View style={styles.languageTextContainer}>
                  <Text style={styles.languageName}>{item.name}</Text>
                  {item.nativeName !== item.name && (
                    <Text style={styles.languageNativeName}>{item.nativeName}</Text>
                  )}
                </View>
              </View>
              
              {selectedLanguage === item.id && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
      
      {/* Confirm button (fixed at bottom) */}
      <Animated.View 
        style={[
          styles.confirmButtonContainer,
          {
            transform: [
              { translateY: confirmBtnAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })}
            ]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || '#005F9E']}
            style={styles.confirmButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.confirmButtonText}>Apply Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Undo toast notification */}
      <Animated.View style={[
        styles.undoToast,
        { opacity: opacityAnim }
      ]}>
        <Text style={styles.undoToastText}>Reset to original language</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  searchBarPlaceholder: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  languagesCount: {
    fontSize: 14,
    color: colors.textTertiary,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  languageListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedLanguageItem: {
    backgroundColor: colors.background || '#F0F7FF',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 26,
    marginRight: 12,
  },
  languageTextContainer: {
    flexDirection: 'column',
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  languageNativeName: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  checkmarkContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  separator: {
    height: 6,
  },
  confirmButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  confirmButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  undoToast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  undoToastText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
}); 