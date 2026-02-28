/**
 * pages/HomePage/useHomeState.js
 * ─────────────────────────────────────────────────────────
 * Custom hook: all state + derived values for HomePage.
 * Keeps the main file free of useState/useMemo boilerplate.
 * ─────────────────────────────────────────────────────────
 */

import { useState } from 'react';

export function useHomeState(pills) {
  const [showAIChat, setShowAIChat] = useState(false);

  // ── Derived stats ───────────────────────────────────────

  /** Total pill count across all medications */
  const totalPills = pills.reduce((sum, p) => sum + (p.quantity || 0), 0);

  /** Minimum remaining treatment days across all pills */
  const daysRemaining =
    pills.length > 0
      ? Math.min(
          ...pills.map((p) => {
            const rem = (p.totalDays || 0) - (p.daysCompleted || 0);
            return rem > 0 ? rem : 0;
          })
        )
      : 0;

  /** Count of pills that have alarms enabled */
  const alarmsSet = pills.filter((p) => p.alarmEnabled).length;

  return {
    // State
    showAIChat,
    setShowAIChat,
    // Derived
    totalPills,
    daysRemaining,
    alarmsSet,
  };
}