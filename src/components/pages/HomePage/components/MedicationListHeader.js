/**
 * pages/HomePage/components/MedicationListHeader.js
 * ─────────────────────────────────────────────────────────
 * Section label row above the medication cards list.
 * Shows "Medications" title and count badge.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';

export function MedicationListHeader({ count }) {
  return (
    <View style={styles.container}>
      <Info size={16} color="#374151" />
      <Text style={styles.title}>Medications</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
});