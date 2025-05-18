import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
import colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  title: string;
  image?: string;
  calories?: string;
  time?: string;
  rating?: number;
  onPress?: () => void;
  style?: ViewStyle;
  featured?: boolean;
}

export default function Card({
  title,
  image,
  calories,
  time,
  rating,
  onPress,
  style,
  featured = false
}: CardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, featured && styles.featuredContainer, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={
          image
            ? { uri: image }
            : require('@/assets/images/empty-plate.png')
        }
        style={featured ? styles.featuredImage : styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.overlay}>
        {calories && (
          <View style={styles.calorieBadge}>
            <Text style={styles.calorieText}>{calories}</Text>
          </View>
        )}
      
        {time && (
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={12} color={colors.white} />
            <Text style={styles.timeText}>{time}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={featured ? styles.featuredTitle : styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        {rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={colors.secondary} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 15,
  },
  featuredContainer: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 120,
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  overlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calorieText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  timeBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  contentContainer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  featuredTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.secondary,
    marginLeft: 4,
  },
});