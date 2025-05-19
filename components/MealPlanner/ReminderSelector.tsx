import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { ReminderSelectorProps } from './types';

const REMINDER_OPTIONS = [
  { label: '15 minutes before', value: '15' },
  { label: '30 minutes before', value: '30' },
  { label: '1 hour before', value: '60' },
  { label: '2 hours before', value: '120' },
  { label: '1 day before', value: '1440' },
];

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner'
};

export default function ReminderSelector({ visible, onClose, onSetReminder, mealType }: ReminderSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string>('30');

  const handleConfirm = () => {
    onSetReminder(selectedOption);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Set Reminder</Text>
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.description}>
            When would you like to be reminded about {MEAL_TYPE_LABELS[mealType].toLowerCase()}?
          </Text>

          <View style={styles.optionsContainer}>
            {REMINDER_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  selectedOption === option.value && styles.selectedOption
                ]}
                onPress={() => setSelectedOption(option.value)}
              >
                <View style={styles.optionLeft}>
                  <View style={[
                    styles.radioButton,
                    selectedOption === option.value && styles.radioButtonSelected
                  ]}>
                    {selectedOption === option.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    selectedOption === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                </View>
                <Ionicons 
                  name="notifications-outline" 
                  size={20} 
                  color={selectedOption === option.value ? colors.primary : colors.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
  },
  confirmButton: {
    padding: 8,
  },
  confirmText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.text,
    marginBottom: 24,
  },
  optionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  selectedOption: {
    backgroundColor: colors.cardAlt,
  },
  selectedOptionText: {
    color: colors.text,
    fontWeight: '600',
  },
});
