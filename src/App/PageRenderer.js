/**
 * App/PageRenderer.js
 * ─────────────────────────────────────────────────────────
 * Decides which page component to render based on currentPage.
 * Centralising this keeps App.js free of JSX conditionals.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { HomePage } from '../components/pages/HomePage/index';
import { DietPage } from '../components/pages/DietPage/index';
import { ExercisePage } from '../components/pages/ExercisePage/index';
import { ProfilePage } from '../components/pages/ProfilePage/index';

export function PageRenderer({
  currentPage,
  // shared props
  user,
  pills,
  aiRecommendations,
  userHealthData,
  // HomePage handlers
  onDeletePill,
  onMarkTaken,
  onAIRecommendations,
  onClearAIRecommendations,
  // ProfilePage handlers
  onEditName,
  onSettings,
}) {
  switch (currentPage) {
    case 'home':
      return (
        <HomePage
          pills={pills}
          user={user}
          aiRecommendations={aiRecommendations}
          onDeletePill={onDeletePill}
          onMarkTaken={onMarkTaken}
          onAIRecommendations={onAIRecommendations}
          onClearAIRecommendations={onClearAIRecommendations}
        />
      );

    case 'diet':
      return (
        <DietPage
          user={user}
          aiRecommendations={aiRecommendations}
          userHealthData={userHealthData}
        />
      );

    case 'exercise':
      return (
        <ExercisePage
          user={user}
          aiRecommendations={aiRecommendations}
          userHealthData={userHealthData}
        />
      );

    case 'profile':
      return (
        <ProfilePage
          user={user}
          pillCount={pills.length}
          pills={pills}
          onEditName={onEditName}
          onSettings={onSettings}
        />
      );

    default:
      return null;
  }
}