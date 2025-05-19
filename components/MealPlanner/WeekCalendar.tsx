import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import colors from '@/constants/colors';
import { WeekCalendarProps } from './types';

export default function WeekCalendar({ dates, selectedDate, onSelectDate }: WeekCalendarProps) {
  const renderDateItem = (date: string) => {
    const parsedDate = parseISO(date);
    const isSelected = date === selectedDate;
    const isToday = format(new Date(), 'yyyy-MM-dd') === date;

    return (
      <TouchableOpacity
        key={date}
        style={[
          styles.dateItem,
          isSelected && styles.selectedDateItem,
          isToday && styles.todayDateItem,
        ]}
        onPress={() => onSelectDate(date)}
      >
        <Text style={[
          styles.dayText,
          isSelected && styles.selectedText,
          isToday && !isSelected && styles.todayText
        ]}>
          {format(parsedDate, 'EEE')}
        </Text>
        <Text style={[
          styles.dateText,
          isSelected && styles.selectedText,
          isToday && !isSelected && styles.todayText
        ]}>
          {format(parsedDate, 'd')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {dates.map(renderDateItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardAlt,
    paddingVertical: 12,
  },
  datesContainer: {
    paddingHorizontal: 16,
  },
  dateItem: {
    width: 54,
    height: 70,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectedDateItem: {
    backgroundColor: colors.primary,
  },
  todayDateItem: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedText: {
    color: colors.white,
  },
  todayText: {
    color: colors.primary,
  },
});
