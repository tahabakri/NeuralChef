import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/stores/userStore';

export interface GreetingHeaderProps {
  onGetStartedPress?: () => void;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ onGetStartedPress }) => {
  const [greeting, setGreeting] = useState('Good morning');
  const { user } = useUserStore();
  const userName = user?.name ? user.name.split(' ')[0] : '';

  useEffect(() => {
    // Set greeting based on time of day
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {greeting}{userName ? `, ${userName}` : ''}!
      </Text>
      <Text style={styles.subtitle}>
        What would you like to cook today?
      </Text>
      <Text style={styles.dateText}>
        {formattedDate}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  greeting: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

export default GreetingHeader; 