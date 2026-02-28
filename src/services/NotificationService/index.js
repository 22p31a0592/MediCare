/**
 * services/NotificationService/index.js  ← MAIN ENTRY
 * ─────────────────────────────────────────────────────────
 * Thin orchestrator. All logic lives in sub-modules:
 *
 *  channels/
 *    createChannels.js      ← creates reminder + alarm channels
 *    requestPermissions.js  ← all permission requests
 *
 *  handlers/
 *    scheduleAlarm.js       ← scheduleReminder + scheduleRealAlarm
 *    scheduleSnooze.js      ← 5-min snooze real alarm
 *    eventHandlers.js       ← foreground + background action listeners
 *    backgroundFetch.js     ← re-schedule dropped alarms every 15 min
 *
 *  helpers/
 *    timeHelpers.js         ← parseTime, nextOccurrence (pure functions)
 *    storageHelpers.js      ← AsyncStorage read/write for background use
 * ─────────────────────────────────────────────────────────
 */

import notifee from '@notifee/react-native';

import { requestPermissions }            from './channels/requestPermissions';
import { createChannels }                from './channels/createChannels';
import { scheduleReminder, scheduleRealAlarm } from './handlers/scheduleAlarm';
import { setupEventHandlers }            from './handlers/eventHandlers';
import { setupBackgroundFetch }          from './handlers/backgroundFetch';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    // Passed to eventHandlers so it can call React state callback
    this._ref = { onPillTakenCb: null };
  }

  // ─── Public API ─────────────────────────────────────────

  /** Register callback invoked when user taps "Taken" (app open) */
  setOnPillTakenCallback(cb) {
    this._ref.onPillTakenCb = cb;
  }

  /**
   * Schedule a 10-min reminder + a real alarm for a pill.
   * This is the main method called from App.js / loaders.
   */
  async scheduleAlarm(pill) {
    if (!pill.alarmEnabled || !pill.alarmTime) return false;
    try {
      await this.initialize();
      await scheduleReminder(pill);
      await scheduleRealAlarm(pill);
      console.log(`✅ Alarm scheduled: ${pill.name} @ ${pill.alarmTime}`);
      return true;
    } catch (err) {
      console.error('❌ scheduleAlarm failed:', err);
      return false;
    }
  }

  /** Cancel all notifications (reminder + alarm + snooze) for a pill */
  async cancelAlarm(pillId) {
    try {
      await notifee.cancelNotification(`${pillId}-reminder`);
      await notifee.cancelNotification(`${pillId}-alarm`);
      await notifee.cancelNotification(`${pillId}-snooze`);
    } catch (err) {
      console.error('cancelAlarm error:', err);
    }
  }

  /** Cancel every scheduled notification in the app */
  async cancelAllAlarms() {
    try {
      await notifee.cancelAllNotifications();
    } catch (err) {
      console.error('cancelAllAlarms error:', err);
    }
  }

  // ─── Legacy aliases (existing callers in App.js still work) ─

  scheduleMedicationReminder(pill) { return this.scheduleAlarm(pill); }
  cancelReminder(id)                { return this.cancelAlarm(id);    }
  cancelAllReminders()              { return this.cancelAllAlarms();  }

  // ─── Initialization (runs once) ──────────────────────────

  async initialize() {
    if (this.isInitialized) return;

    await requestPermissions();
    await createChannels();

    // Pass cancelAlarm into eventHandlers so it can cancel on "Taken"
    setupEventHandlers(this._ref, (pillId) => this.cancelAlarm(pillId));

    await setupBackgroundFetch();

    this.isInitialized = true;
    console.log('✅ NotificationService initialized');
  }
}

export default new NotificationService();