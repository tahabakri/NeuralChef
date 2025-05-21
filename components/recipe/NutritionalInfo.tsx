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
  
  const rotateArrow = useSharedValue(0);
  const bounceTrigger = useSharedValue(0);
  
  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
    
    // Animate arrow with bounce
    rotateArrow.value = expanded ? 0 : 1;
    bounceTrigger.value += 1;
  };
  
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: withTiming(expanded ? 500 : 0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      opacity: withTiming(expanded ? 1 : 0, {
        duration: expanded ? 300 : 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    };
  });
  
  const arrowAnimatedStyle = useAnimatedStyle(() => {
    const rotation = withTiming(expanded ? 180 : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Add micro-bounce on expand/collapse
    const bounce = bounceTrigger.value === 0 ? 0 : 
      withSequence(
        withTiming(expanded ? 190 : 10, { duration: 100 }),
        withTiming(expanded ? 180 : 0, { duration: 100 })
      );
    
    return {
      transform: [{ rotateZ: `${expanded ? rotation : bounce}deg` }],
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
      
      {/* Always visible nutrition summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.nutritionItem}>
          <View style={[styles.pillBadge, styles.caloriesPill]}>
            <Text style={styles.nutritionValue}>{nutritionalInfo.calories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
        </View>
        
        <View style={styles.nutritionItem}>
          <View style={[styles.pillBadge, styles.proteinPill]}>
            <Text style={styles.nutritionValue}>{nutritionalInfo.protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
        </View>
        
        <View style={styles.nutritionItem}>
          <View style={[styles.pillBadge, styles.carbsPill]}>
            <Text style={styles.nutritionValue}>{nutritionalInfo.carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
        </View>
        
        <View style={styles.nutritionItem}>
          <View style={[styles.pillBadge, styles.fatPill]}>
            <Text style={styles.nutritionValue}>{nutritionalInfo.fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
      </View>
      
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
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  pillBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 70,
  },
  caloriesPill: {
    backgroundColor: colors.accentGreenLight,
  },
  proteinPill: {
    backgroundColor: colors.accentBlueLight,
  },
  carbsPill: {
    backgroundColor: colors.accentYellowLight,
  },
  fatPill: {
    backgroundColor: colors.accentOrangeLight,
  },
  nutritionLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nutritionValue: {
    ...typography.bodyLarge,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
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
    color: colors.textSecondary,
    paddingLeft: 16,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontFamily: 'Poppins-Medium',
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
    color: colors.textSecondary,
    marginBottom: 12,
  },
});

export default NutritionalInfo; 