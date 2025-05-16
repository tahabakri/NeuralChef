import React from "react";
import { Tabs } from "expo-router";
import { View, Platform, Dimensions } from "react-native";
import { Home, BookOpen, History, Settings, Bookmark } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useRecipeStore } from "@/stores/recipeStore";

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : 64;
const TAB_ICON_SIZE = 24;

// Badge component for notifications
function NotificationBadge() {
  const hasNewRecipe = useRecipeStore(state => state.hasNewRecipe);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  
  React.useEffect(() => {
    if (hasNewRecipe) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [hasNewRecipe]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }]
    };
  });
  
  if (!hasNewRecipe) return null;
  
  return (
    <Animated.View 
      style={[{
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: colors.error,
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'white',
        zIndex: 10,
      }, animatedStyle]}
    />
  );
}

// Tab Icon Component with animations
function TabIcon({ 
  icon: Icon, 
  focused, 
  color,
  showBadge = false,
  accessibilityLabel
}: { 
  icon: typeof Home,
  focused: boolean, 
  color: string,
  showBadge?: boolean,
  accessibilityLabel: string
}) {
  // More efficient animation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ 
        scale: withTiming(focused ? 1.1 : 1, {
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        })
      }],
      opacity: withTiming(focused ? 1 : 0.7, { 
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      })
    };
  }, [focused]);
  
  return (
    <Animated.View 
      style={[
        { 
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          height: TAB_ICON_SIZE,
          width: TAB_ICON_SIZE,
        }, 
        animatedStyle
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      <Icon size={TAB_ICON_SIZE} color={color} />
      {showBadge && <NotificationBadge />}
    </Animated.View>
  );
}

// Active tab indicator
function ActiveIndicator({ focused }: { focused: boolean }) {
  const width = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  React.useEffect(() => {
    if (focused) {
      width.value = withTiming(24, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      width.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [focused]);
  
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      opacity: opacity.value
    };
  });
  
  return (
    <Animated.View
      style={[
        {
          height: 3,
          backgroundColor: colors.primary,
          borderRadius: 1.5,
          marginTop: 4,
        },
        indicatorStyle
      ]}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        // Get labels for accessibility
        const getAccessibilityLabel = () => {
          switch (route.name) {
            case 'index': return 'Home';
            case 'saved': return 'Saved Recipes';
            case 'history': return 'Recipe History';
            case 'settings': return 'Settings';
            default: return route.name;
          }
        };
        
        // Get visible tab label
        const getTabLabel = () => {
          switch (route.name) {
            case 'index': return 'Home';
            case 'saved': return 'Saved';
            case 'history': return 'History';
            case 'settings': return 'Settings';
            default: return '';
          }
        };
        
        return {
          // Tab bar styling
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          headerShown: false,
          tabBarLabel: getTabLabel(),
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: TAB_BAR_HEIGHT,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 12,
          },
          tabBarItemStyle: {
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={[colors.white, colors.backgroundAlt]}
              style={{ 
                flex: 1,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
              }}
            />
          ),
          tabBarLabelStyle: {
            ...typography.caption,
            fontWeight: '500',
            fontSize: 12,
            marginTop: 4,
          },
        };
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabIcon 
                icon={Home} 
                focused={focused} 
                color={color}
                accessibilityLabel="Home tab"
              />
              <ActiveIndicator focused={focused} />
            </View>
          ),
        }}
      />
      
      {/* Saved Tab */}
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabIcon 
                icon={Bookmark} 
                focused={focused} 
                color={color}
                accessibilityLabel="Saved recipes tab"
              />
              <ActiveIndicator focused={focused} />
            </View>
          ),
        }}
      />
      
      {/* History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabIcon 
                icon={History} 
                focused={focused} 
                color={color}
                accessibilityLabel="Recipe history tab"
              />
              <ActiveIndicator focused={focused} />
            </View>
          ),
        }}
      />
      
      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <TabIcon 
                icon={Settings} 
                focused={focused} 
                color={color}
                accessibilityLabel="Settings tab"
              />
              <ActiveIndicator focused={focused} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}