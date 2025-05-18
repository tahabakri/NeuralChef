import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';

interface DeleteActionProps {
  dragX: Animated.AnimatedInterpolation<string | number>;
  onPress: () => void;
  enabled?: boolean;
}

export default function DeleteAction({
  dragX,
  onPress,
  enabled = true,
}: DeleteActionProps) {
  // Calculate animation values from the drag position
  const scale = dragX.interpolate({
    inputRange: [-80, -50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const opacity = dragX.interpolate({
    inputRange: [-80, -50],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.actionButton,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onPress}
          disabled={!enabled}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins-Medium',
  },
}); 