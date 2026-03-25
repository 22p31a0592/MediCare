/**
 * services/NotificationService/handlers/testAlarm.js
 *
 * Fires the REAL full-screen alarm in 5 seconds for dry-run testing.
 * Same channel, same sound, same fullScreenAction as the real alarm.
 * One-shot — never repeats.
 * ID: `${pill._id}-test` — never clashes with real alarm IDs.
 */

import notifee, {
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';
import { ALARM_CHANNEL_ID } from '../channels/createChannels';

const ALARM_TYPE_SET_ALARM_CLOCK = 3;
const TEST_DELAY_MS = 5000;

export async function triggerTestAlarm(pill) {
  const testId = `${pill._id}-test`;
  await notifee.cancelNotification(testId);

  await notifee.createTriggerNotification(
    {
      id:    testId,
      title: `🔔 TEST — ${pill.name}`,
      body:  `${pill.dosage}  ·  ${pill.frequency}  ·  (Test alarm)`,
      android: {
        channelId:  ALARM_CHANNEL_ID,   // uses the same channel = same sound
        importance: AndroidImportance.HIGH,
        category:   AndroidCategory.ALARM,
        visibility: AndroidVisibility.PUBLIC,
        smallIcon:  'ic_notification',
        color:      '#f59e0b',
        vibrationPattern: [300, 500, 200, 500, 200, 500],
        fullScreenAction: { id: 'default', launchActivity: 'default' },
        ongoing:    true,
        autoCancel: false,
        pressAction: { id: 'default', launchActivity: 'default' },
        actions: [
          { title: '✅ Taken',        pressAction: { id: 'taken'  } },
          { title: '⏰ Snooze 5 min', pressAction: { id: 'snooze' } },
        ],
      },
      ios: {
        sound: pill.alarmTone || 'alarm_classic.mp3',
        critical: true, criticalVolume: 1.0,
        interruptionLevel: 'critical',
        categoryId: 'med-alarm',
        foregroundPresentationOptions: { alert: true, badge: true, sound: true },
      },
      data: {
        pillId: pill._id,
        pill:   JSON.stringify(pill),
        type:   'alarm',
        isTest: 'true',
      },
    },
    {
      type:      TriggerType.TIMESTAMP,
      timestamp: Date.now() + TEST_DELAY_MS,
      alarmManager: { type: ALARM_TYPE_SET_ALARM_CLOCK, allowWhileIdle: true },
      // NO repeatFrequency — one-shot only
    }
  );

  console.log(`⏱️ Test alarm fires in 5s: ${pill.name}`);
}

export async function cancelTestAlarm(pillId) {
  try { await notifee.cancelNotification(`${pillId}-test`); }
  catch (e) { console.warn('cancelTestAlarm:', e); }
}