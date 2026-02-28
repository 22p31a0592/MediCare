/**
 * services/NotificationService/handlers/eventHandlers.js
 * ─────────────────────────────────────────────────────────
 * Registers foreground + background event listeners.
 *
 * Foreground (app is open):
 *   Call the React state callback so UI updates instantly.
 *
 * Background (app closed or minimised):
 *   Write directly to AsyncStorage — cannot touch React state.
 * ─────────────────────────────────────────────────────────
 */

import notifee, { EventType } from '@notifee/react-native';
import { markPillTakenInStorage } from '../helpers/storageHelpers';
import { scheduleSnooze }         from './scheduleSnooze';

/**
 * @param {object}   ref                  Object with .onPillTakenCb and .cancelAlarm
 * @param {Function} cancelAlarmFn        cancelAlarm(pillId) from index.js
 */
export function setupEventHandlers(ref, cancelAlarmFn) {
  // ── Foreground ────────────────────────────────────────────
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      await handleAction(detail, false, ref, cancelAlarmFn);
    }
  });

  // ── Background ────────────────────────────────────────────
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      await handleAction(detail, true, ref, cancelAlarmFn);
    }
  });
}

async function handleAction({ pressAction, notification }, isBackground, ref, cancelAlarmFn) {
  const pillId = notification?.data?.pillId;

  // ── Taken ─────────────────────────────────────────────────
  if (pressAction?.id === 'taken' && pillId) {
    // Cancel all three notification IDs for this pill
    await cancelAlarmFn(pillId);

    if (isBackground) {
      // App closed — write directly to storage
      await markPillTakenInStorage(pillId);
    } else {
      // App open — update React state via callback
      if (ref.onPillTakenCb) await ref.onPillTakenCb(pillId);
    }
  }

  // ── Snooze ────────────────────────────────────────────────
  if (pressAction?.id === 'snooze' && notification?.data?.pill) {
    try {
      const pill = JSON.parse(notification.data.pill);
      // Cancel the ringing alarm, then fire a new one in 5 min
      await notifee.cancelNotification(`${pillId}-alarm`);
      await scheduleSnooze(pill);
    } catch (e) {
      console.error('snooze parse error:', e);
    }
  }
}