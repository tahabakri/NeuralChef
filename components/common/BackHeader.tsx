import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '@/constants/colors'; // Assuming you have a colors constant
import typography from '@/constants/typography'; // Assuming you have a typography constant

interface BackHeaderProps {
  title: string;
  onBackPress?: () => void;
}

const BackHeader: React.FC<BackHeaderProps> = ({ title, onBackPress }) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Ionicons 
          name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} 
          size={28} 
          color={Colors.primary} // Adjust color as needed
        />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.placeholder} /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background, // Or your header background color
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // Or your border color
    height: Platform.OS === 'ios' ? 100 : 60, // Adjust height for iOS status bar
    paddingTop: Platform.OS === 'ios' ? 50 : 12, // Adjust padding for iOS status bar
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // To align icon visually
  },
  title: {
    ...(typography.h2 || typography.title2), // Use your typography style for header title
    color: Colors.text, // Adjust text color as needed
    textAlign: 'center',
    flex: 1,
  },
  placeholder: { // To balance the title in the center when back button is present
    width: 44, // Approximately the width of the back button including padding
  }
});

export default BackHeader;
