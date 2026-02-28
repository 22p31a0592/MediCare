/**
 * pages/DietPage/components/AIActiveBadge.js
 * ─────────────────────────────────────────────────────────
 * Purple badge shown when AI recommendations are active.
 * Displays confidence % and detected condition count.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';

export function AIActiveBadge({ aiRecommendations, userHealthData }) {
  if (!aiRecommendations) return null;

  const conditionCount = userHealthData?.conditions?.length || 0;

  return (
    <View style={styles.badge}>
      <Sparkles size={18} color="#7c3aed" />
      <View style={styles.text}>
        <Text style={styles.title}>AI Analysis Active</Text>
        <Text style={styles.sub}>
          Confidence: {aiRecommendations.confidence || 0}%
          {conditionCount > 0
            ? `  ·  ${conditionCount} condition${conditionCount > 1 ? 's' : ''} detected`
            : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#ede9fe',
    borderLeftWidth: 3, borderLeftColor: '#7c3aed',
    marginHorizontal: 12, marginBottom: 10,
    padding: 12, borderRadius: 10,
  },
  text:  { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: '#5b21b6', marginBottom: 2 },
  sub:   { fontSize: 11, color: '#6d28d9' },
});