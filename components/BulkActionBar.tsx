import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BulkActionBarProps {
  visible: boolean;
  selectedCount: number;
  onCancel: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  visible,
  selectedCount,
  onCancel,
  onDelete,
  onShare,
}) => {
  const insets = useSafeAreaInsets();
  
  // If not visible, don't render anything
  if (!visible) return null;

  const handleButtonPress = (action: () => void) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    action();
  };

  return (
    <View 
      style={[
        styles.container, 
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => handleButtonPress(onCancel)}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.selectionText}>
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleButtonPress(onShare)}
          >
            <Ionicons name="share-social-outline" size={22} color={colors.white} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleButtonPress(onDelete)}
          >
            <Ionicons name="trash-outline" size={22} color={colors.white} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default BulkActionBar; 