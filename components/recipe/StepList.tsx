import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import TimerButton from './TimerButton';

interface Step {
  description: string;
  time?: number; // Time in minutes
}

interface StepListProps {
  steps: Step[];
  completedSteps: number[];
  onToggleStep: (index: number) => void;
}

const StepList = ({ steps, completedSteps, onToggleStep }: StepListProps) => {
  if (!steps || steps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No instructions available</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        
        return (
          <View 
            key={`step-${index}`} 
            style={[
              styles.stepItem,
              index === steps.length - 1 && styles.lastStepItem
            ]}
          >
            <View style={styles.stepHeader}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  isCompleted && styles.checkboxChecked
                ]}
                onPress={() => onToggleStep(index)}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                )}
              </TouchableOpacity>
              
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>Step {index + 1}</Text>
              </View>
              
              {step.time && step.time > 0 && (
                <TimerButton minutes={step.time} />
              )}
            </View>
            
            <Text style={[
              styles.stepDescription,
              isCompleted && styles.completedDescription
            ]}>
              {step.description}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  stepItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  lastStepItem: {
    borderBottomWidth: 0,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumberContainer: {
    flex: 1,
  },
  stepNumber: {
    ...typography.subtitle,
    color: colors.text,
  },
  stepDescription: {
    ...typography.bodyMedium,
    color: colors.text,
    lineHeight: 22,
    paddingLeft: 36, // To align with checkbox and step number
  },
  completedDescription: {
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});

export default StepList; 