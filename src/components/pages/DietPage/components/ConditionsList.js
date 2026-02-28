/**
 * pages/DietPage/components/ConditionsList.js
 * ─────────────────────────────────────────────────────────
 * Shows the health conditions detected by the AI.
 * Only rendered when AI recommendations are active.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ConditionsList({ conditions }) {
  if (!conditions || conditions.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🩺 Your Health Conditions</Text>
      <View style={styles.tags}>
        {conditions.map((c, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{c.name || c}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12, marginBottom: 10,
    padding: 14, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  title: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 8 },
  tags:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:   { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
  tagText: { fontSize: 12, fontWeight: '600', color: '#1e40af' },
});