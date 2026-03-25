/**
 * pages/HomePage/useHomeState.js
 *
 * FIXES:
 *  1. totalMeds   → was sum of pill.quantity (e.g. 30+30=60, wrong)
 *                   now = number of distinct medications (e.g. 2)
 *
 *  2. daysRemaining → was Math.min() — showed only the shortest pill's days
 *                     now = SUM of remaining days across all pills
 */

import { useState } from 'react';

export function useHomeState(pills) {
  const [showAIChat, setShowAIChat] = useState(false);

  // Count of distinct medications, not sum of their quantities
  const totalMeds = pills.length;

  // Total remaining treatment days across ALL pills combined
  const daysRemaining =
    pills.length > 0
      ? pills.reduce((sum, p) => {
          const rem = (p.totalDays || 0) - (p.daysCompleted || 0);
          return sum + (rem > 0 ? rem : 0);
        }, 0)
      : 0;

  const alarmsSet = pills.filter((p) => p.alarmEnabled).length;

  return {
    showAIChat, setShowAIChat,
    totalMeds,
    daysRemaining,
    alarmsSet,
  };
}