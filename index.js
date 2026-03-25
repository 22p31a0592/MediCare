/**
 * index.js  ← REACT NATIVE ENTRY POINT
 *
 * ── CRITICAL ─────────────────────────────────────────────
 * notifee.onBackgroundEvent() MUST be registered here, at the
 * top level, BEFORE AppRegistry. This is the ONLY way to handle
 * notification action button presses (Taken / Snooze) when the
 * app is KILLED or in the BACKGROUND.
 *
 * Without this, pressing "Taken" or "Snooze" on the notification
 * while the app is closed does nothing.
 * ─────────────────────────────────────────────────────────
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import App from './App';
import { name as appName } from './app.json';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: parse pill safely from notification data
// ─────────────────────────────────────────────────────────────────────────────
function parsePill(data) {
  try {
    if (!data?.pill) return null;
    return typeof data.pill === 'string' ? JSON.parse(data.pill) : data.pill;
  } catch (e) {
    console.error('[BackgroundEvent] parsePill error:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: mark pill taken in AsyncStorage (no Redux/state available in BG)
// ─────────────────────────────────────────────────────────────────────────────
async function markPillTakenInStorage(pillId) {
  try {
    const raw = await AsyncStorage.getItem('pills');
    if (!raw) return;
    const pills = JSON.parse(raw);
    const today = new Date().toDateString();
    const updated = pills.map(p => {
      if (p._id !== pillId) return p;
      const takenDates = p.takenDates || [];
      if (!takenDates.includes(today)) takenDates.push(today);
      return { ...p, takenDates };
    });
    await AsyncStorage.setItem('pills', JSON.stringify(updated));
    console.log('[BackgroundEvent] Pill marked taken in storage:', pillId);
  } catch (e) {
    console.error('[BackgroundEvent] markPillTakenInStorage error:', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: schedule snooze alarm +5 min (inline, no service import needed in BG)
// ─────────────────────────────────────────────────────────────────────────────
async function snoozeAlarmInBackground(pill) {
  try {
    const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);

    await notifee.createChannel({
      id: 'medication_alarm',
      name: 'Medication Alarms',
      importance: 5, // AndroidImportance.HIGH
      sound: 'alarm_sound',
    });

    await notifee.displayNotification({
      title: `💊 Snoozed: ${pill.name}`,
      body: `Reminder in 5 minutes — ${pill.dosage ?? ''}`,
      data: { type: 'alarm', pill: JSON.stringify(pill) },
      android: {
        channelId: 'medication_alarm',
        importance: 5,
        sound: 'alarm_sound',
        fullScreenAction: { id: 'default' },
        showTimestamp: true,
        timestamp: snoozeTime.getTime(),
        pressAction: { id: 'default' },
        actions: [
          { title: '✅ Taken', pressAction: { id: 'taken' } },
          { title: '⏰ Snooze', pressAction: { id: 'snooze' } },
        ],
      },
    });

    // Use notifee trigger for exact snooze time
    const { TriggerType } = require('@notifee/react-native');
    await notifee.createTriggerNotification(
      {
        title: `💊 ${pill.name}`,
        body: `Time to take your medication — ${pill.dosage ?? ''}`,
        data: { type: 'alarm', pill: JSON.stringify(pill) },
        android: {
          channelId: 'medication_alarm',
          importance: 5,
          sound: 'alarm_sound',
          fullScreenAction: { id: 'default' },
          pressAction: { id: 'default' },
          actions: [
            { title: '✅ Taken', pressAction: { id: 'taken' } },
            { title: '⏰ Snooze', pressAction: { id: 'snooze' } },
          ],
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: snoozeTime.getTime(),
        alarmManager: { allowWhileIdle: true },
      },
    );

    console.log('[BackgroundEvent] Snooze alarm scheduled for:', snoozeTime.toLocaleTimeString());
  } catch (e) {
    console.error('[BackgroundEvent] snoozeAlarmInBackground error:', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// !! MUST BE REGISTERED BEFORE AppRegistry.registerComponent !!
//
// Handles notification action button presses when app is KILLED or BACKGROUND.
// This runs in a SHORT-LIVED background JS context — no React, no state.
// Only AsyncStorage and notifee APIs are safe to use here.
// ─────────────────────────────────────────────────────────────────────────────
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const data = detail.notification?.data;
  if (!data || data.type !== 'alarm') return;

  const pill = parsePill(data);
  if (!pill) return;

  console.log('[BackgroundEvent] type:', type, 'pressAction:', detail.pressAction?.id);

  if (type === EventType.ACTION_PRESS) {
    if (detail.pressAction?.id === 'taken') {
      // Mark taken in storage + cancel notification
      await markPillTakenInStorage(pill._id);
      await notifee.cancelNotification(detail.notification.id);
      console.log('[BackgroundEvent] Marked taken & cancelled notification');

    } else if (detail.pressAction?.id === 'snooze') {
      // Cancel current + schedule new in 5 min
      await notifee.cancelNotification(detail.notification.id);
      await snoozeAlarmInBackground(pill);
      console.log('[BackgroundEvent] Snoozed alarm');
    }
  }

  // User tapped the notification body (not an action button) — app will open
  // and getInitialNotification() / onForegroundEvent will handle showing AlarmScreen
  if (type === EventType.PRESS) {
    console.log('[BackgroundEvent] Notification body tapped — app will open');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Register app
// ─────────────────────────────────────────────────────────────────────────────
AppRegistry.registerComponent(appName, () => App);