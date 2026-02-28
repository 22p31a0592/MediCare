/**
 * App.js  ← ROOT ENTRY POINT
 * ─────────────────────────────────────────────────────────
 * All logic lives in sub-modules under src/App/:
 *
 *  App/handlers/appHandlers.js   ← all event callbacks
 *  App/loaders/appLoaders.js     ← data loading on startup
 *  App/styles/appStyles.js       ← StyleSheet
 *  App/LoadingScreen.js          ← splash screen UI
 *  App/PageRenderer.js           ← which page to show
 *  App/ModalRenderer.js          ← which modals to show
 * ─────────────────────────────────────────────────────────
 */

// ── React & React Native ──────────────────────────────────
import React, { useState, useEffect } from 'react';
import { View, StatusBar } from 'react-native';

// ── App sub-modules ───────────────────────────────────────
import { LoadingScreen }       from './src/App/LoadingScreen';
import { PageRenderer }        from './src/App/PageRenderer';
import { ModalRenderer }       from './src/App/ModalRenderer';
import { appStyles as styles } from './src/App/styles/appStyles';

// ── Loaders ───────────────────────────────────────────────
import { initializeApp } from './src/App/loaders/appLoaders';

// ── Handlers ──────────────────────────────────────────────
import {
  createHandleSetName,
  createHandleUpdateName,
  createHandleAddPill,
  createHandleDeletePill,
  createHandleMarkPillTaken,
  createHandlePillTakenFromNotification,
  createHandleAIRecommendations,
  createHandleClearAIRecommendations,
  createHandleReset,
} from './src/App/handlers/appHandlers';

// ── Shared components ─────────────────────────────────────
import { Header }    from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';

// ─────────────────────────────────────────────────────────

export default function App() {

  // ── State ───────────────────────────────────────────────
  const [currentPage,    setCurrentPage]    = useState('home');
  const [user,           setUser]           = useState(null);
  const [pills,          setPills]          = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);

  // Modal visibility
  const [showAddPill,    setShowAddPill]    = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showEditName,   setShowEditName]   = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);

  // AI state
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [userHealthData,    setUserHealthData]     = useState({
    symptoms: [], conditions: [], chatHistory: [],
  });

  // ── Initialization (runs once on mount) ─────────────────
  useEffect(() => {
    const pillTakenCallback = createHandlePillTakenFromNotification(setPills);

    initializeApp(
      setIsLoading,
      setUser,
      setPills,
      setShowNamePrompt,
      setAiRecommendations,
      setUserHealthData,
      pillTakenCallback,
    );
  }, []);

  // ── Handlers ────────────────────────────────────────────
  const handleSetName    = createHandleSetName(setUser, setShowNamePrompt);
  const handleUpdateName = createHandleUpdateName(user, setUser, setShowEditName);
  const handleAddPill    = createHandleAddPill(pills, setPills, setShowAddPill);
  const handleDeletePill = createHandleDeletePill(pills, setPills);
  const handleMarkTaken  = createHandleMarkPillTaken(setPills);

  const handleAIRecommendations      = createHandleAIRecommendations(setAiRecommendations, setUserHealthData);
  const handleClearAIRecommendations = createHandleClearAIRecommendations(setAiRecommendations, setUserHealthData);

  const handleReset = createHandleReset(
    setUser, setPills, setAiRecommendations,
    setUserHealthData, setCurrentPage, setShowNamePrompt,
  );

  // ── Render ──────────────────────────────────────────────
  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1d4ed8" />

      {/* Top bar */}
      <Header
        user={user}
        onEditName={() => setShowEditName(true)}
        onReset={handleReset}
      />

      {/* Active page */}
      <View style={styles.content}>
        <PageRenderer
          currentPage={currentPage}
          user={user}
          pills={pills}
          aiRecommendations={aiRecommendations}
          userHealthData={userHealthData}
          onDeletePill={handleDeletePill}
          onMarkTaken={handleMarkTaken}
          onAIRecommendations={handleAIRecommendations}
          onClearAIRecommendations={handleClearAIRecommendations}
          onEditName={() => setShowEditName(true)}
          onSettings={() => setShowSettings(true)}
        />
      </View>

      {/* Bottom navigation */}
      <BottomNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onAddPill={() => setShowAddPill(true)}
      />

      {/* All modals */}
      <ModalRenderer
        showNamePrompt={showNamePrompt}
        showEditName={showEditName}
        showAddPill={showAddPill}
        showSettings={showSettings}
        user={user}
        onSetName={handleSetName}
        onUpdateName={handleUpdateName}
        onAddPill={handleAddPill}
        onReset={handleReset}
        onCloseEditName={() => setShowEditName(false)}
        onCloseAddPill={() => setShowAddPill(false)}
        onCloseSettings={() => setShowSettings(false)}
      />
    </View>
  );
}