/**
 * App/handlers/appHandlers.js
 * ─────────────────────────────────────────────────────────
 * All event handler functions for the root App.
 * Each handler is a factory that receives setState setters
 * and returns the actual handler function.
 * ─────────────────────────────────────────────────────────
 */

import { Alert } from 'react-native';
import storageService from '../../services/storageService';
import notificationService from '../../services/NotificationService/index';

// ─── User Handlers ────────────────────────────────────────

export const createHandleSetName = (setUser, setShowNamePrompt) => async (name) => {
  try {
    const userData = {
      name,
      createdAt: new Date().toISOString(),
    };
    await storageService.setUser(userData);
    setUser(userData);
    setShowNamePrompt(false);
  } catch (error) {
    console.error('Error setting name:', error);
    Alert.alert('Error', 'Failed to save your name.');
  }
};

export const createHandleUpdateName = (user, setUser, setShowEditName) => async (name) => {
  try {
    const updatedUser = { ...user, name };
    await storageService.setUser(updatedUser);
    setUser(updatedUser);
    setShowEditName(false);
  } catch (error) {
    console.error('Error updating name:', error);
    Alert.alert('Error', 'Failed to update your name.');
  }
};

// ─── Pill Handlers ────────────────────────────────────────

export const createHandleAddPill = (pills, setPills, setShowAddPill) => async (pillData) => {
  try {
    console.log('💊 Adding new medication:', pillData.name);

    const newPill = await storageService.addPill(pillData);
    setPills([...pills, newPill]);
    setShowAddPill(false);

    if (newPill.alarmEnabled) {
      const success = await notificationService.scheduleAlarm(newPill);
      Alert.alert(
        success ? '✅ Medication Added!' : '⚠️ Alarm Setup Failed',
        success
          ? `${newPill.name} added.\nAlarm set for ${newPill.alarmTime} (${newPill.alarmToneLabel || 'Default'}).`
          : `${newPill.name} added but alarm could not be scheduled.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('✅ Success', `${newPill.name} has been added!`);
    }
  } catch (error) {
    console.error('❌ Error adding pill:', error);
    Alert.alert('Error', 'Failed to add medication. Please try again.');
  }
};

export const createHandleDeletePill = (pills, setPills) => (pillId) => {
  Alert.alert(
    'Delete Medication',
    'Are you sure you want to remove this medication?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationService.cancelAlarm(pillId);
            await storageService.deletePill(pillId);
            setPills(pills.filter((p) => p._id !== pillId));
          } catch (error) {
            console.error('❌ Error deleting pill:', error);
            Alert.alert('Error', 'Failed to delete medication.');
          }
        },
      },
    ]
  );
};

export const createHandleMarkPillTaken = (setPills) => async (pillId) => {
  try {
    const updatedPill = await storageService.markPillAsTaken(pillId);
    if (updatedPill) {
      setPills((prev) => prev.map((p) => (p._id === pillId ? updatedPill : p)));
      Alert.alert('✅ Marked as Taken', `${updatedPill.name} marked as taken for today.`, [
        { text: 'OK' },
      ]);
    }
  } catch (error) {
    console.error('Error marking pill as taken:', error);
    Alert.alert('Error', 'Failed to mark pill as taken.');
  }
};

// Called when user taps "Taken" on a notification (background/foreground)
export const createHandlePillTakenFromNotification = (setPills) => async (pillId) => {
  try {
    const updatedPill = await storageService.markPillAsTaken(pillId);
    if (updatedPill) {
      setPills((prev) => prev.map((p) => (p._id === pillId ? updatedPill : p)));
    }
  } catch (error) {
    console.error('❌ Error marking pill as taken from notification:', error);
  }
};

// ─── AI Recommendation Handlers ───────────────────────────

export const createHandleAIRecommendations = (
  setAiRecommendations,
  setUserHealthData
) => async (recommendations) => {
  try {
    setAiRecommendations(recommendations);
    setUserHealthData((prev) => ({
      ...prev,
      symptoms: recommendations.symptoms || prev.symptoms,
      conditions: recommendations.conditions || prev.conditions,
      chatHistory: recommendations.chatHistory || prev.chatHistory,
    }));
    await storageService.saveAIRecommendations(recommendations);
  } catch (error) {
    console.error('Error saving AI recommendations:', error);
  }
};

export const createHandleClearAIRecommendations = (
  setAiRecommendations,
  setUserHealthData
) => async () => {
  try {
    await storageService.clearAIRecommendations();
    setAiRecommendations(null);
    setUserHealthData({ symptoms: [], conditions: [], chatHistory: [] });
  } catch (error) {
    console.error('Error clearing AI recommendations:', error);
  }
};

// ─── Reset Handler ────────────────────────────────────────

export const createHandleReset = (
  setUser,
  setPills,
  setAiRecommendations,
  setUserHealthData,
  setCurrentPage,
  setShowNamePrompt
) => async () => {
  try {
    await notificationService.cancelAllAlarms();
    await storageService.clearAllData();
    setUser(null);
    setPills([]);
    setAiRecommendations(null);
    setUserHealthData({ symptoms: [], conditions: [], chatHistory: [] });
    setCurrentPage('home');
    setShowNamePrompt(true);
  } catch (error) {
    console.error('❌ Error resetting app:', error);
    Alert.alert('Error', 'Failed to reset app data.');
  }
};