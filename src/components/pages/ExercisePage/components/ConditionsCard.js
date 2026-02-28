/**
 * pages/ExercisePage/components/ConditionsCard.js
 * ─────────────────────────────────────────────────────────
 * Yellow warning card listing conditions the AI exercise
 * plan has been tailored for.
 * Only shown when AI recommendations are active.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';

export function ConditionsCard({ conditions }) {
  if (!conditions || conditions.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>⚠️ Exercise Considerations</Text>
      <Text style={styles.sub}>Your plan accounts for:</Text>
      {conditions.map((c, i) => (
        <View key={i} style={styles.row}>
          <Activity size={13} color="#f59e0b" />
          <Text style={styles.condText}>{c.name || c}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fef9c3',
    borderLeftWidth: 3, borderLeftColor: '#f59e0b',
    marginHorizontal: 12, marginBottom: 10,
    padding: 14, borderRadius: 10,
  },
  title:    { fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  sub:      { fontSize: 12, color: '#78350f', marginBottom: 8 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 },
  condText: { fontSize: 13, fontWeight: '600', color: '#92400e' },
});