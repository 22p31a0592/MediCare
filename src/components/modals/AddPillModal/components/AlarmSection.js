/**
 * modals/AddPillModal/components/AlarmSection.js
 * ─────────────────────────────────────────────────────────
 * BUG FIXED: Prop mismatch causing crash on time picker open.
 *
 * OLD props this component expected (no longer passed by index.js):
 *   alarmTime        — single Date
 *   showTimePicker   — boolean
 *   setShowTimePicker — (bool) => void
 *   onTimeChange     — (event, date) => void  (no index)
 *
 * NEW props index.js actually passes:
 *   alarmTimes[]     — Date[] (one per frequency slot)
 *   openPickerIdx    — number | null
 *   setOpenPickerIdx — (idx | null) => void
 *   onTimeChange     — (index) => (event, date) => void  (curried)
 *
 * This mismatch meant:
 *   - alarmTime was undefined → formatTime(undefined) crashed
 *   - showTimePicker never changed → picker never opened
 *   - onTimeChange had no index → always overwrote slot 0
 *
 * FIX: Rewritten to use new props. Renders one time row per slot.
 *   Slot labels adapt: Morning/Evening for twice-daily, etc.
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
  // ── NEW multi-slot props ──────────────────────────────
  alarmTimes,        // Date[]
  openPickerIdx,     // number | null — which slot's picker is open
  setOpenPickerIdx,  // (idx | null) => void
  onTimeChange,      // (index: number) => (event, date) => void
  formatTime,        // (date: Date) => string e.g. "8:00 AM"
  // ── Tone ─────────────────────────────────────────────
  selectedTone,
  setSelectedTone,
  showTonePicker,
  setShowTonePicker,
  frequency,
}) {
  const total = alarmTimes?.length ?? 1;

  // Human-readable label for each slot
  const slotLabel = (index) => {
    const labelMap = {
      1: ['Alarm Time'],
      2: ['Morning',   'Evening'],
      3: ['Morning',   'Afternoon', 'Evening'],
      4: ['Morning',   'Noon',      'Evening',  'Night'],
    };
    return labelMap[total]?.[index] ?? `Dose ${index + 1}`;
  };

  return (
    <>
      {/* ── Toggle ─────────────────────────────────────── */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleLeft}>
          <Bell size={18} color="#1d4ed8" />
          <View>
            <Text style={styles.toggleTitle}>Reminder Alarm</Text>
            <Text style={styles.toggleSub}>
              {total > 1 ? `${total} alarms · ${frequency}` : 'Daily alarm reminder'}
            </Text>
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

      {/* ── Config panel — only when enabled ────────────── */}
      {enableAlarm && (
        <View style={styles.config}>

          {(alarmTimes ?? []).map((timeVal, index) => (
            <View key={index}>
              {/* Time row */}
              <View style={styles.timeRow}>
                <Clock size={15} color="#374151" />
                <Text style={styles.timeLabel}>{slotLabel(index)}</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() =>
                    setOpenPickerIdx(openPickerIdx === index ? null : index)
                  }
                >
                  <Text style={styles.timeBtnText}>{formatTime(timeVal)}</Text>
                </TouchableOpacity>
              </View>

              {/* DateTimePicker — only for the tapped slot */}
              {openPickerIdx === index && (
                <DateTimePicker
                  value={
                    timeVal instanceof Date && !isNaN(timeVal.getTime())
                      ? timeVal
                      : new Date()
                  }
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange(index)}
                />
              )}
            </View>
          ))}

          {/* ── Tone selector ──────────────────────────── */}
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
                  style={[
                    styles.dropdownItem,
                    selectedTone.value === tone.value && styles.dropdownItemSelected,
                  ]}
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
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#f0f9ff',
    borderWidth: 1, borderColor: '#bae6fd',
    padding: 14, borderRadius: 10, marginBottom: 12,
  },
  toggleLeft:   { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  toggleTitle:  { fontSize: 14, fontWeight: '600', color: '#111827' },
  toggleSub:    { fontSize: 11, color: '#6b7280', marginTop: 1 },
  toggleBtn:    { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 6, backgroundColor: '#e5e7eb' },
  toggleBtnOn:  { backgroundColor: '#1d4ed8' },
  toggleText:   { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  toggleTextOn: { color: '#fff' },

  config: {
    backgroundColor: '#f9fafb', borderRadius: 10,
    padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: '#e5e7eb',
  },

  timeRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  timeLabel:    { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  timeBtn: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  timeBtnText: { fontSize: 16, fontWeight: '700', color: '#1d4ed8' },

  toneLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  dropdownBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 9,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#fff',
  },
  dropdownText: { fontSize: 15, color: '#111827' },
  dropdownList: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 9,
    marginTop: 4, backgroundColor: '#fff', overflow: 'hidden',
  },
  dropdownItem:             { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dropdownItemSelected:     { backgroundColor: '#eff6ff' },
  dropdownItemText:         { fontSize: 14, color: '#111827' },
  dropdownItemTextSelected: { color: '#1d4ed8', fontWeight: '600' },
});