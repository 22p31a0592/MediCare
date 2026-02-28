/**
 * services/NotificationService/handlers/backgroundFetch.js
 * ─────────────────────────────────────────────────────────
 * Configures BackgroundFetch to periodically check if any
 * scheduled alarms have been dropped by the OS.
 *
 * Why this is needed:
 *   Some Android OEMs (Samsung, Xiaomi, OPPO, Huawei) aggressively
 *   kill scheduled alarms when the app is in the background.
 *   BackgroundFetch wakes the app every ~15 minutes and re-schedules
 *   any missing alarms before the user notices.
 *
 * Settings:
 *   stopOnTerminate: false  → keeps running after app is closed
 *   startOnBoot:     true   → reschedules after phone restart
 *   enableHeadless:  true   → can run without UI
 * ─────────────────────────────────────────────────────────
 */

import BackgroundFetch from 'react-native-background-fetch';
import notifee         from '@notifee/react-native';
import { loadPillsFromStorage } from '../helpers/storageHelpers';
import { scheduleReminder, scheduleRealAlarm } from './scheduleAlarm';

export async function setupBackgroundFetch() {
  try {
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,   // check every 15 minutes
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

/**
 * Load all pills from storage, compare with currently scheduled
 * notifee triggers, and re-schedule any that are missing.
 */
async function rescheduleDroppedAlarms() {
  try {
    const pills      = await loadPillsFromStorage();
    const scheduled  = await notifee.getTriggerNotifications();
    const scheduledIds = new Set(scheduled.map((n) => n.notification.id));

    for (const pill of pills) {
      if (!pill.alarmEnabled || !pill.alarmTime) continue;

      const alarmId = `${pill._id}-alarm`;
      if (!scheduledIds.has(alarmId)) {
        console.log(`[BG] Re-scheduling dropped alarm: ${pill.name}`);
        await scheduleReminder(pill);
        await scheduleRealAlarm(pill);
      }
    }
  } catch (err) {
    console.error('[BG] rescheduleDroppedAlarms error:', err);
  }
}