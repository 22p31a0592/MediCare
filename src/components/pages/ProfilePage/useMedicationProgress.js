/**
 * pages/ProfilePage/useMedicationProgress.js
 * ─────────────────────────────────────────────────────────
 * Custom hook: calculates overall + per-pill medication progress.
 *
 * BUG FIX: denominator uses MAX(totalDays) × pills.length
 * instead of SUM(totalDays), so two 30-day pills added at the
 * same time show X/60, not X/30 doubled incorrectly.
 * ─────────────────────────────────────────────────────────
 */

import { useMemo } from 'react';

export function useMedicationProgress(pills) {
  return useMemo(() => {
    if (!pills || pills.length === 0) {
      return { totalCompleted: 0, maxDays: 0, overallPct: 0 };
    }

    const totalCompleted = pills.reduce((sum, p) => sum + (p.daysCompleted || 0), 0);
    const maxDays        = Math.max(...pills.map((p) => p.totalDays || 0));

    // Overall % = completed / (number_of_pills × longest_treatment)
    const overallPct =
      maxDays > 0
        ? Math.min((totalCompleted / (pills.length * maxDays)) * 100, 100).toFixed(0)
        : 0;

    return { totalCompleted, maxDays, overallPct };
  }, [pills]);
}

/**
 * Returns the completion percentage for a single pill (0–100, as string).
 */
export function getPillCompletionPct(pill) {
  if (!pill.totalDays || pill.totalDays === 0) return '0';
  return Math.min(
    ((pill.daysCompleted || 0) / pill.totalDays) * 100,
    100
  ).toFixed(0);
}