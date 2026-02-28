/**
 * App/loaders/appLoaders.js
 * ─────────────────────────────────────────────────────────
 * Data loading functions called during app initialization.
 * Separated from handlers so loading logic is easy to find
 * and test independently.
 * ─────────────────────────────────────────────────────────
 */

import { Alert } from 'react-native';
import storageService from '../../services/storageService';
import notificationService from '../../services/NotificationService/index';

/**
 * Load user + pills from storage.
 * Returns true if user exists, false if first-time setup needed.
 */
export const loadUserData = async (setUser, setPills, setShowNamePrompt) => {
  try {
    const userData = await storageService.getUser();
    const pillsData = await storageService.getPills();

    if (userData) {
      setUser(userData);
      setPills(pillsData || []);

      // Re-schedule alarms for all pills that have them enabled
      if (pillsData && pillsData.length > 0) {
        for (const pill of pillsData) {
          if (pill.alarmEnabled) {
            await notificationService.scheduleAlarm(pill);
          }
        }
      }
      return true;
    } else {
      setShowNamePrompt(true);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to load user data:', error);
    Alert.alert('Error', 'Failed to load your data.');
    setShowNamePrompt(true);
    return false;
  }
};

/**
 * Load previously saved AI recommendations from storage.
 */
export const loadAIRecommendations = async (setAiRecommendations, setUserHealthData) => {
  try {
    const saved = await storageService.getAIRecommendations();
    if (saved) {
      setAiRecommendations(saved);
      setUserHealthData((prev) => ({
        ...prev,
        symptoms: saved.symptoms || [],
        conditions: saved.conditions || [],
        chatHistory: saved.chatHistory || [],
      }));
    }
  } catch (error) {
    console.error('Error loading AI recommendations:', error);
  }
};

/**
 * Full app initialization sequence.
 * Runs on mount — initializes services, loads all data, resets daily status.
 */
export const initializeApp = async (
  setIsLoading,
  setUser,
  setPills,
  setShowNamePrompt,
  setAiRecommendations,
  setUserHealthData,
  pillTakenCallback
) => {
  try {
    setIsLoading(true);

    // 1. Boot notification service & register callback
    await notificationService.initialize();
    notificationService.setOnPillTakenCallback(pillTakenCallback);

    // 2. Load user + pills
    await loadUserData(setUser, setPills, setShowNamePrompt);

    // 3. Load saved AI recommendations
    await loadAIRecommendations(setAiRecommendations, setUserHealthData);

    // 4. Reset "taken today" flags for new day
    await storageService.resetDailyStatus();

    console.log('✅ App initialized');
  } catch (error) {
    console.error('❌ App init error:', error);
    Alert.alert('Error', 'Failed to initialize app. Please restart.');
  } finally {
    setIsLoading(false);
  }
};