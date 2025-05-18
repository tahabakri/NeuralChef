import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Recipe Notifications Service
 * Handles timer notifications for recipe steps
 */
class RecipeNotificationsService {
  private initialized = false;
  private enabled = true;

  /**
   * Initialize notifications permissions and settings
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return this.enabled;

    try {
      // Check if notifications are enabled in user preferences
      const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
      this.enabled = notificationsEnabled !== 'false';

      // Skip setup if notifications are disabled or running on web
      if (!this.enabled || Platform.OS === 'web') {
        this.initialized = true;
        return false;
      }

      // Configure notifications
      await this.configureNotifications();

      // Request permissions
      const { status } = await this.requestPermissions();
      this.enabled = status === 'granted';
      this.initialized = true;
      
      return this.enabled;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      this.initialized = true;
      this.enabled = false;
      return false;
    }
  }

  /**
   * Configure notification appearance and behavior
   */
  private async configureNotifications(): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    if (Platform.OS === 'web') {
      return { status: 'denied' } as Notifications.NotificationPermissionsStatus;
    }

    if (Device.isDevice) {
      return await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
    } else {
      // Emulator/simulator notifications might not work properly
      return { status: 'granted' } as Notifications.NotificationPermissionsStatus;
    }
  }

  /**
   * Set the enabled state for notifications
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;
    await AsyncStorage.setItem('notificationsEnabled', enabled.toString());
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Schedule a timer notification for a recipe step
   * @param stepIndex The step index (1-based for user display)
   * @param stepTitle The step title or short description
   * @param durationMinutes Duration in minutes
   * @returns The notification identifier if scheduled, null otherwise
   */
  async scheduleTimerNotification(
    stepIndex: number,
    stepTitle: string,
    durationMinutes: number
  ): Promise<string | null> {
    if (!this.enabled || !durationMinutes) return null;
    
    try {
      // Initialize if not already done
      if (!this.initialized) {
        const enabled = await this.initialize();
        if (!enabled) return null;
      }
      
      // Convert minutes to seconds
      const seconds = durationMinutes * 60;
      
      // Set trigger for future time
      const trigger = new Date(Date.now() + seconds * 1000);
      
      // Schedule notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Timer Complete! 🍲',
          body: `Step ${stepIndex}: ${stepTitle} is ready after ${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}!`,
          sound: true,
          data: {
            type: 'timer',
            stepIndex,
          },
        },
        trigger,
      });
      
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule timer notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   * @param notificationId The notification ID to cancel
   */
  async cancelTimerNotification(notificationId: string): Promise<void> {
    if (!notificationId) return;
    
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }
  
  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }
}

// Export as singleton
export const recipeNotifications = new RecipeNotificationsService(); 