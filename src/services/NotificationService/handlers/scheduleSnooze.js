/**
 * services/NotificationService/handlers/scheduleSnooze.js
 * One-shot alarm 5 minutes from now.
 */

import notifee, {
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';
import { ALARM_CHANNEL_ID } from '../channels/createChannels';

const SNOOZE_MS                  = 5 * 60 * 1000;
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
          asForegroundService: true,
          category:         AndroidCategory.ALARM,
          visibility:       AndroidVisibility.PUBLIC,
          smallIcon:        'ic_notification',
          color:            '#f59e0b',
          vibrationPattern: [300, 500, 200, 500],
          fullScreenAction: { id: 'default', launchActivity: 'default' },
          ongoing:          true,
          autoCancel:       false,
          pressAction:      { id: 'default', launchActivity: 'default' },
          actions: [
            { title: '✅ Taken',        pressAction: { id: 'taken'  } },
            { title: '⏰ Snooze 5 min', pressAction: { id: 'snooze' } },
          ],
        },
        ios: {
          sound:          pill.alarmTone || 'alarm_classic.mp3',
          critical:       true,
          criticalVolume: 1.0,
          categoryId:     'med-alarm',
        },
        data: {
          pillId: pill._id,
          pill:   JSON.stringify(pill),
          type:   'alarm',
        },
      },
      {
        type:         TriggerType.TIMESTAMP,
        timestamp:    Date.now() + SNOOZE_MS,
        alarmManager: { type: ALARM_TYPE_SET_ALARM_CLOCK, allowWhileIdle: true },
      }
    );
    console.log(`⏰ Snoozed 5 min: ${pill.name}`);
  } catch (err) {
    console.error('scheduleSnooze error:', err);
  }
}