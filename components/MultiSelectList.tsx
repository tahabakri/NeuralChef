import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectListProps {
  options: Option[];
  selectedIds: string[];
  onToggleOption: (id: string) => void;
}

const MultiSelectList = ({ 
  options, 
  selectedIds, 
  onToggleOption 
}: MultiSelectListProps) => {
  
  const handleToggle = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleOption(id);
  };
  
  return (
    <FlatList
      data={options}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleToggle(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.label}>{item.label}</Text>
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>
        );
      }}
      style={styles.list}
      contentContainerStyle={styles.content}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    maxHeight: 200,
  },
  content: {
    paddingTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default MultiSelectList; 