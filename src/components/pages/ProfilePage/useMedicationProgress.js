/**
 * pages/ProfilePage/useMedicationProgress.js
 * FIX: uses SUM(totalDays) not MAX×count.
 */

import { useMemo } from 'react';

export function useMedicationProgress(pills) {
  return useMemo(() => {
    if (!pills || pills.length === 0) {
      return { totalCompleted: 0, totalDays: 0, overallPct: 0 };
    }
    const totalCompleted = pills.reduce((sum, p) => sum + (p.daysCompleted || 0), 0);
    const totalDays      = pills.reduce((sum, p) => sum + (p.totalDays      || 0), 0);
    const overallPct = totalDays > 0
      ? Math.min((totalCompleted / totalDays) * 100, 100).toFixed(0)
      : 0;
    return { totalCompleted, totalDays, overallPct };
  }, [pills]);
}

export function getPillCompletionPct(pill) {
  if (!pill.totalDays || pill.totalDays === 0) return '0';
  return Math.min(((pill.daysCompleted || 0) / pill.totalDays) * 100, 100).toFixed(0);
}