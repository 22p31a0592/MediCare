/**
 * modals/AIChatInterface/components/TopicBar.js
 * ─────────────────────────────────────────────────────────
 * Horizontal row of pills showing the 3 allowed chat topics.
 * Visual reminder that Diet / Exercise are handled elsewhere.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TOPICS = [
  { icon: '🩺', label: 'Symptoms & Disease' },
  { icon: '💊', label: 'Medication'         },
  { icon: '🏥', label: 'See a Doctor'       },
];

export function TopicBar() {
  return (
    <View style={styles.bar}>
      {TOPICS.map((t) => (
        <View key={t.label} style={styles.pill}>
          <Text style={styles.pillText}>{t.icon} {t.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection:     'row',
    backgroundColor:   '#fff',
    paddingHorizontal: 12,
    paddingVertical:   8,
    gap:               7,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pill: {
    flex:             1,
    backgroundColor:  '#eff6ff',
    borderRadius:     8,
    paddingVertical:  5,
    alignItems:       'center',
    borderWidth:      1,
    borderColor:      '#bfdbfe',
  },
  pillText: { fontSize: 10, fontWeight: '700', color: '#1d4ed8' },
});