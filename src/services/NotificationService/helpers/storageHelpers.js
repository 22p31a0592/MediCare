/**
 * services/NotificationService/helpers/storageHelpers.js
 * ─────────────────────────────────────────────────────────
 * Direct AsyncStorage operations used by NotificationService.
 * Called when the app is CLOSED (background event handler)
 * so we cannot call React state setters — we write to storage.
 * ─────────────────────────────────────────────────────────
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PILLS_KEY = 'meditrack_pills';

/**
 * Mark a pill as taken directly in AsyncStorage.
 * Used in background event handlers when app is closed.
 *
 * @param {string} pillId
 */
export async function markPillTakenInStorage(pillId) {
  try {
    const raw    = await AsyncStorage.getItem(PILLS_KEY);
    const pills  = raw ? JSON.parse(raw) : [];

    const updated = pills.map((p) =>
      p._id === pillId
        ? {
            ...p,
            lastTaken:     new Date().toISOString(),
            daysCompleted: (p.daysCompleted || 0) + 1,
          }
        : p
    );

    await AsyncStorage.setItem(PILLS_KEY, JSON.stringify(updated));
    console.log('✅ Pill marked as taken in storage (background):', pillId);
  } catch (err) {
    console.error('markPillTakenInStorage error:', err);
  }
}

/**
 * Load all pills from AsyncStorage.
 * Used by background fetch to check which alarms need re-scheduling.
 *
 * @returns {Array}
 */
export async function loadPillsFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(PILLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('loadPillsFromStorage error:', err);
    return [];
  }
}