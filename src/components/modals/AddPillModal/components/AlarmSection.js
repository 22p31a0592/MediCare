/**
 * modals/AddPillModal/components/AlarmSection.js
 * ─────────────────────────────────────────────────────────
 * Alarm toggle + time picker + tone selector.
 * Only visible when the user enables the alarm toggle.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Bell, Clock, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ALARM_TONES } from '../constants';

export function AlarmSection({
  enableAlarm,
  setEnableAlarm,
  alarmTime,
  showTimePicker,
  setShowTimePicker,
  onTimeChange,
  formatTime,
  selectedTone,
  setSelectedTone,
  showTonePicker,
  setShowTonePicker,
}) {
  return (
    <>
      {/* Toggle row */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleLeft}>
          <Bell size={18} color="#1d4ed8" />
          <View>
            <Text style={styles.toggleTitle}>Reminder Alarm</Text>
            <Text style={styles.toggleSub}>Get notified 10 min before</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, enableAlarm && styles.toggleBtnOn]}
          onPress={() => setEnableAlarm(!enableAlarm)}
        >
          <Text style={[styles.toggleText, enableAlarm && styles.toggleTextOn]}>
            {enableAlarm ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Alarm config — visible only when enabled */}
      {enableAlarm && (
        <View style={styles.config}>
          {/* Time row */}
          <View style={styles.timeRow}>
            <Clock size={15} color="#374151" />
            <Text style={styles.timeLabel}>Alarm Time</Text>
            <TouchableOpacity style={styles.timeBtn} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeBtnText}>{formatTime(alarmTime)}</Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={alarmTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onTimeChange}
            />
          )}

          {/* Tone selector */}
          <Text style={styles.toneLabel}>Alarm Tone</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowTonePicker(!showTonePicker)}
          >
            <Text style={styles.dropdownText}>{selectedTone.label}</Text>
            <ChevronDown size={18} color="#6b7280" />
          </TouchableOpacity>

          {showTonePicker && (
            <View style={styles.dropdownList}>
              {ALARM_TONES.map((tone) => (
                <TouchableOpacity
                  key={tone.value}
                  style={[styles.dropdownItem, selectedTone.value === tone.value && styles.dropdownItemSelected]}
                  onPress={() => { setSelectedTone(tone); setShowTonePicker(false); }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedTone.value === tone.value && styles.dropdownItemTextSelected,
                  ]}>
                    🔔 {tone.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toggleTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  toggleSub:   { fontSize: 11, color: '#6b7280', marginTop: 1 },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  toggleBtnOn: { backgroundColor: '#1d4ed8' },
  toggleText:  { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  toggleTextOn: { color: '#fff' },
  config: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  timeBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  timeBtnText: { fontSize: 16, fontWeight: '700', color: '#1d4ed8' },
  toneLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fff',
  },
  dropdownText: { fontSize: 15, color: '#111827' },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 9,
    marginTop: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemSelected:     { backgroundColor: '#eff6ff' },
  dropdownItemText:         { fontSize: 14, color: '#111827' },
  dropdownItemTextSelected: { color: '#1d4ed8', fontWeight: '600' },
});