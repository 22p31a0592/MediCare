/**
 * services/NotificationService/handlers/backgroundFetch.js
 *
 * FIX: was importing scheduleReminder which no longer exists.
 * Now only calls scheduleRealAlarm, and checks all slot IDs.
 */

import BackgroundFetch from 'react-native-background-fetch';
import notifee         from '@notifee/react-native';
import { loadPillsFromStorage } from '../helpers/storageHelpers';
import { scheduleRealAlarm }    from './scheduleAlarm';

export async function setupBackgroundFetch() {
  try {
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        stopOnTerminate:      false,
        startOnBoot:          true,
        enableHeadless:       true,
        requiredNetworkType:  BackgroundFetch.NETWORK_TYPE_NONE,
      },
      async (taskId) => {
        console.log('[BG] Checking for dropped alarms…');
        await rescheduleDroppedAlarms();
        BackgroundFetch.finish(taskId);
      },
      (err) => console.warn('[BG] BackgroundFetch failed to start:', err)
    );
    console.log('✅ BackgroundFetch configured');
  } catch (err) {
    console.warn('BackgroundFetch setup error:', err);
  }
}

async function rescheduleDroppedAlarms() {
  try {
    const pills        = await loadPillsFromStorage();
    const scheduled    = await notifee.getTriggerNotifications();
    const scheduledIds = new Set(scheduled.map((n) => n.notification.id));

    for (const pill of pills) {
      if (!pill.alarmEnabled) continue;

      const times = pill.alarmTimes?.length > 0
        ? pill.alarmTimes
        : pill.alarmTime ? [pill.alarmTime] : [];

      // Check if ANY slot for this pill is missing
      const anyMissing = times.some((_, i) => !scheduledIds.has(`${pill._id}-alarm-${i}`));

      if (anyMissing) {
        console.log(`[BG] Re-scheduling dropped alarm: ${pill.name}`);
        await scheduleRealAlarm(pill);
      }
    }
  } catch (err) {
    console.error('[BG] rescheduleDroppedAlarms error:', err);
  }
}