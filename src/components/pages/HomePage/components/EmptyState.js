/**
 * pages/HomePage/components/EmptyState.js
 * ─────────────────────────────────────────────────────────
 * Shown when the user has no medications added yet.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';

export function EmptyState() {
  return (
    <View style={styles.container}>
      <Activity size={44} color="#d1d5db" />
      <Text style={styles.title}>No Medications Yet</Text>
      <Text style={styles.desc}>
        Tap the + button below to add your first medication
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
  },
  desc: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});