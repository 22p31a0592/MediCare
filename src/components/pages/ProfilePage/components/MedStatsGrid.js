/**
 * pages/ProfilePage/components/MedStatsGrid.js
 *
 * FIX: Days Progress uses SUM(totalDays), not MAX(totalDays) × count.
 *   Pill A=20d, Pill B=14d → shows X/34d  ✅  (was X/40d ❌)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity, Calendar } from 'lucide-react-native';

export function MedStatsGrid({ pillCount, pills }) {
  const totalCompleted = pills ? pills.reduce((sum, p) => sum + (p.daysCompleted || 0), 0) : 0;
  const totalDays      = pills ? pills.reduce((sum, p) => sum + (p.totalDays      || 0), 0) : 0;
  const displayTotal   = totalDays > 0 ? `${totalCompleted}/${totalDays}d` : '—';

  return (
    <View style={styles.grid}>
      <StatCard iconBg="#eff6ff" Icon={<Activity size={20} color="#1d4ed8" />} value={pillCount} label="Active Meds" />
      <StatCard iconBg="#dcfce7" Icon={<Calendar size={20} color="#16a34a" />} value={displayTotal} label="Days Progress" />
    </View>
  );
}

function StatCard({ iconBg, Icon, value, label }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{Icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  iconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  value:   { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 3 },
  label:   { fontSize: 11, color: '#6b7280', textAlign: 'center' },
});