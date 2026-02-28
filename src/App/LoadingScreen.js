/**
 * App/LoadingScreen.js
 * ─────────────────────────────────────────────────────────
 * Full-screen loading UI shown while the app initializes.
 * Extracted from App.js so the splash logic is self-contained.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, ActivityIndicator, StatusBar } from 'react-native';
import { appStyles as styles } from './styles/appStyles';

export function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <Text style={styles.loadingTitle}>MediCare</Text>
      <ActivityIndicator size="large" color="#1d4ed8" style={styles.loader} />
      <Text style={styles.loadingText}>Setting up your health tracker...</Text>
    </View>
  );
}