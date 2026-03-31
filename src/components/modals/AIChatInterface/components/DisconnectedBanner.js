/**
 * modals/AIChatInterface/components/DisconnectedBanner.js
 * ─────────────────────────────────────────────────────────
 * Red banner shown when backend connection is lost.
 * Tapping it retries the connection.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { API_BASE_URL } from '../../../../config/api';

export function DisconnectedBanner({ onRetry }) {
  return (
    <TouchableOpacity style={styles.banner} onPress={onRetry}>
      <AlertCircle size={15} color="#dc2626" />
      <Text style={styles.text}>Not connected — tap to retry</Text>
    </TouchableOpacity>
  );
}

export function DebugBanner() {
  if (!__DEV__) return null;
  return (
    <View style={styles.debug}>
      <Text style={styles.debugText}>🔧 {API_BASE_URL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor:   '#fee2e2',
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    padding:           10,
    borderBottomWidth: 1,
    borderBottomColor: '#fca5a5',
  },
  text: { fontSize: 13, color: '#991b1b', fontWeight: '500' },

  debug: {
    backgroundColor: '#fef9c3',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#fbbf24',
  },
  debugText: {
    fontSize: 10,
    color:    '#92400e',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});