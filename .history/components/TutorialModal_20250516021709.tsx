import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Info, ChefHat, BookOpen, Star, Clock } from 'lucide-react-native';

import colors from '@/constants/colors';
import Button from './Button';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
  onStartDemo?: () => void;
}

const TutorialModal = ({ 
  visible, 
  onClose,
  onStartDemo 
}: TutorialModalProps) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, isSmallScreen && styles.smallContainer]}>
          <LinearGradient
            colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            accessibilityLabel="Close tutorial"
          >
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Info size={28} color={colors.primary} style={styles.headerIcon} />
            <Text style={styles.title}>How to Use ReciptAI</Text>
            <Text style={styles.subtitle}>Get started with these quick tips</Text>
          </View>
          
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <TutorialItem 
              title="Create Recipes" 
              description="Add ingredients or describe what you'd like to cook in the Create tab. Our AI will generate a custom recipe for you."
              icon={<ChefHat size={24} color={colors.primary} />}
            />
            
            <TutorialItem 
              title="Save Your Favorites" 
              description="Love a recipe? Save it to your collection for easy access later, even when you're offline."
              icon={<Star size={24} color={colors.accentYellow} />}
            />
            
            <TutorialItem 
              title="Browse Recipe Library" 
              description="Browse through your saved recipes in the Library tab. Filter by categories or search for specific dishes."
              icon={<BookOpen size={24} color={colors.secondary} />}
            />
            
            <TutorialItem 
              title="Track Cooking Time" 
              description="Each recipe includes prep and cook times to help you plan your meals more efficiently."
              icon={<Clock size={24} color={colors.accentBlue} />}
            />
          </ScrollView>
          
          <View style={styles.footer}>
            <Button 
              title="Got It" 
              onPress={onClose} 
              variant="primary"
              style={styles.button}
            />
            
            {onStartDemo && (
              <Button 
                title="Try a Demo Recipe" 
                onPress={onStartDemo} 
                variant="outline"
                style={[styles.button, styles.secondaryButton]}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface TutorialItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TutorialItem = ({ title, description, icon }: TutorialItemProps) => (
  <View style={styles.itemContainer}>
    <View style={styles.iconContainer}>
      {icon}
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  smallContainer: {
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollContainer: {
    maxHeight: '70%',
  },
  contentContainer: {
    padding: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  button: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 0,
  },
});

export default TutorialModal; 