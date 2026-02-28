/**
 * pages/HomePage/homeHelpers.js
 * ─────────────────────────────────────────────────────────
 * Pure utility functions used by HomePage sub-components.
 * No React imports — easy to unit test.
 * ─────────────────────────────────────────────────────────
 */

/**
 * Returns true if the pill was marked as taken today.
 * @param {Object} pill
 * @returns {boolean}
 */
export function checkIfTakenToday(pill) {
  if (!pill.lastTaken) return false;
  return new Date().toDateString() === new Date(pill.lastTaken).toDateString();
}

/**
 * Calculates the completion percentage for a single pill.
 * Returns null if no totalDays is set (progress bar won't be shown).
 * @param {Object} pill
 * @returns {string|null}  e.g. "45" (percentage as string, 0–100)
 */
export function getPillProgress(pill) {
  if (!pill.totalDays || pill.totalDays === 0) return null;
  return Math.min(
    ((pill.daysCompleted || 0) / pill.totalDays) * 100,
    100
  ).toFixed(0);
}