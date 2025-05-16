import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Switch,
} from 'react-native';
import { Filter, ChevronDown, Check, X, Calendar, Tag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import colors from '@/constants/colors';

// Define filter types
type SortBy = 'newest' | 'oldest' | 'name' | 'rating';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export interface RecipeFilterOptions {
  sortBy: SortBy;
  dateFilter: DateFilter;
  tagsOnly: boolean;
  savedOnly: boolean;
  selectedTags: string[];
}

interface RecipeFilterProps {
  filterOptions: RecipeFilterOptions;
  onFilterChange: (options: RecipeFilterOptions) => void;
  allTags: string[]; // All available tags for selection
}

export default function RecipeFilter({
  filterOptions,
  onFilterChange,
  allTags,
}: RecipeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState<RecipeFilterOptions>(filterOptions);
  
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  const toggleFilterModal = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!isOpen) {
      // Reset local options to current filter options when opening
      setLocalOptions(filterOptions);
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOpen(false);
      });
    }
  };

  const handleApplyFilters = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onFilterChange(localOptions);
    toggleFilterModal();
  };

  const handleResetFilters = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const resetOptions: RecipeFilterOptions = {
      sortBy: 'newest',
      dateFilter: 'all',
      tagsOnly: false,
      savedOnly: false,
      selectedTags: [],
    };
    
    setLocalOptions(resetOptions);
    onFilterChange(resetOptions);
    toggleFilterModal();
  };

  const handleSortByChange = (value: SortBy) => {
    setLocalOptions(prev => ({ ...prev, sortBy: value }));
  };

  const handleDateFilterChange = (value: DateFilter) => {
    setLocalOptions(prev => ({ ...prev, dateFilter: value }));
  };

  const handleToggleTag = (tag: string) => {
    setLocalOptions(prev => {
      if (prev.selectedTags.includes(tag)) {
        return {
          ...prev,
          selectedTags: prev.selectedTags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          selectedTags: [...prev.selectedTags, tag]
        };
      }
    });
  };

  const handleToggleTagsOnly = (value: boolean) => {
    setLocalOptions(prev => ({ ...prev, tagsOnly: value }));
  };

  const handleToggleSavedOnly = (value: boolean) => {
    setLocalOptions(prev => ({ ...prev, savedOnly: value }));
  };

  const animatedStyle = {
    transform: [
      {
        scale: scaleAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
    opacity: opacityAnimation,
  };

  // Helper to render the active filter count
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filterOptions.sortBy !== 'newest') count++;
    if (filterOptions.dateFilter !== 'all') count++;
    if (filterOptions.tagsOnly) count++;
    if (filterOptions.savedOnly) count++;
    count += filterOptions.selectedTags.length;
    return count;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={toggleFilterModal}
        activeOpacity={0.8}
      >
        <Filter size={18} color={colors.text} />
        <Text style={styles.filterText}>Filter</Text>
        {getActiveFilterCount() > 0 && (
          <View style={styles.filterCountBadge}>
            <Text style={styles.filterCountText}>{getActiveFilterCount()}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleFilterModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleFilterModal}
        >
          <Animated.View 
            style={[styles.modalContainer, animatedStyle]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={(evt) => evt.stopPropagation()}
          >
            <BlurView intensity={Platform.OS === 'ios' ? 60 : 40} style={styles.blurView}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filter Recipes</Text>
                  <TouchableOpacity onPress={toggleFilterModal}>
                    <X size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.filterContent}>
                  {/* Sort By Section */}
                  <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Sort By</Text>
                    <View style={styles.optionList}>
                      {[
                        { value: 'newest', label: 'Newest First' },
                        { value: 'oldest', label: 'Oldest First' },
                        { value: 'name', label: 'Name (A-Z)' },
                        { value: 'rating', label: 'Rating' },
                      ].map(option => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.optionItem,
                            localOptions.sortBy === option.value && styles.selectedOption,
                          ]}
                          onPress={() => handleSortByChange(option.value as SortBy)}
                        >
                          <Text style={styles.optionText}>{option.label}</Text>
                          {localOptions.sortBy === option.value && (
                            <Check size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Date Filter Section */}
                  <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Date Added</Text>
                    <View style={styles.optionList}>
                      {[
                        { value: 'all', label: 'All Time' },
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'This Week' },
                        { value: 'month', label: 'This Month' },
                      ].map(option => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.optionItem,
                            localOptions.dateFilter === option.value && styles.selectedOption,
                          ]}
                          onPress={() => handleDateFilterChange(option.value as DateFilter)}
                        >
                          <Text style={styles.optionText}>{option.label}</Text>
                          {localOptions.dateFilter === option.value && (
                            <Check size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Toggle Options */}
                  <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Options</Text>
                    <View style={styles.toggleContainer}>
                      <Text style={styles.toggleText}>Only tagged recipes</Text>
                      <Switch
                        value={localOptions.tagsOnly}
                        onValueChange={handleToggleTagsOnly}
                        thumbColor={Platform.OS === 'ios' ? undefined : localOptions.tagsOnly ? colors.primary : colors.cardAlt}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        ios_backgroundColor={colors.border}
                      />
                    </View>
                    <View style={styles.toggleContainer}>
                      <Text style={styles.toggleText}>Only saved recipes</Text>
                      <Switch
                        value={localOptions.savedOnly}
                        onValueChange={handleToggleSavedOnly}
                        thumbColor={Platform.OS === 'ios' ? undefined : localOptions.savedOnly ? colors.primary : colors.cardAlt}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        ios_backgroundColor={colors.border}
                      />
                    </View>
                  </View>

                  {/* Tags Selection */}
                  {allTags.length > 0 && (
                    <View style={styles.filterSection}>
                      <Text style={styles.sectionTitle}>Tags</Text>
                      <View style={styles.tagsContainer}>
                        {allTags.map(tag => (
                          <TouchableOpacity
                            key={tag}
                            style={[
                              styles.tagItem,
                              localOptions.selectedTags.includes(tag) && styles.selectedTagItem,
                            ]}
                            onPress={() => handleToggleTag(tag)}
                          >
                            <Tag 
                              size={14} 
                              color={localOptions.selectedTags.includes(tag) ? 'white' : colors.text} 
                              style={styles.tagIcon} 
                            />
                            <Text 
                              style={[
                                styles.tagText,
                                localOptions.selectedTags.includes(tag) && styles.selectedTagText,
                              ]}
                            >
                              {tag}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleResetFilters}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApplyFilters}
                  >
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  filterCountBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  filterCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurView: {
    overflow: 'hidden',
    borderRadius: 16,
    flex: 1,
  },
  modalContent: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.96)',
    flex: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  filterContent: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionList: {
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 15,
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagItem: {
    backgroundColor: colors.primary,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedTagText: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 