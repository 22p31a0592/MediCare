/**
 * services/NotificationService/channels/requestPermissions.js
 * ─────────────────────────────────────────────────────────
 * Requests all permissions needed for real alarm behaviour:
 *   - Notification permission (all platforms)
 *   - Critical alert permission (iOS — bypass silent switch)
 *   - Exact alarm permission (Android 12+ API 31)
 * ─────────────────────────────────────────────────────────
 */

import { Platform } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

export async function requestPermissions() {
  // Request notification + critical alert permission
  const settings = await notifee.requestPermission({
    sound:         true,
    criticalAlert: true,   // iOS: bypass silent switch
    alert:         true,
    badge:         true,
  });

  if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
    console.warn('⚠️ Notification permission denied');
    return false;
  }

  // Android 12+ (API 31) requires explicit exact alarm permission
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    try {
      await notifee.requestExactAlarmPermission();
      console.log('✅ Exact alarm permission granted');
    } catch (e) {
      console.warn('⚠️ Exact alarm permission denied:', e.message);
    }
  }

  console.log('✅ Notification permissions granted');
  return true;
}