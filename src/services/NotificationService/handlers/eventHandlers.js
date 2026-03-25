/**
 * services/NotificationService/handlers/eventHandlers.js
 *
 * ── WHAT CHANGED ─────────────────────────────────────────
 *  - onBackgroundEvent() REMOVED from here entirely.
 *    It now lives in index.js at module level so it is
 *    registered even when the app is KILLED.
 *    Having it here (inside setupEventHandlers which is only
 *    called after initialize()) meant it was never registered
 *    in time for killed-app events.
 *
 *  - Renamed export to setupForegroundHandlers() to make the
 *    responsibility clear — this only sets up the foreground handler.
 *
 *  - Foreground handler covers:
 *      ACTION_PRESS → Taken / Snooze button taps while app is open
 *      PRESS        → User tapped notification body while app is open
 *      DELIVERED    → Alarm fired while app is open (App.js also
 *                     listens for this to show AlarmScreen Modal)
 *
 *  - cancelAlarmFn now receives (pillId, pill) so displayed
 *    notifications are also cancelled via the service.
 * ─────────────────────────────────────────────────────────
 */

import notifee, { EventType } from '@notifee/react-native';
import { markPillTakenInStorage } from '../helpers/storageHelpers';
import { scheduleSnooze }         from './scheduleSnooze';

/**
 * Call once during NotificationService.initialize().
 * Sets up the foreground event handler ONLY.
 * Background handler is already registered in index.js.
 *
 * @param {object}   ref            — { onPillTakenCb: fn | null }
 * @param {function} cancelAlarmFn  — (pillId, pill) => Promise<void>
 */
export function setupForegroundHandlers(ref, cancelAlarmFn) {
  notifee.onForegroundEvent(async ({ type, detail }) => {
    const data = detail?.notification?.data;
    if (!data || data.type !== 'alarm') return;

    // Parse pill
    let pill = null;
    try {
      pill = typeof data.pill === 'string' ? JSON.parse(data.pill) : data.pill;
    } catch (e) {
      console.error('[FG] Failed to parse pill:', e);
      return;
    }

    const pillId = data.pillId || pill?._id;
    if (!pillId) return;

    // ── Action button pressed (Taken / Snooze) ──────────────
    if (type === EventType.ACTION_PRESS) {
      if (detail.pressAction?.id === 'taken') {
        console.log('[FG] Taken pressed for:', pill?.name);
        await cancelAlarmFn(pillId, pill);
        // In foreground: call the React state callback so UI updates instantly
        if (ref.onPillTakenCb) {
          await ref.onPillTakenCb(pillId);
        } else {
          // Fallback: persist directly if callback not set yet
          await markPillTakenInStorage(pillId);
        }
      }

      if (detail.pressAction?.id === 'snooze') {
        console.log('[FG] Snooze pressed for:', pill?.name);
        await cancelAlarmFn(pillId, pill);
        await scheduleSnooze(pill);
        // App.js will hide AlarmScreen via its own onForegroundEvent listener
      }
    }

    // ── Notification body tapped while app is open ──────────
    // App.js onForegroundEvent PRESS handler will show AlarmScreen Modal.
    // Nothing extra needed here.
    if (type === EventType.PRESS) {
      console.log('[FG] Notification body tapped (app open)');
    }

    // ── Alarm delivered while app is open ───────────────────
    // App.js onForegroundEvent DELIVERED handler sets activeAlarm state.
    // Nothing extra needed here.
    if (type === EventType.DELIVERED) {
      console.log('[FG] Alarm delivered (app open):', pill?.name);
    }
  });

  console.log('✅ Foreground event handler registered');
}