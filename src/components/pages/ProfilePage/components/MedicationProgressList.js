/**
 * pages/ProfilePage/components/MedicationProgressList.js
 * ─────────────────────────────────────────────────────────
 * Per-pill progress bars with overall summary badge.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useMedicationProgress, getPillCompletionPct } from '../useMedicationProgress';

export function MedicationProgressList({ pills }) {
  const { overallPct } = useMedicationProgress(pills);

  if (!pills || pills.length === 0) return null;

  return (
    <View style={styles.card}>
      {/* Overall header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Calendar size={18} color="#1d4ed8" />
          <Text style={styles.title}>Medication Progress</Text>
        </View>
        <Text style={styles.badge}>{overallPct}% overall</Text>
      </View>

      {/* Per-pill rows */}
      {pills.map((pill) => {
        const pct = getPillCompletionPct(pill);
        return (
          <View key={pill._id} style={styles.pillItem}>
            <View style={styles.pillHeader}>
              <Text style={styles.pillName}>{pill.name}</Text>
              <Text style={styles.pillDays}>
                {pill.daysCompleted || 0}/{pill.totalDays || 0} days
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.pctText}>{pct}% complete</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillItem: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  pillName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  pillDays: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#1d4ed8',
    borderRadius: 3,
  },
  pctText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'right',
  },
});