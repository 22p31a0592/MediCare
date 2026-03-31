/**
 * App.js  ← ROOT ENTRY POINT
 *
 * ── ALARM HANDLING — ALL 3 APP STATES ───────────────────
 *
 *  State 1 — App OPEN (foreground)
 *    notifee.onForegroundEvent DELIVERED → setActiveAlarm → AlarmScreen shows
 *
 *  State 2 — App BACKGROUND
 *    fullScreenAction wakes screen → DELIVERED event fires
 *    → setActiveAlarm → AlarmScreen shows.
 *
 *  State 3 — App KILLED
 *    fullScreenAction cold-launches MainActivity.
 *    getInitialNotification() detects alarm → setActiveAlarm → AlarmScreen.
 *    Action button presses handled by onBackgroundEvent in index.js.
 *
 *  Recovery — App brought to foreground manually
 *    AppState 'active' listener checks getDisplayedNotifications()
 *    and restores AlarmScreen if a pending alarm is still showing.
 *
 * ── BUGS FIXED ───────────────────────────────────────────
 *  1. Removed duplicate AlarmAlertModal — AlarmScreen already handles this.
 *     AlarmAlertModal referenced handleMarkPillTaken which doesn't exist
 *     → "property error doesn't exist" crash.
 *
 *  2. Removed all commented-out dead code / broken useEffect structure.
 *     The mismatched comment blocks left a broken useEffect with an
 *     unclosed scope — the return unsub was inside the wrong block.
 *
 *  3. Added activeAlarmRef so AppState listener always reads latest value
 *     without stale closure.
 *
 *  4. parsePillFromNotification now wraps JSON.parse in try/catch.
 *     Raw JSON.parse(data.pill) without guard crashed on malformed data.
 *
 *  5. handleAlarmTaken now uses handleMarkTaken (which exists) not
 *     handleMarkPillTaken (which does not).
 *
 *  6. onForegroundEvent also handles ACTION_PRESS (Taken/Snooze button
 *     taps while app is open) and PRESS (notification banner tap).
 * ─────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StatusBar, AppState } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';

import { LoadingScreen }       from './src/App/LoadingScreen';
import { PageRenderer }        from './src/App/PageRenderer';
import { ModalRenderer }       from './src/App/ModalRenderer';
import { appStyles as styles } from './src/App/styles/appStyles';
import { initializeApp }       from './src/App/loaders/appLoaders';
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

import { Header }    from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';

import { AlarmScreen }     from './src/services/NotificationService/Screeen/AlarmScreen';
import notificationService from './src/services/NotificationService';

// ─────────────────────────────────────────────────────────────────────────────
// FIX 4: Safe pill parser — never throws, always returns pill or null
// ─────────────────────────────────────────────────────────────────────────────
function parsePillFromNotification(data) {
  try {
    if (!data?.pill) return null;
    return typeof data.pill === 'string' ? JSON.parse(data.pill) : data.pill;
  } catch (e) {
    console.error('[App] parsePillFromNotification error:', e);
    return null;
  }
}

export default function App() {
  const [currentPage,  setCurrentPage]  = useState('home');
  const [user,         setUser]         = useState(null);
  const [pills,        setPills]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);

  const [showAddPill,    setShowAddPill]    = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showEditName,   setShowEditName]   = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);

  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [userHealthData,    setUserHealthData]     = useState({
    symptoms: [], conditions: [], chatHistory: [],
  });

  // ── Active alarm ──────────────────────────────────────
  const [activeAlarm, setActiveAlarm] = useState(null);

  // FIX 3: Ref so AppState listener always reads latest alarm without stale closure
  const activeAlarmRef = useRef(null);
  activeAlarmRef.current = activeAlarm;

  // ── App init ──────────────────────────────────────────
  useEffect(() => {
    const pillTakenCallback = createHandlePillTakenFromNotification(setPills);
    notificationService.setOnPillTakenCallback(pillTakenCallback);
    initializeApp(
      setIsLoading, setUser, setPills, setShowNamePrompt,
      setAiRecommendations, setUserHealthData, pillTakenCallback,
    );
  }, []);

  // ── Alarm detection — all 3 states ───────────────────
  // FIX 2: Rewritten as one clean useEffect with no broken comment blocks.
  useEffect(() => {
    // STATE 3: App was KILLED — fullScreenIntent cold-launched the app
    notifee.getInitialNotification().then((initial) => {
      if (initial?.notification?.data?.type === 'alarm') {
        const pill = parsePillFromNotification(initial.notification.data);
        if (pill) {
          console.log('[App] Cold-launch alarm:', pill.name);
          setActiveAlarm(pill);
        }
      }
    });

    // STATE 1 & 2: App OPEN or BACKGROUND
    const unsub = notifee.onForegroundEvent(({ type, detail }) => {
      const data = detail?.notification?.data;
      if (!data || data.type !== 'alarm') return;

      // Alarm notification delivered → show AlarmScreen
      if (type === EventType.DELIVERED) {
        const pill = parsePillFromNotification(data);
        if (pill) {
          console.log('[App] Alarm delivered:', pill.name);
          setActiveAlarm(pill);
        }
      }

      // FIX 6: User tapped notification banner while app was backgrounded
      if (type === EventType.PRESS) {
        const pill = parsePillFromNotification(data);
        if (pill) {
          console.log('[App] Notification tapped:', pill.name);
          setActiveAlarm(pill);
        }
      }

      // FIX 6: Action button (Taken/Snooze) pressed while app is open
      // eventHandlers.js does the actual work; we just dismiss AlarmScreen here
      if (type === EventType.ACTION_PRESS) {
        const pressId = detail.pressAction?.id;
        if (pressId === 'taken' || pressId === 'snooze') {
          console.log('[App] Action pressed in foreground:', pressId);
          setActiveAlarm(null);
        }
      }
    });

    return unsub;
  }, []);

  // ── Recovery: app brought to foreground manually ──────
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (nextState !== 'active') return;
      if (activeAlarmRef.current) return; // already showing

      try {
        const displayed = await notifee.getDisplayedNotifications();
        const alarmNotif = displayed.find(n => n.notification?.data?.type === 'alarm');
        if (alarmNotif) {
          const pill = parsePillFromNotification(alarmNotif.notification.data);
          if (pill) {
            console.log('[App] Recovered pending alarm:', pill.name);
            setActiveAlarm(pill);
          }
        }
      } catch (e) {
        console.error('[App] AppState recovery error:', e);
      }
    });
    return () => sub.remove();
  }, []);

  // ── Alarm action handlers ─────────────────────────────
  // FIX 5: Uses handleMarkTaken (exists) — not handleMarkPillTaken (doesn't exist)
  const handleAlarmTaken = async () => {
    if (!activeAlarm) return;
    console.log('[App] handleAlarmTaken:', activeAlarm.name);
    try {
      await handleMarkTaken(activeAlarm._id);
      await notificationService.cancelAlarm(activeAlarm._id, activeAlarm);
      // Also dismiss from notification shade
      const displayed = await notifee.getDisplayedNotifications();
      const match = displayed.find(n => n.notification?.data?.type === 'alarm');
      if (match) await notifee.cancelNotification(match.notification.id);
    } catch (e) {
      console.error('[App] handleAlarmTaken error:', e);
    } finally {
      setActiveAlarm(null);
    }
  };

  const handleAlarmSnooze = async () => {
    if (!activeAlarm) return;
    console.log('[App] handleAlarmSnooze:', activeAlarm.name);
    try {
      await notificationService.snoozeAlarm(activeAlarm);
      const displayed = await notifee.getDisplayedNotifications();
      const match = displayed.find(n => n.notification?.data?.type === 'alarm');
      if (match) await notifee.cancelNotification(match.notification.id);
    } catch (e) {
      console.error('[App] handleAlarmSnooze error:', e);
    } finally {
      setActiveAlarm(null);
    }
  };

  // ── Handlers ──────────────────────────────────────────
  const handleSetName    = createHandleSetName(setUser, setShowNamePrompt);
  const handleUpdateName = createHandleUpdateName(user, setUser, setShowEditName);
  const handleAddPill    = createHandleAddPill(pills, setPills, setShowAddPill);
  const handleDeletePill = createHandleDeletePill(pills, setPills);
  const handleMarkTaken  = createHandleMarkPillTaken(setPills);   // ← correct name
  const handleAIRecommendations      = createHandleAIRecommendations(setAiRecommendations, setUserHealthData);
  const handleClearAIRecommendations = createHandleClearAIRecommendations(setAiRecommendations, setUserHealthData);
  const handleReset = createHandleReset(
    setUser, setPills, setAiRecommendations,
    setUserHealthData, setCurrentPage, setShowNamePrompt,
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1d4ed8" />

      <Header user={user} onEditName={() => setShowEditName(true)} onReset={handleReset} />

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

      <BottomNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onAddPill={() => setShowAddPill(true)}
      />

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

      {/* ── ALARM SCREEN — over everything, cannot be dismissed ── */}
      {/* FIX 1: Removed duplicate AlarmAlertModal that caused the crash.
          AlarmScreen already handles all alarm UI. AlarmAlertModal was
          calling handleMarkPillTaken which does not exist → property error. */}
      <AlarmScreen
        visible={!!activeAlarm}
        pill={activeAlarm}
        onTaken={handleAlarmTaken}
        onSnooze={handleAlarmSnooze}
      />
    </View>
  );
}