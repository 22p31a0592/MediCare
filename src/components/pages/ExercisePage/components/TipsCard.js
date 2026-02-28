/**
 * pages/ExercisePage/components/TipsCard.js
 * ─────────────────────────────────────────────────────────
 * Blue card with general exercise tips.
 * Adds an AI-specific tip when AI recs are active.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GENERAL_TIPS } from '../constants/exerciseData';

export function TipsCard({ hasAI }) {
  const tips = hasAI
    ? [...GENERAL_TIPS, 'Prioritise your AI-personalised exercises on days when you feel well']
    : GENERAL_TIPS;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>💡 Exercise Tips</Text>
      {tips.map((tip, i) => (
        <Text key={i} style={styles.tip}>• {tip}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 3, borderLeftColor: '#3b82f6',
    marginHorizontal: 12, marginBottom: 10,
    padding: 14, borderRadius: 10,
  },
  title: { fontSize: 15, fontWeight: '700', color: '#1e3a8a', marginBottom: 10 },
  tip:   { fontSize: 13, color: '#1e40af', lineHeight: 22 },
});