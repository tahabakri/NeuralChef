/**
 * Typography constants for the AI Recipe Helper app
 * Defines consistent text styles across the app
 */

import { TextStyle } from 'react-native';
import { Language } from '@/stores/userStore';

// Base font styles using Open Sans
const fontFamily = {
  regular: 'OpenSans-Regular',
  medium: 'OpenSans-Medium', 
  semiBold: 'OpenSans-Semibold',
  bold: 'OpenSans-Bold',
};

// Font sizes
const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
};

// Line heights (adjusting for Open Sans if needed, but starting with existing)
// Open Sans generally has good default leading, so existing values might be fine.
// Consider slight adjustments if text looks too cramped or too spaced out.
const lineHeight = {
  xs: 18, // ~1.5x fontSize
  sm: 21, // ~1.5x fontSize
  md: 24, // ~1.5x fontSize
  lg: 27, // ~1.5x fontSize
  xl: 30, // ~1.5x fontSize
  xxl: 36, // ~1.5x fontSize
  xxxl: 42, // ~1.5x fontSize
  huge: 48, // ~1.5x fontSize 
};

// Font weights (using valid React Native fontWeight values)
const fontWeight = {
  regular: "400" as const, // Corresponds to OpenSans-Regular
  medium: "500" as const,  // Corresponds to OpenSans-Medium
  semiBold: "600" as const,// Corresponds to OpenSans-Semibold
  bold: "700" as const,    // Corresponds to OpenSans-Bold
};

// Text styles
const typography: Record<string, TextStyle> = {
  // Headings
  title1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.huge,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.huge,
  },
  title2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xxxl, // Adjusted for better spacing with larger title
  },
  title3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.xxl, // Adjusted
  },
  
  // Body text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.lg,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.md,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.sm,
  },
  
  // UI elements
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.md,
  },
  caption: {
    fontFamily: fontFamily.regular, // Regular for better readability at small sizes
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular, // Changed from medium
    lineHeight: lineHeight.xs,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
  },
  
  // Special cases
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.xs,
  },
  pillText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular, // Changed from medium for consistency with bodySmall
    lineHeight: lineHeight.sm,
  },
};

// Localized text content
export type TextKey = 
  // Common UI elements
  | 'app_name'
  | 'confirm'
  | 'cancel'
  | 'save'
  | 'delete'
  | 'search'
  | 'tryAgain'
  | 'loading'
  // Settings screen
  | 'settings'
  | 'appearance'
  | 'preferences'
  | 'account'
  | 'language'
  | 'darkMode'
  | 'metrics'
  | 'notifications'
  | 'editProfile'
  | 'dietaryPreferences'
  | 'voiceCommands'
  | 'saveHistory'
  | 'clearData'
  | 'logOut'
  | 'restartOnboarding'
  | 'appVersion'
  // Error messages
  | 'errorTitle'
  | 'errorGeneric'
  | 'errorNetwork'
  | 'errorTimeout'
  | 'errorInvalidInput';

// Text content in different languages
const textContent: Record<Language, Record<TextKey, string>> = {
  en: {
    // Common UI elements
    app_name: 'ReciptAI',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    search: 'Search',
    tryAgain: 'Try Again',
    loading: 'Loading...',
    // Settings screen
    settings: 'Settings',
    appearance: 'Appearance',
    preferences: 'Preferences',
    account: 'Account',
    language: 'Language',
    darkMode: 'Dark Mode',
    metrics: 'Metric Units',
    notifications: 'Notifications',
    editProfile: 'Edit Profile',
    dietaryPreferences: 'Dietary Preferences',
    voiceCommands: 'Voice Commands',
    saveHistory: 'Save History',
    clearData: 'Clear App Data',
    logOut: 'Log Out',
    restartOnboarding: 'Restart Onboarding',
    appVersion: 'Version',
    // Error messages
    errorTitle: 'Something went wrong',
    errorGeneric: 'An error occurred. Please try again later.',
    errorNetwork: 'Network error. Please check your connection and try again.',
    errorTimeout: 'Request timed out. Please try again later.',
    errorInvalidInput: 'Invalid input. Please check your information and try again.'
  },
  ar: {
    // Common UI elements
    app_name: 'ريسبتاي',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    search: 'بحث',
    tryAgain: 'حاول مرة أخرى',
    loading: 'جاري التحميل...',
    // Settings screen
    settings: 'الإعدادات',
    appearance: 'المظهر',
    preferences: 'التفضيلات',
    account: 'الحساب',
    language: 'اللغة',
    darkMode: 'الوضع الداكن',
    metrics: 'نظام متري',
    notifications: 'الإشعارات',
    editProfile: 'تعديل الملف الشخصي',
    dietaryPreferences: 'التفضيلات الغذائية',
    voiceCommands: 'الأوامر الصوتية',
    saveHistory: 'حفظ السجل',
    clearData: 'مسح بيانات التطبيق',
    logOut: 'تسجيل الخروج',
    restartOnboarding: 'إعادة تشغيل التعريف',
    appVersion: 'الإصدار',
    // Error messages
    errorTitle: 'حدث خطأ ما',
    errorGeneric: 'حدث خطأ. يرجى المحاولة مرة أخرى لاحقًا.',
    errorNetwork: 'خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
    errorTimeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى لاحقًا.',
    errorInvalidInput: 'إدخال غير صالح. يرجى التحقق من المعلومات والمحاولة مرة أخرى.'
  }
};

// Helper function to get text based on current language
export const getText = (key: TextKey, language: Language = 'en'): string => {
  return textContent[language][key] || textContent.en[key] || key;
};

// RTL support for Arabic
export const isRTL = (language: Language): boolean => {
  return language === 'ar';
};

export default typography; 