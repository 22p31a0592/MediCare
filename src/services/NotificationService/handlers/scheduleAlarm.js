/**
 * services/NotificationService/handlers/scheduleAlarm.js
 *
 * FIXES:
 *  1. Sound field removed from notification — Android ignores it anyway
 *     after the channel is created. Sound is controlled by the CHANNEL only.
 *     Keeping it caused confusion when they didn't match.
 *
 *  2. scheduleReminder() removed — no top notification, only real alarm.
 *
 *  3. Loops pill.alarmTimes[] — one alarm per time slot.
 *     "Twice daily" → 2 separate alarms scheduled independently.
 *
 *  4. Each alarm ID: `${pill._id}-alarm-${index}` so they cancel individually.
 */

import notifee, {
  TriggerType,
  RepeatFrequency,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';

import { ALARM_CHANNEL_ID }            from '../channels/createChannels';
import { parseTime, nextOccurrence }   from '../helpers/timeHelpers';

// AlarmType.SET_ALARM_CLOCK = 3 (internal enum — NOT exported by notifee)
const ALARM_TYPE_SET_ALARM_CLOCK = 3;

/**
 * Schedule all real alarms for a pill.
 * One per entry in pill.alarmTimes[].
 * Falls back to pill.alarmTime (legacy single-time) if no array.
 */
export async function scheduleRealAlarm(pill) {
  // Support both new array format and legacy single string
  const times = pill.alarmTimes?.length > 0
    ? pill.alarmTimes
    : pill.alarmTime
      ? [pill.alarmTime]
      : [];

  if (times.length === 0) {
    console.warn(`scheduleRealAlarm: no alarm times for ${pill.name}`);
    return;
  }

  for (let i = 0; i < times.length; i++) {
    const timeStr          = times[i];
    const { hours, minutes } = parseTime(timeStr);

    const doseLabel = times.length > 1 ? `  ·  Dose ${i + 1}/${times.length}` : '';

    await notifee.createTriggerNotification(
      {
        id:    `${pill._id}-alarm-${i}`,
        title: `🔔 Take ${pill.name} now`,
        body:  `${pill.dosage}  ·  ${pill.frequency}${doseLabel}`,
        android: {
          channelId:  ALARM_CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          category:   AndroidCategory.ALARM,
          visibility: AndroidVisibility.PUBLIC,
          smallIcon:  'ic_notification',
          color:      '#ef4444',

          // DO NOT set sound here — Android uses CHANNEL sound after first install.
          // Setting it here with a different value causes silent alarms.

          vibrationPattern: [300, 500, 200, 500, 200, 500],

          // Wakes screen → launches MainActivity → AlarmScreen shows
          fullScreenAction: {
            id:             'default',
            launchActivity: 'default',
          },

          ongoing:       true,   // cannot swipe away
          autoCancel:    false,  // tapping does NOT dismiss
          showTimestamp: true,
          pressAction:   { id: 'default', launchActivity: 'default' },

          actions: [
            { title: '✅ Taken',        pressAction: { id: 'taken'  } },
            { title: '⏰ Snooze 5 min', pressAction: { id: 'snooze' } },
          ],
        },
        ios: {
          sound:             pill.alarmTone || 'alarm_classic.mp3',
          critical:          true,
          criticalVolume:    1.0,
          interruptionLevel: 'critical',
          categoryId:        'med-alarm',
          foregroundPresentationOptions: { alert: true, badge: true, sound: true },
        },
        data: {
          pillId:    pill._id,
          pill:      JSON.stringify(pill),
          slotIndex: String(i),
          type:      'alarm',  // AlarmScreen checks this
        },
      },
      {
        type:            TriggerType.TIMESTAMP,
        timestamp:       nextOccurrence(hours, minutes, 0),
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: {
          type:           ALARM_TYPE_SET_ALARM_CLOCK,
          allowWhileIdle: true,
        },
      }
    );

    console.log(`✅ Alarm ${i + 1}/${times.length}: ${pill.name} @ ${timeStr}`);
  }
}