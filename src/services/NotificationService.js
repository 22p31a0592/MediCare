/**
 * Enhanced Notification Service with Persistent Alarms
 * Fixes: Alarms continue working even when app is closed
 */

import notifee, { 
  TriggerType, 
  RepeatFrequency,
  AndroidImportance,
  EventType,
  AuthorizationStatus 
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundFetch from 'react-native-background-fetch';

class NotificationService {
  constructor() {
    this.channelId = 'medication-reminders';
    this.isInitialized = false;
    this.onPillTakenCallback = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔔 Initializing Notification Service...');
      
      // Request permissions
      await this.requestPermissions();
      
      // Create channel
      await this.createChannel();
      
      // Setup handlers
      this.setupHandlers();
      
      // Setup background fetch for alarm persistence
      await this.setupBackgroundFetch();
      
      this.isInitialized = true;
      console.log('✅ Notification Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  }

  async setupBackgroundFetch() {
    try {
      await BackgroundFetch.configure({
        minimumFetchInterval: 15, // 15 minutes
        stopOnTerminate: false, // Keep running even after app is closed
        startOnBoot: true, // Start on device boot
        enableHeadless: true, // Enable headless mode
      }, async (taskId) => {
        console.log('[BackgroundFetch] Task:', taskId);
        
        // Re-check and reschedule alarms if needed
        await this.ensureAlarmsScheduled();
        
        BackgroundFetch.finish(taskId);
      }, (error) => {
        console.error('[BackgroundFetch] Failed to start:', error);
      });

      console.log('✅ Background fetch configured');
    } catch (error) {
      console.error('❌ Background fetch setup failed:', error);
    }
  }

  async ensureAlarmsScheduled() {
    try {
      const pillsData = await AsyncStorage.getItem('meditrack_pills');
      const pills = pillsData ? JSON.parse(pillsData) : [];
      
      const scheduled = await notifee.getTriggerNotifications();
      const scheduledIds = scheduled.map(n => n.notification.id);
      
      for (const pill of pills) {
        if (pill.alarmEnabled && !scheduledIds.includes(pill._id)) {
          console.log(`📅 Re-scheduling alarm for ${pill.name}`);
          await this.scheduleMedicationReminder(pill);
        }
      }
    } catch (error) {
      console.error('Error ensuring alarms:', error);
    }
  }

  setOnPillTakenCallback(callback) {
    this.onPillTakenCallback = callback;
  }

  async requestPermissions() {
    try {
      const settings = await notifee.requestPermission();
      
      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('✅ Notification permissions granted');
        
        // Also request exact alarm permission on Android 12+
        if (Platform.OS === 'android' && Platform.Version >= 31) {
          await notifee.requestExactAlarmPermission();
        }
        
        return true;
      } else {
        console.log('❌ Notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async createChannel() {
    try {
      await notifee.createChannel({
        id: this.channelId,
        name: 'Medication Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500],
        bypassDnd: true, // Bypass Do Not Disturb
      });
      console.log('✅ Notification channel created');
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }

  setupHandlers() {
    // Foreground event handler
    notifee.onForegroundEvent(async ({ type, detail }) => {
      console.log('Foreground notification event:', type);
      
      if (type === EventType.PRESS) {
        console.log('User pressed notification');
      }
      
      if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'taken') {
        console.log('User marked as taken from notification');
        const pillData = detail.notification?.data;
        if (pillData && pillData.pillId) {
          // Call the callback if set
          if (this.onPillTakenCallback) {
            await this.onPillTakenCallback(pillData.pillId);
          }
          await notifee.cancelNotification(detail.notification?.id);
        }
      }
      
      if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'snooze') {
        console.log('User pressed snooze');
        const pillData = detail.notification?.data;
        if (pillData && pillData.pill) {
          try {
            const pill = JSON.parse(pillData.pill);
            await this.snoozeReminder(pill);
          } catch (e) {
            console.error('Error parsing pill data:', e);
          }
        }
      }
    });

    // Background event handler
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('Background notification event:', type);
      
      if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'taken') {
        const pillData = detail.notification?.data;
        if (pillData && pillData.pillId) {
          // Mark as taken in storage directly
          await this.markPillTakenInStorage(pillData.pillId);
          await notifee.cancelNotification(detail.notification?.id);
        }
      }
      
      if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'snooze') {
        const pillData = detail.notification?.data;
        if (pillData && pillData.pill) {
          try {
            const pill = JSON.parse(pillData.pill);
            await this.snoozeReminder(pill);
          } catch (e) {
            console.error('Error parsing pill data:', e);
          }
        }
      }
    });
  }

  async markPillTakenInStorage(pillId) {
    try {
      const pillsData = await AsyncStorage.getItem('meditrack_pills');
      const pills = pillsData ? JSON.parse(pillsData) : [];
      
      const updatedPills = pills.map(p => {
        if (p._id === pillId) {
          return {
            ...p,
            lastTaken: new Date().toISOString(),
            daysCompleted: (p.daysCompleted || 0) + 1
          };
        }
        return p;
      });
      
      await AsyncStorage.setItem('meditrack_pills', JSON.stringify(updatedPills));
      console.log('✅ Pill marked as taken in storage');
    } catch (error) {
      console.error('Error marking pill as taken:', error);
    }
  }

  async scheduleMedicationReminder(pill) {
    if (!pill.alarmEnabled || !pill.alarmTime) {
      console.log('⚠️ Alarm not enabled for this pill');
      return false;
    }

    try {
      await this.initialize();
      
      console.log(`📅 Scheduling reminder for ${pill.name} at ${pill.alarmTime}`);
      
      // Parse the time
      const timeMatch = pill.alarmTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) {
        console.error('❌ Invalid time format:', pill.alarmTime);
        return false;
      }

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      // Create notification time (10 minutes before alarm)
      const now = new Date();
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes - 10, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      console.log(`⏰ Will notify at: ${notificationTime.toLocaleString()}`);

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: notificationTime.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: {
          allowWhileIdle: true, // Critical for alarm functionality
        },
      };

      await notifee.createTriggerNotification(
        {
          id: pill._id,
          title: '💊 Medication Reminder',
          body: `Time to take ${pill.name} (${pill.dosage}) in 10 minutes`,
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_notification',
            color: '#3b82f6',
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: '✅ Taken',
                pressAction: { id: 'taken' },
              },
              {
                title: '⏰ Snooze 5 min',
                pressAction: { id: 'snooze' },
              },
            ],
            sound: 'default',
            vibrationPattern: [300, 500],
            showTimestamp: true,
            autoCancel: false, // Don't auto-cancel
            ongoing: false,
            category: 'alarm',
          },
          ios: {
            sound: 'default',
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
            categoryId: 'medication-alarm',
          },
          data: {
            pill: JSON.stringify(pill),
            pillId: pill._id,
          },
        },
        trigger
      );

      console.log(`✅ Reminder scheduled successfully for ${pill.name}`);
      return true;
    } catch (error) {
      console.error('❌ Error scheduling reminder:', error);
      return false;
    }
  }

  async snoozeReminder(pill) {
    try {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);

      console.log(`⏰ Snoozing reminder for ${pill.name} until ${snoozeTime.toLocaleTimeString()}`);

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: snoozeTime.getTime(),
        alarmManager: {
          allowWhileIdle: true,
        },
      };

      await notifee.createTriggerNotification(
        {
          id: `${pill._id}-snooze`,
          title: '⏰ Snoozed Reminder',
          body: `Don't forget to take ${pill.name} (${pill.dosage})`,
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_notification',
            color: '#f59e0b',
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: '✅ Taken',
                pressAction: { id: 'taken' },
              },
            ],
            sound: 'default',
            vibrationPattern: [300, 500],
            autoCancel: false,
            category: 'alarm',
          },
          ios: {
            sound: 'default',
            categoryId: 'medication-alarm',
          },
          data: {
            pill: JSON.stringify(pill),
            pillId: pill._id,
            isSnooze: 'true',
          },
        },
        trigger
      );

      console.log('✅ Snoozed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error snoozing reminder:', error);
      return false;
    }
  }

  async cancelReminder(pillId) {
    try {
      await notifee.cancelNotification(pillId);
      await notifee.cancelNotification(`${pillId}-snooze`);
      console.log(`✅ Cancelled reminders for: ${pillId}`);
      return true;
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      return false;
    }
  }

  async cancelAllReminders() {
    try {
      await notifee.cancelAllNotifications();
      console.log('✅ Cancelled all reminders');
      return true;
    } catch (error) {
      console.error('Error cancelling all reminders:', error);
      return false;
    }
  }

  async getTriggerNotifications() {
    try {
      const notifications = await notifee.getTriggerNotifications();
      console.log(`📋 Scheduled notifications: ${notifications.length}`);
      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async checkPermissions() {
    try {
      const settings = await notifee.getNotificationSettings();
      const granted = settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
      console.log(`🔔 Permissions granted: ${granted}`);
      return granted;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }
}

export default new NotificationService();