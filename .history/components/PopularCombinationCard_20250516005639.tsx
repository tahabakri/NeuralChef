import React from 'react';
import {
  TouchableOpacity,
  ImageBackground,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { popularCombinations } from '../constants/ingredients'; // Assuming this path is correct

// Get the type for a single combination item
type Combination = typeof popularCombinations[0];

interface PopularCombinationCardProps {
  item: Combination;
  onPress: () => void;
  style?: any; // Or more specific style prop
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7; // Consistent with TabOneScreen

const PopularCombinationCard: React.FC<PopularCombinationCardProps> = ({ item, onPress, style }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(); // Call the original onPress handler
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={styles.combinationCard}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.cardImage}
          imageStyle={{ borderRadius: 12 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>
                {item.ingredients.slice(0, 3).join(', ')}
                {item.ingredients.length > 3 ? '...' : ''}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  combinationCard: {
    width: cardWidth,
    height: 180,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 15,
    justifyContent: 'flex-end',
  },
  cardContent: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
});

export default PopularCombinationCard; 