/**
 * App.js  ← ROOT ENTRY POINT
 *
 * ── ALARM CHANGES ────────────────────────────────────────
 *  Supports alarm firing in ALL 3 app states:
 *   1. App OPEN (foreground)  → onForegroundEvent DELIVERED
 *   2. App BACKGROUND         → onForegroundEvent DELIVERED
 *   3. App KILLED/CLOSED      → getInitialNotification() on cold launch
 *
 *  Also handles notification action button presses (Taken/Snooze)
 *  when app is in background via onBackgroundEvent (registered in index.js).
 */

import React, { useState, useEffect } from 'react';
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
// Helper — safely parse pill JSON from notification data
// ─────────────────────────────────────────────────────────────────────────────
function parsePillFromNotification(data) {
  try {
    if (!data?.pill) return null;
    return typeof data.pill === 'string' ? JSON.parse(data.pill) : data.pill;
  } catch (e) {
    console.error('[AlarmScreen] parsePillFromNotification error:', e);
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

  // ── Active alarm state ────────────────────────────────
  const [activeAlarm, setActiveAlarm] = useState(null);

  // ─────────────────────────────────────────────────────
  // App init
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    const pillTakenCallback = createHandlePillTakenFromNotification(setPills);
    initializeApp(
      setIsLoading, setUser, setPills, setShowNamePrompt,
      setAiRecommendations, setUserHealthData, pillTakenCallback,
    );
  }, []);

  // ─────────────────────────────────────────────────────
  // ALARM DETECTION — covers all 3 app states
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    // ── STATE 3: App was KILLED — alarm fullScreenIntent cold-launched app ──
    notifee.getInitialNotification().then((initial) => {
      if (initial?.notification?.data?.type === 'alarm') {
        const pill = parsePillFromNotification(initial.notification.data);
        if (pill) {
          console.log('[AlarmScreen] Cold launch alarm detected:', pill.name);
          setActiveAlarm(pill);
        }
      }
    });

    // ── STATE 1 & 2: App OPEN or BACKGROUND — alarm delivered ──
    const unsub = notifee.onForegroundEvent(({ type, detail }) => {
      const data = detail.notification?.data;

      // Alarm delivered (fires even when app is backgrounded)
      if (type === EventType.DELIVERED && data?.type === 'alarm') {
        const pill = parsePillFromNotification(data);
        if (pill) {
          console.log('[AlarmScreen] Foreground/BG alarm delivered:', pill.name);
          setActiveAlarm(pill);
        }
        return;
      }

      // Action button pressed while app is in foreground
      if (type === EventType.ACTION_PRESS && data?.type === 'alarm') {
        const pill = parsePillFromNotification(data);
        if (!pill) return;

        if (detail.pressAction?.id === 'taken') {
          console.log('[AlarmScreen] Taken pressed (foreground action)');
          handleMarkTaken(pill._id).catch(console.error);
          notificationService.cancelAlarm(pill._id, pill).catch(console.error);
          setActiveAlarm(null);
        } else if (detail.pressAction?.id === 'snooze') {
          console.log('[AlarmScreen] Snooze pressed (foreground action)');
          notificationService.snoozeAlarm(pill).catch(console.error);
          setActiveAlarm(null);
        }
        return;
      }

      // App was in background, user tapped the notification banner → open alarm screen
      if (type === EventType.PRESS && data?.type === 'alarm') {
        const pill = parsePillFromNotification(data);
        if (pill) {
          console.log('[AlarmScreen] Notification tapped from background:', pill.name);
          setActiveAlarm(pill);
        }
      }
    });

    return unsub;
  }, []);

  // Re-check when app comes back to foreground (user may have dismissed via swipe etc.)
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        // If there's no active alarm showing, check for any pending alarm notifications
        if (!activeAlarm) {
          try {
            const displayed = await notifee.getDisplayedNotifications();
            const alarmNotif = displayed.find(n => n.notification?.data?.type === 'alarm');
            if (alarmNotif) {
              const pill = parsePillFromNotification(alarmNotif.notification.data);
              if (pill) {
                console.log('[AlarmScreen] Recovered pending alarm on foreground:', pill.name);
                setActiveAlarm(pill);
              }
            }
          } catch (e) {
            console.error('[AlarmScreen] AppState recovery error:', e);
          }
        }
      }
    });
    return () => sub.remove();
  }, [activeAlarm]);

  // ─────────────────────────────────────────────────────
  // ALARM ACTION HANDLERS
  // ─────────────────────────────────────────────────────
  const handleAlarmTaken = async () => {
    if (!activeAlarm) return;
    console.log('[AlarmScreen] handleAlarmTaken:', activeAlarm.name);
    try {
      await handleMarkTaken(activeAlarm._id);
      await notificationService.cancelAlarm(activeAlarm._id, activeAlarm);
      // Cancel the displayed notification so it disappears from shade
      const displayed = await notifee.getDisplayedNotifications();
      const match = displayed.find(n => n.notification?.data?.type === 'alarm');
      if (match) await notifee.cancelNotification(match.notification.id);
    } catch (e) {
      console.error('[AlarmScreen] handleAlarmTaken error:', e);
    } finally {
      setActiveAlarm(null);
    }
  };

  const handleAlarmSnooze = async () => {
    if (!activeAlarm) return;
    console.log('[AlarmScreen] handleAlarmSnooze:', activeAlarm.name);
    try {
      await notificationService.snoozeAlarm(activeAlarm);
      // Cancel current displayed notification
      const displayed = await notifee.getDisplayedNotifications();
      const match = displayed.find(n => n.notification?.data?.type === 'alarm');
      if (match) await notifee.cancelNotification(match.notification.id);
    } catch (e) {
      console.error('[AlarmScreen] handleAlarmSnooze error:', e);
    } finally {
      setActiveAlarm(null);
    }
  };

  // ─────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────
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

      {/* ── ALARM SCREEN ── renders over everything when alarm fires ── */}
      <AlarmScreen
        visible={!!activeAlarm}
        pill={activeAlarm}
        onTaken={handleAlarmTaken}
        onSnooze={handleAlarmSnooze}
      />
    </View>
  );
}