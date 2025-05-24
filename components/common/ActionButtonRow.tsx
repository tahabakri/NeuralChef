import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface ActionButtonRowProps {
  onAutoPlanPress: () => void;
  onGroceryListPress: () => void;
  // Future props for loading states can be added here
  // isLoadingAutoPlan?: boolean;
  // isLoadingGroceryList?: boolean;
}

const ActionButtonRow: React.FC<ActionButtonRowProps> = ({
  onAutoPlanPress,
  onGroceryListPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomButtonsContainer,
        { paddingBottom: Platform.OS === 'ios' ? spacing.lg + insets.bottom : spacing.lg },
      ]}
    >
      <TouchableOpacity
        style={styles.autoPlanButton}
        onPress={onAutoPlanPress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[colors.orangeAccentStart, colors.primaryLight]} // Sunrise Orange -> Soft Peach
          style={styles.autoPlanGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles-outline" size={20} color={colors.white} />
          <Text style={styles.autoPlanButtonText}>Auto-Plan My Week</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.groceryListButton}
        onPress={onGroceryListPress}
        activeOpacity={0.7}
      >
        <Ionicons name="list-outline" size={20} color={colors.accentOrange} />
        <Text style={styles.groceryListButtonText}>Today's Grocery List</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    gap: spacing.md,
  },
  autoPlanButton: {
    flex: 1,
    borderRadius: spacing.borderRadius.pill,
    overflow: 'hidden',
  },
  autoPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  autoPlanButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  groceryListButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.accentOrange,
    backgroundColor: colors.white,
  },
  groceryListButtonText: {
    ...typography.button,
    color: colors.accentOrange,
    marginLeft: spacing.sm,
  },
});

export default ActionButtonRow;
