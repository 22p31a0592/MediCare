/**
 * pages/ProfilePage/components/AccountInfo.js
 * ─────────────────────────────────────────────────────────
 * Account details card: member since, total tracked, active days.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function AccountInfo({ user, pillCount }) {
  const getMemberDays = () => {
    if (!user?.createdAt) return 0;
    return Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Account Information</Text>

      <InfoRow label="Member since"              value={formatDate(user?.createdAt)} />
      <InfoRow label="Total medications tracked" value={`${pillCount}`} />
      <InfoRow label="Days active"               value={`${getMemberDays()} days`} isLast />
    </View>
  );
}

function InfoRow({ label, value, isLast }) {
  return (
    <View style={[styles.row, isLast && styles.lastRow]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastRow: { borderBottomWidth: 0 },
  label: { fontSize: 13, color: '#6b7280' },
  value: { fontSize: 13, fontWeight: '600', color: '#111827' },
});