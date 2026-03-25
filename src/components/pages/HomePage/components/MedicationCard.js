/**
 * pages/HomePage/components/MedicationCard.js
 *
 * ADDED: "Test Alarm" button (only on cards where alarm is enabled).
 * Tap it → real alarm fires in 5 seconds → AlarmAlertModal appears.
 * Button shows a live countdown. Has a Cancel option.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CheckCircle, XCircle, Bell, Zap } from 'lucide-react-native';
import { checkIfTakenToday, getPillProgress } from '../homeHelpers';
import { triggerTestAlarm, cancelTestAlarm }  from '../../../../services/NotificationService/handlers/testalarm';

export function MedicationCard({ pill, index, onDelete, onMarkTaken }) {
  const takenToday = checkIfTakenToday(pill);
  const pillPct    = getPillProgress(pill);
  const [countdown, setCountdown] = useState(null); // null=idle, 1-5=counting

  const alarmTimesList = pill.alarmTimes?.length > 0
    ? pill.alarmTimes
    : pill.alarmTime ? [pill.alarmTime] : [];

  // ── Test alarm ──────────────────────────────────────────
  const handleTestAlarm = async () => {
    try {
      await triggerTestAlarm(pill);
      let secs = 5;
      setCountdown(secs);
      const tick = setInterval(() => {
        secs -= 1;
        if (secs <= 0) { clearInterval(tick); setCountdown(null); }
        else            { setCountdown(secs); }
      }, 1000);
    } catch (e) {
      Alert.alert('Test Failed', e.message || 'Could not schedule test alarm.\nCheck notification permissions.');
    }
  };

  const handleCancelTest = async () => {
    await cancelTestAlarm(pill._id);
    setCountdown(null);
  };

  return (
    <View style={styles.card}>

      {/* Header */}
      <View style={styles.top}>
        <View style={styles.badge}><Text style={styles.badgeText}>{index + 1}</Text></View>
        <View style={styles.info}>
          <Text style={styles.name}>{pill.name}</Text>
          <Text style={styles.meta}>{pill.dosage}  ·  {pill.frequency}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(pill._id)}>
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, takenToday ? styles.takenBadge : styles.notTakenBadge]}>
          {takenToday ? <CheckCircle size={13} color="#16a34a" /> : <XCircle size={13} color="#dc2626" />}
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

      {/* Footer info */}
      <View style={styles.footer}>
        <FooterItem label="Qty" value={`${pill.quantity} pills`} />
        {pill.totalDays > 0 && <FooterItem label="Progress"  value={`${pill.daysCompleted || 0}/${pill.totalDays}d`} />}
        {pill.totalDays > 0 && <FooterItem label="Remaining" value={`${Math.max((pill.totalDays||0)-(pill.daysCompleted||0),0)}d`} />}
        {pill.alarmEnabled && alarmTimesList.length > 0 && (
          <View style={styles.alarmTagRow}>
            <Bell size={10} color="#7c3aed" />
            <Text style={styles.alarmText}>{alarmTimesList.join(' · ')}</Text>
            {pill.alarmToneLabel && <Text style={styles.toneText}>· {pill.alarmToneLabel}</Text>}
          </View>
        )}
      </View>

      {/* ── TEST ALARM ROW ──────────────────────────────────
          Visible only when alarmEnabled = true.
          Fires the exact same alarm as the real scheduled one,
          but 5 seconds from now, one-shot (no daily repeat).
      ─────────────────────────────────────────────────── */}
      {pill.alarmEnabled && (
        <View style={styles.testRow}>
          {countdown === null ? (
            <TouchableOpacity style={styles.testBtn} onPress={handleTestAlarm} activeOpacity={0.8}>
              <Zap size={13} color="#d97706" />
              <Text style={styles.testBtnText}>⚡ Test Alarm  </Text>
              <Text style={styles.testBtnSub}>fires in 5s</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.countdownRow}>
              <View style={styles.countdownLeft}>
                <Zap size={13} color="#ea580c" />
                <Text style={styles.countdownText}>Alarm fires in {countdown}s…</Text>
              </View>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelTest}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Progress bar */}
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
      <Text style={styles.footerLabel}>{label} </Text>
      <Text style={styles.footerValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card:      { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  top:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badge:     { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1d4ed8', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  info:      { flex: 1 },
  name:      { fontSize: 14, fontWeight: '700', color: '#111827' },
  meta:      { fontSize: 11, color: '#6b7280', marginTop: 2 },
  deleteBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
  deleteText:{ fontSize: 18, color: '#ef4444', fontWeight: '300', lineHeight: 22 },

  statusRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f3f4f6', marginBottom: 8 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
  takenBadge:   { backgroundColor: '#dcfce7' },
  notTakenBadge:{ backgroundColor: '#fee2e2' },
  statusText:   { fontSize: 12, fontWeight: '600' },
  takenText:    { color: '#16a34a' },
  notTakenText: { color: '#dc2626' },
  markBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  markBtnText:  { fontSize: 11, fontWeight: '600', color: '#fff' },

  footer:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  footerItem:  { flexDirection: 'row', alignItems: 'center' },
  footerLabel: { fontSize: 11, color: '#9ca3af' },
  footerValue: { fontSize: 11, fontWeight: '600', color: '#374151' },
  alarmTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f5f3ff', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  alarmText:   { fontSize: 10, color: '#7c3aed', fontWeight: '600' },
  toneText:    { fontSize: 10, color: '#a78bfa' },

  // Test alarm
  testRow: { marginBottom: 8 },
  testBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a',
    borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14,
  },
  testBtnText: { fontSize: 12, fontWeight: '800', color: '#92400e' },
  testBtnSub:  { fontSize: 10, color: '#b45309', fontWeight: '500' },

  countdownRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa',
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12,
  },
  countdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countdownText: { fontSize: 12, fontWeight: '700', color: '#ea580c' },
  cancelBtn:     { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#fee2e2', borderRadius: 6 },
  cancelBtnText: { fontSize: 11, fontWeight: '700', color: '#dc2626' },

  progressTrack: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: '#1d4ed8', borderRadius: 2 },
});