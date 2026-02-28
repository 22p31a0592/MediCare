/**
 * pages/HomePage/components/StatsBar.js
 * ─────────────────────────────────────────────────────────
 * Top stats row: Days Left · Total Pills · Alarms Set
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Activity, Bell } from 'lucide-react-native';

export function StatsBar({ daysRemaining, totalPills, alarmsSet }) {
  return (
    <View style={styles.container}>
      <StatItem icon={<Calendar size={18} color="#7c3aed" />} value={daysRemaining} label="Days Left" />
      <View style={styles.divider} />
      <StatItem icon={<Activity size={18} color="#059669" />} value={totalPills} label="Total Pills" />
      <View style={styles.divider} />
      <StatItem icon={<Bell size={18} color="#dc2626" />} value={alarmsSet} label="Alarms Set" />
    </View>
  );
}

function StatItem({ icon, value, label }) {
  return (
    <View style={styles.statBox}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
  },
});