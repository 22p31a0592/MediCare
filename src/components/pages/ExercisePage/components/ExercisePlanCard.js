/**
 * pages/ExercisePage/components/ExercisePlanCard.js
 * ─────────────────────────────────────────────────────────
 * Renders a single exercise plan card (generic or AI).
 * Each card shows a list of exercises with intensity badges.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Timer, Sparkles } from 'lucide-react-native';
import { INTENSITY_COLORS } from '../constants/exerciseData';

export function ExercisePlanCard({ plan }) {
  const Icon = plan.icon;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: plan.bgColor }]}>
          <Icon size={22} color={plan.color} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{plan.category}</Text>
          {plan.isAI && (
            <View style={styles.aiTag}>
              <Sparkles size={10} color="#7c3aed" />
              <Text style={styles.aiTagText}>AI Customised</Text>
            </View>
          )}
        </View>
      </View>

      {/* Exercise rows */}
      <View style={styles.list}>
        {plan.exercises.map((ex, i) => {
          const intensityColor = INTENSITY_COLORS[ex.intensity] || '#6b7280';
          return (
            <View key={i} style={styles.exRow}>
              <View style={styles.exInfo}>
                <Text style={styles.exName}>{ex.name}</Text>
                <View style={styles.exMeta}>
                  <Timer size={12} color="#6b7280" />
                  <Text style={styles.exDuration}>{ex.duration}</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: intensityColor + '22' }]}>
                <Text style={[styles.badgeText, { color: intensityColor }]}>
                  {ex.intensity}
                </Text>
              </View>
            </View>
          );
        })}
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
  header: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  titleWrap: { flex: 1 },
  title:     { fontSize: 16, fontWeight: '700', color: '#111827' },
  aiTag:     { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  aiTagText: { fontSize: 10, fontWeight: '600', color: '#7c3aed' },

  list: { gap: 8 },
  exRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f9fafb', borderRadius: 10, padding: 11,
  },
  exInfo:    { flex: 1 },
  exName:    { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 3 },
  exMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exDuration:{ fontSize: 12, color: '#6b7280' },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});