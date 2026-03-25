/**
 * services/NotificationService/channels/createChannels.js
 *
 * FIX: Channel sound was 'jigelu_rani' but scheduleAlarm.js used
 * 'alarm_classic'. On Android, the CHANNEL controls the sound —
 * the notification-level sound field is ignored after first creation.
 * Both must use the same name.
 *
 * HOW TO ADD YOUR OWN ALARM SOUND:
 *   1. Copy your .mp3 file to:
 *      android/app/src/main/res/raw/alarm_classic.mp3
 *      (filename must be lowercase, no spaces, no special chars)
 *   2. The channel references it by filename WITHOUT extension: 'alarm_classic'
 *   3. Uninstall + reinstall the app after changing channel sounds
 *      (Android caches channel settings — reinstall clears the cache)
 */

import notifee, { AndroidImportance } from '@notifee/react-native';

export const ALARM_CHANNEL_ID = 'med-alarm';

export async function createChannels() {
  // Single alarm channel — no reminder channel (no top notification)
  await notifee.createChannel({
    id:          ALARM_CHANNEL_ID,
    name:        'Medication Alarms',
    description: 'Full alarm — rings even in silent and DND modes',
    importance:  AndroidImportance.HIGH,

    // ── SOUND ──────────────────────────────────────────────
    // Must match the filename in android/app/src/main/res/raw/
    // WITHOUT the .mp3 extension.
    // If the file does not exist, Android falls back to default ringtone.
    sound:            'alarm_classic',   // → res/raw/alarm_classic.mp3

    vibration:        true,
    vibrationPattern: [300, 500, 200, 500, 200, 500],
    lights:           true,
    lightColor:       '#ef4444',
    bypassDnd:        true,   // rings even in Do Not Disturb
  });

  console.log('✅ Notification channels created');
}