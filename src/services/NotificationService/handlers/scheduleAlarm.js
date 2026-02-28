/**
 * services/NotificationService/handlers/scheduleAlarm.js
 * ─────────────────────────────────────────────────────────
 * ROOT CAUSE OF ERROR:
 *   'AlarmType' is NOT exported by @notifee/react-native.
 *   It only exists as an internal TypeScript enum.
 *   Trying to import it crashes at runtime.
 *
 * FIX: Use the raw numeric value directly.
 *   AlarmType enum values (from notifee source):
 *     0 = ON_EXACT_WHILE_IDLE   (setAndAllowWhileIdle)
 *     1 = ON_EXACT              (setExact)
 *     2 = EXACT_WHILE_IDLE      (setExactAndAllowWhileIdle)
 *     3 = SET_ALARM_CLOCK       ← this is what we want
 *
 * OTHER FIXES:
 *   vibrationPattern: first value was 0 → must be > 0 on Android
 * ─────────────────────────────────────────────────────────
 */

import notifee, {
  TriggerType,
  RepeatFrequency,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  // ⚠️  DO NOT import AlarmType — it is not exported by notifee
} from '@notifee/react-native';

import { REMINDER_CHANNEL_ID, ALARM_CHANNEL_ID } from '../channels/createChannels';
import { parseTime, nextOccurrence }              from '../helpers/timeHelpers';

// AlarmType.SET_ALARM_CLOCK = 3  (notifee internal enum, not exported)
const ALARM_TYPE_SET_ALARM_CLOCK = 3;

// ── 10-minute heads-up notification ──────────────────────

export async function scheduleReminder(pill) {
  const { hours, minutes } = parseTime(pill.alarmTime);

  await notifee.createTriggerNotification(
    {
      id:    `${pill._id}-reminder`,
      title: '⏰ Medication in 10 minutes',
      body:  `${pill.name} (${pill.dosage}) — get ready!`,
      android: {
        channelId:     REMINDER_CHANNEL_ID,
        importance:    AndroidImportance.HIGH,
        smallIcon:     'ic_notification',
        color:         '#3b82f6',
        pressAction:   { id: 'default', launchActivity: 'default' },
        showTimestamp: true,
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: { alert: true, badge: true, sound: true },
      },
      data: { pillId: pill._id },
    },
    {
      type:            TriggerType.TIMESTAMP,
      timestamp:       nextOccurrence(hours, minutes, -10),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: {
        type:           ALARM_TYPE_SET_ALARM_CLOCK, // ← raw number 3
        allowWhileIdle: true,
      },
    }
  );
}

// ── Real alarm at exact time ──────────────────────────────

export async function scheduleRealAlarm(pill) {
  const { hours, minutes } = parseTime(pill.alarmTime);
  const sound              = pill.alarmTone || 'alarm_classic';

  await notifee.createTriggerNotification(
    {
      id:    `${pill._id}-alarm`,
      title: `🔔 Take ${pill.name} now`,
      body:  `${pill.dosage}  ·  ${pill.frequency}`,
      android: {
        channelId:        ALARM_CHANNEL_ID,
        importance:       AndroidImportance.HIGH,
        category:         AndroidCategory.ALARM,
        visibility:       AndroidVisibility.PUBLIC,
        smallIcon:        'ic_notification',
        color:            '#ef4444',
        sound:            sound,
        vibrationPattern: [300, 500, 200, 500, 200, 500], // all > 0

        fullScreenAction: {
          id:             'default',
          launchActivity: 'default',
        },

        ongoing:       true,
        autoCancel:    false,
        showTimestamp: true,
        pressAction:   { id: 'default', launchActivity: 'default' },

        actions: [
          { title: '✅ Taken',        pressAction: { id: 'taken'  } },
          { title: '⏰ Snooze 5 min', pressAction: { id: 'snooze' } },
        ],
      },
      ios: {
        sound:             sound,
        critical:          true,
        criticalVolume:    1.0,
        interruptionLevel: 'critical',
        categoryId:        'med-alarm',
        foregroundPresentationOptions: { alert: true, badge: true, sound: true },
      },
      data: {
        pillId: pill._id,
        pill:   JSON.stringify(pill),
      },
    },
    {
      type:            TriggerType.TIMESTAMP,
      timestamp:       nextOccurrence(hours, minutes, 0),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: {
        type:           ALARM_TYPE_SET_ALARM_CLOCK, // ← raw number 3
        allowWhileIdle: true,
      },
    }
  );
}