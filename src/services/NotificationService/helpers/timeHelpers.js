/**
 * services/NotificationService/helpers/timeHelpers.js
 * ─────────────────────────────────────────────────────────
 * Pure time utility functions — no React, no notifee imports.
 * Easy to unit-test in isolation.
 * ─────────────────────────────────────────────────────────
 */

/**
 * Parse a 12-hour time string → 24-hour { hours, minutes }.
 * Accepts: "8:30 AM", "10:05 PM", "12:00 AM", "12:00 PM"
 *
 * @param {string} timeStr  e.g. "7:45 AM"
 * @returns {{ hours: number, minutes: number }}
 */
export function parseTime(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) throw new Error(`Invalid time string: "${timeStr}"`);

  let hours      = parseInt(match[1], 10);
  const minutes  = parseInt(match[2], 10);
  const period   = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours  = 0;

  return { hours, minutes };
}

/**
 * Return the next Unix timestamp (ms) for a given HH:MM
 * with an optional minute offset.
 * Always returns a time in the future.
 *
 * @param {number} hours           24-hour hour
 * @param {number} minutes         minute
 * @param {number} offsetMinutes   e.g. -10 for 10 min before
 * @returns {number}  Unix ms timestamp
 */
export function nextOccurrence(hours, minutes, offsetMinutes = 0) {
  const totalMins = hours * 60 + minutes + offsetMinutes;

  // Wrap to 0–1439 (minutes in a day)
  const wrappedMins = ((totalMins % 1440) + 1440) % 1440;
  const h = Math.floor(wrappedMins / 60);
  const m = wrappedMins % 60;

  const target = new Date();
  target.setHours(h, m, 0, 0);

  // If the computed time has already passed today, schedule for tomorrow
  if (target <= new Date()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
}