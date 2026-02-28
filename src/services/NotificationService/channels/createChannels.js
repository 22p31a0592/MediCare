/**
 * services/NotificationService/channels/createChannels.js
 * ─────────────────────────────────────────────────────────
 * Creates two separate Android notification channels:
 *
 *  1. med-reminder  → 10-min heads-up (normal HIGH priority)
 *  2. med-alarm     → real alarm (bypassDnd, full alarm behaviour)
 *
 * Channels are permanent once created. Changing them requires
 * the user to uninstall the app or go to App Settings.
 * ─────────────────────────────────────────────────────────
 */

import notifee, { AndroidImportance } from '@notifee/react-native';

export const REMINDER_CHANNEL_ID = 'med-reminder';
export const ALARM_CHANNEL_ID    = 'med-alarm';

export async function createChannels() {
  // ── Channel 1: Reminder (10 min before) ──────────────────
  await notifee.createChannel({
    id:          REMINDER_CHANNEL_ID,
    name:        'Medication Reminders',
    description: '10-minute heads-up before your medication alarm',
    importance:  AndroidImportance.HIGH,
    sound:       'default',
    vibration:   true,
    vibrationPattern: [300, 400, 200, 400],
    lights:      true,
    lightColor:  '#3b82f6',
  });

  // ── Channel 2: Alarm (fires at exact time) ────────────────
  // bypassDnd: true  → rings even in Do Not Disturb mode
  await notifee.createChannel({
    id:               ALARM_CHANNEL_ID,
    name:             'Medication Alarms',
    description:      'Full alarm — rings even in silent and DND modes',
    importance:       AndroidImportance.HIGH,
    sound:            'alarm_classic',      // /res/raw/alarm_classic.mp3
    vibration:        true,
   // vibrationPattern: [0, 500, 200, 500, 200, 500],
    lights:           true,
    lightColor:       '#ef4444',
    bypassDnd:        true,                 // ← bypass Do Not Disturb
  });

  console.log('✅ Notification channels created');
}