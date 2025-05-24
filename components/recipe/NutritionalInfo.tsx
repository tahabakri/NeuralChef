import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface NutritionalValue {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  [key: string]: number; // For additional nutrition facts
}

interface NutritionalInfoProps {
  nutritionalInfo: NutritionalValue;
}

const NutritionalInfo = ({ nutritionalInfo }: NutritionalInfoProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const arrowRotation = useSharedValue(0); // Stores the rotation value in degrees
  const contentHeight = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);

    if (newExpandedState) { // Expanding
      arrowRotation.value = withSequence(
        withTiming(190, { duration: 120, easing: Easing.out(Easing.ease) }),
        withTiming(180, { duration: 120, easing: Easing.inOut(Easing.ease) })
      );
      contentHeight.value = withTiming(500, { // Approximate max height
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      contentOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else { // Collapsing
      arrowRotation.value = withSequence(
        withTiming(-10, { duration: 120, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 120, easing: Easing.inOut(Easing.ease) })
      );
      contentHeight.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      contentOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  };

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: contentHeight.value,
      opacity: contentOpacity.value,
      marginTop: contentOpacity.value > 0 ? spacing.md : 0, // Apply margin only when visible
    };
  });

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      // Ensure rotateZ receives a string like '180deg'.
      // arrowRotation.value should be a number here.
      transform: [{ rotateZ: `${arrowRotation.value}deg` }],
    };
  });

  // Get all nutrition keys except the main ones that we display separately
  const additionalNutrition = Object.keys(nutritionalInfo)
    .filter(key => !['calories', 'protein', 'carbs', 'fat'].includes(key));
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Nutritional Information</Text>
        <Animated.View style={arrowAnimatedStyle}>
          <Ionicons
            name="chevron-down"
            size={24}
            color={colors.textSecondary}
          />
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View style={[styles.expandedContent, contentAnimatedStyle]}>
        <View style={styles.statBlocksContainer}>
          {/* Calories Pill */}
          <View style={[styles.statBlock, {backgroundColor: colors.backgroundAlt }]}>
            <Text style={styles.statValue}>{nutritionalInfo.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          
          {/* Protein Pill */}
          <View style={[styles.statBlock, {backgroundColor: colors.accentBlueLight}]}>
            <Text style={styles.statValue}>{nutritionalInfo.protein}g</Text>
            <Text style={styles.statLabel}>Protein</Text>
          </View>
        </View>
        <View style={styles.statBlocksContainer}>
          {/* Carbs Pill */}
          <View style={[styles.statBlock, {backgroundColor: colors.accentOrangeLight}]}>
            <Text style={styles.statValue}>{nutritionalInfo.carbs}g</Text>
            <Text style={styles.statLabel}>Carbs</Text>
          </View>
          
          {/* Fat Pill */}
          <View style={[styles.statBlock, {backgroundColor: colors.errorLight}]}>
            <Text style={styles.statValue}>{nutritionalInfo.fat}g</Text>
            <Text style={styles.statLabel}>Fat</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Expandable detailed nutrition */}
      <Animated.View style={[styles.detailsContainer, contentAnimatedStyle]}>
        <View style={styles.divider} />
        
        {additionalNutrition.map((key, index) => (
          <View 
            key={key} 
            style={[
              styles.detailItem,
              index % 2 === 1 && styles.alternateDetailRow
            ]}
          >
            <Text style={styles.detailLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </Text>
            <Text style={styles.detailValue}>
              {nutritionalInfo[key]}
              {typeof nutritionalInfo[key] === 'number' ? 'g' : ''}
            </Text>
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => setShowDisclaimerModal(true)}
        >
          <Ionicons name="information-circle-outline" size={18} color={colors.infoLight} />
          <Text style={styles.infoButtonText}>Nutrition Info</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Disclaimer Modal */}
      <Modal
        transparent
        visible={showDisclaimerModal}
        animationType="fade"
        onRequestClose={() => setShowDisclaimerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nutritional Information</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDisclaimerModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.disclaimerText}>
                * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
              </Text>
              <Text style={styles.disclaimerText}>
                Nutritional information is estimated and may vary based on preparation method, serving size, ingredient substitutions, and more.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.subtitle1,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  expandedContent: {
    // marginTop will be handled by animated style
  },
  statBlocksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md, // Add margin between rows of pills
  },
  statBlock: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.pill, // Use pill shape for stat blocks
    minWidth: 100, // Ensure pills have some minimum width
    marginHorizontal: spacing.xs, // Add small horizontal margin between pills
  },
  statValue: {
    ...typography.bodyLarge,
    fontFamily: 'OpenSans-Bold',
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    fontFamily: 'OpenSans-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsContainer: {
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  alternateDetailRow: {
    backgroundColor: colors.backgroundAlt,
  },
  detailLabel: {
    ...typography.bodyMedium,
    fontFamily: 'OpenSans-Regular', // Ensure OpenSans for body text
    color: colors.textSecondary,
    paddingLeft: 16,
  },
  detailValue: {
    ...typography.bodyMedium,
    fontFamily: 'OpenSans-SemiBold', // Ensure OpenSans for body text
    color: colors.text,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  infoButtonText: {
    ...typography.bodySmall,
    fontFamily: 'OpenSans-Regular', // Ensure OpenSans for body text
    color: colors.info,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '90%',
    maxWidth: 320,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    padding: 16,
  },
  modalTitle: {
    ...typography.heading3,
    fontFamily: 'Poppins-SemiBold', // Ensure Poppins for heading
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  disclaimerText: {
    ...typography.bodyMedium,
    fontFamily: 'OpenSans-Regular', // Ensure OpenSans for body text
    color: colors.textSecondary,
    marginBottom: 12,
  },
});

export default NutritionalInfo;
