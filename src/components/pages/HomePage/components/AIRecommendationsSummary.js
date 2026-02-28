/**
 * pages/HomePage/components/AIRecommendationsSummary.js
 * ─────────────────────────────────────────────────────────
 * Collapsible summary card shown when AI recommendations
 * are active. Shows confidence %, diet tips, exercise count,
 * and a Clear button.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';

export function AIRecommendationsSummary({ aiRecommendations, onClear }) {
  if (!aiRecommendations) return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={16} color="#7c3aed" />
          <Text style={styles.title}>AI Analysis Active</Text>
        </View>
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCell value={`${aiRecommendations.confidence || 0}%`} label="Confidence" />
        <View style={styles.divider} />
        <StatCell value={aiRecommendations.dietRecommendations?.length || 0} label="Diet Tips" />
        <View style={styles.divider} />
        <StatCell value={aiRecommendations.exerciseRecommendations?.length || 0} label="Exercises" />
      </View>

      <Text style={styles.note}>View recommendations in Diet & Exercise tabs</Text>
    </View>
  );
}

function StatCell({ value, label }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
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
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  clearBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 9,
    padding: 10,
    marginBottom: 8,
  },
  divider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  note: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});