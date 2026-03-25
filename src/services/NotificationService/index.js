/**
 * services/NotificationService/index.js
 *
 * ── WHAT CHANGED ─────────────────────────────────────────
 *  - onBackgroundEvent() moved HERE (top-level, before any class)
 *    so it is registered the instant index.js is imported —
 *    even when the app is KILLED. This is the #1 requirement
 *    for killed-app alarm handling.
 *  - initialize() is now safe to call multiple times (guard kept).
 *  - snoozeAlarm() cancels current alarm then schedules snooze.
 *  - cancelAlarm() cancels every slot + snooze + displayed.
 * ─────────────────────────────────────────────────────────
 */

import notifee, { EventType } from '@notifee/react-native';

import { requestPermissions }        from './channels/requestPermissions';
import { createChannels }            from './channels/createChannels';
import { scheduleRealAlarm }         from './handlers/scheduleAlarm';
import { scheduleSnooze }            from './handlers/scheduleSnooze';
import { setupForegroundHandlers }   from './handlers/eventHandlers';
import { setupBackgroundFetch }      from './handlers/backgroundFetch';
import { markPillTakenInStorage }    from './helpers/storageHelpers';

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND EVENT HANDLER — registered at module load time.
//
// This MUST live here at the top level (not inside a class, not inside
// useEffect) so notifee can find it the moment the JS bundle is evaluated
// when Android wakes the app to handle a background/killed-state event.
//
// What it handles:
//   • "Taken"  button press while app is KILLED or BACKGROUND
//   • "Snooze" button press while app is KILLED or BACKGROUND
//   • Notification body tap while app is BACKGROUND
//     (body tap while KILLED is handled by getInitialNotification in App.js)
// ─────────────────────────────────────────────────────────────────────────────
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const data = detail?.notification?.data;
  if (!data || data.type !== 'alarm') return;

  let pill = null;
  try {
    pill = typeof data.pill === 'string' ? JSON.parse(data.pill) : data.pill;
  } catch (e) {
    console.error('[BG] Failed to parse pill:', e);
    return;
  }

  const pillId = data.pillId || pill?._id;
  if (!pillId) return;

  // ── Cancel all slots helper (no class available here) ──
  async function cancelAllSlots() {
    const count = pill?.alarmTimes?.length || 8;
    const cancels = [];
    for (let i = 0; i < count; i++) {
      cancels.push(notifee.cancelNotification(`${pillId}-alarm-${i}`));
    }
    cancels.push(notifee.cancelNotification(`${pillId}-snooze`));
    cancels.push(notifee.cancelNotification(`${pillId}-alarm`)); // legacy
    // Also cancel the currently displayed notification
    if (detail.notification?.id) {
      cancels.push(notifee.cancelNotification(detail.notification.id));
    }
    await Promise.all(cancels);
  }

  if (type === EventType.ACTION_PRESS) {
    if (detail.pressAction?.id === 'taken') {
      console.log('[BG] Taken pressed for:', pill?.name);
      await cancelAllSlots();
      await markPillTakenInStorage(pillId);
    }

    if (detail.pressAction?.id === 'snooze') {
      console.log('[BG] Snooze pressed for:', pill?.name);
      await cancelAllSlots();
      await scheduleSnooze(pill);
    }
  }

  // Body tap while backgrounded — app will open, App.js handles AlarmScreen
  if (type === EventType.PRESS) {
    console.log('[BG] Notification tapped — app will open');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// NotificationService class
// ─────────────────────────────────────────────────────────────────────────────
class NotificationService {
  constructor() {
    this.isInitialized = false;
    this._ref = { onPillTakenCb: null };
  }

  setOnPillTakenCallback(cb) {
    this._ref.onPillTakenCb = cb;
  }

  async initialize() {
    if (this.isInitialized) return;
    await requestPermissions();
    await createChannels();
    // Only foreground event handler set up here —
    // background handler is already registered above at module level.
    setupForegroundHandlers(this._ref, (pillId, pill) => this.cancelAlarm(pillId, pill));
    await setupBackgroundFetch();
    this.isInitialized = true;
    console.log('✅ NotificationService initialized');
  }

  async scheduleAlarm(pill) {
    if (!pill.alarmEnabled) return false;
    const hasTimes = pill.alarmTimes?.length > 0 || pill.alarmTime;
    if (!hasTimes) return false;
    try {
      await this.initialize();
      await scheduleRealAlarm(pill);
      return true;
    } catch (err) {
      console.error('scheduleAlarm failed:', err);
      return false;
    }
  }

  async snoozeAlarm(pill) {
    try {
      await this.cancelAlarm(pill._id, pill);
      await scheduleSnooze(pill);
    } catch (err) {
      console.error('snoozeAlarm error:', err);
    }
  }

  // Cancels all alarm slots: alarm-0, alarm-1, ... + snooze + displayed
  async cancelAlarm(pillId, pill = null) {
    try {
      const count = pill?.alarmTimes?.length || 8;
      const cancels = [];

      for (let i = 0; i < count; i++) {
        cancels.push(notifee.cancelNotification(`${pillId}-alarm-${i}`));
      }
      cancels.push(notifee.cancelNotification(`${pillId}-snooze`));
      cancels.push(notifee.cancelNotification(`${pillId}-alarm`)); // legacy

      // Also cancel any currently DISPLAYED notification for this pill
      const displayed = await notifee.getDisplayedNotifications();
      for (const n of displayed) {
        if (n.notification?.data?.pillId === pillId) {
          cancels.push(notifee.cancelNotification(n.notification.id));
        }
      }

      await Promise.all(cancels);
      console.log(`✅ cancelAlarm: cleared all slots for ${pillId}`);
    } catch (err) {
      console.error('cancelAlarm error:', err);
    }
  }

  async cancelAllAlarms() {
    try {
      await notifee.cancelAllNotifications();
      await notifee.cancelAllTriggerNotifications();
    } catch (err) {
      console.error('cancelAllAlarms error:', err);
    }
  }

  // Legacy aliases
  scheduleMedicationReminder(pill) { return this.scheduleAlarm(pill); }
  cancelReminder(id, pill)         { return this.cancelAlarm(id, pill); }
  cancelAllReminders()             { return this.cancelAllAlarms(); }
}

export default new NotificationService();