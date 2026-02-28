/**
 * services/NotificationService/handlers/scheduleSnooze.js
 * ─────────────────────────────────────────────────────────
 * ROOT CAUSE OF ERROR:
 *   'AlarmType' is NOT exported by @notifee/react-native.
 *   Use the raw numeric value 3 (SET_ALARM_CLOCK) instead.
 *
 * OTHER FIXES:
 *   vibrationPattern: first value was 0 → must be > 0 on Android
 * ─────────────────────────────────────────────────────────
 */

import notifee, {
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  // ⚠️  DO NOT import AlarmType — it is not exported by notifee
} from '@notifee/react-native';
import { ALARM_CHANNEL_ID } from '../channels/createChannels';

const SNOOZE_MS = 5 * 60 * 1000; // 5 minutes

// AlarmType.SET_ALARM_CLOCK = 3  (notifee internal enum, not exported)
const ALARM_TYPE_SET_ALARM_CLOCK = 3;

export async function scheduleSnooze(pill) {
  try {
    await notifee.createTriggerNotification(
      {
        id:    `${pill._id}-snooze`,
        title: `⏰ Snoozed — ${pill.name}`,
        body:  `${pill.dosage} — take it now!`,
        android: {
          channelId:        ALARM_CHANNEL_ID,
          importance:       AndroidImportance.HIGH,
          category:         AndroidCategory.ALARM,
          visibility:       AndroidVisibility.PUBLIC,
          smallIcon:        'ic_notification',
          color:            '#f59e0b',
          sound:            pill.alarmTone || 'alarm_classic',
          vibrationPattern: [300, 500, 200, 500], // all > 0

          fullScreenAction: { id: 'default', launchActivity: 'default' },
          ongoing:          true,
          autoCancel:       false,
          pressAction:      { id: 'default', launchActivity: 'default' },
          actions: [
            { title: '✅ Taken', pressAction: { id: 'taken' } },
          ],
        },
        ios: {
          sound:          pill.alarmTone || 'alarm_classic',
          critical:       true,
          criticalVolume: 1.0,
          categoryId:     'med-alarm',
        },
        data: {
          pillId: pill._id,
          pill:   JSON.stringify(pill),
        },
      },
      {
        type:         TriggerType.TIMESTAMP,
        timestamp:    Date.now() + SNOOZE_MS,
        alarmManager: {
          type:           ALARM_TYPE_SET_ALARM_CLOCK, // ← raw number 3
          allowWhileIdle: true,
        },
      }
    );

    console.log(`⏰ Snoozed 5 min: ${pill.name}`);
  } catch (err) {
    console.error('scheduleSnooze error:', err);
  }
}