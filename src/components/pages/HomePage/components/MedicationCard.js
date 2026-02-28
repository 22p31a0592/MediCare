/**
 * pages/HomePage/components/MedicationCard.js
 * ─────────────────────────────────────────────────────────
 * Renders a single medication card with:
 *  - Pill name, dosage, frequency
 *  - Taken/Not Taken status + "Mark Taken" button
 *  - Quantity, progress, alarm info
 *  - Per-pill progress bar
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, Bell } from 'lucide-react-native';
import { checkIfTakenToday, getPillProgress } from '../homeHelpers';

export function MedicationCard({ pill, index, onDelete, onMarkTaken }) {
  const takenToday = checkIfTakenToday(pill);
  const pillPct    = getPillProgress(pill);

  return (
    <View style={styles.card}>
      {/* ── Header row ── */}
      <View style={styles.top}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{pill.name}</Text>
          <Text style={styles.meta}>{pill.dosage}  ·  {pill.frequency}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(pill._id)}>
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* ── Status row ── */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, takenToday ? styles.takenBadge : styles.notTakenBadge]}>
          {takenToday
            ? <CheckCircle size={13} color="#16a34a" />
            : <XCircle    size={13} color="#dc2626" />
          }
          <Text style={[styles.statusText, takenToday ? styles.takenText : styles.notTakenText]}>
            {takenToday ? 'Taken Today' : 'Not Taken Today'}
          </Text>
        </View>

        {!takenToday && (
          <TouchableOpacity style={styles.markBtn} onPress={() => onMarkTaken(pill._id)}>
            <CheckCircle size={13} color="#fff" />
            <Text style={styles.markBtnText}>Mark Taken</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Footer info ── */}
      <View style={styles.footer}>
        <FooterItem label="Qty" value={pill.quantity} />

        {pill.totalDays > 0 && (
          <FooterItem
            label="Progress"
            value={`${pill.daysCompleted || 0}/${pill.totalDays}d`}
          />
        )}

        {pill.alarmEnabled && pill.alarmTime && (
          <View style={styles.alarmTag}>
            <Bell size={10} color="#7c3aed" />
            <Text style={styles.alarmText}>{pill.alarmTime}</Text>
            {pill.alarmToneLabel && (
              <Text style={styles.toneText}>· {pill.alarmToneLabel}</Text>
            )}
          </View>
        )}
      </View>

      {/* ── Per-pill progress bar ── */}
      {pillPct !== null && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pillPct}%` }]} />
        </View>
      )}
    </View>
  );
}

function FooterItem({ label, value }) {
  return (
    <View style={styles.footerItem}>
      <Text style={styles.footerLabel}>{label}</Text>
      <Text style={styles.footerValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '300',
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  takenBadge:    { backgroundColor: '#dcfce7' },
  notTakenBadge: { backgroundColor: '#fee2e2' },
  statusText:    { fontSize: 12, fontWeight: '600' },
  takenText:     { color: '#16a34a' },
  notTakenText:  { color: '#dc2626' },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  markBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLabel: { fontSize: 11, color: '#9ca3af' },
  footerValue: { fontSize: 11, fontWeight: '600', color: '#374151' },
  alarmTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  alarmText: { fontSize: 10, color: '#7c3aed', fontWeight: '600' },
  toneText:  { fontSize: 10, color: '#a78bfa' },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1d4ed8',
    borderRadius: 2,
  },
});