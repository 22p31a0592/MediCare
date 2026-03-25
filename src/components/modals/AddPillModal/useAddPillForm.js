/**
 * modals/AddPillModal/useAddPillForm.js
 *
 * FIX: "Cannot read property 'getHours' / 'getMinutes'"
 *
 * ROOT CAUSE:
 *   DateTimePicker on Android sometimes passes a raw number
 *   (Unix timestamp ms) as `selectedTime` instead of a Date object.
 *   Calling .getHours() on a number crashes.
 *
 *   Also, if alarmTimes ever gets a string element (e.g. "8:00 AM")
 *   from a stale state update, DateTimePicker's `value` prop crashes
 *   because it expects a Date object.
 *
 * FIX:
 *   1. `toDate(val)` helper — always converts number/string/Date → Date.
 *   2. `formatTime` calls `toDate()` before accessing .getHours().
 *   3. `onTimeChange` calls `toDate()` on selectedTime before storing.
 *   4. `alarmTimes` state is always kept as Date[] — never strings.
 *   5. `buildDefaultAlarmTimes` return values are wrapped in toDate()
 *      as a safety net.
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { ALARM_TONES, FREQUENCY_ALARM_COUNT, buildDefaultAlarmTimes } from './constants';

// ── Safe Date coercion ───────────────────────────────────
// Accepts: Date | number (Unix ms) | string ("8:00 AM") | null
// Always returns a valid Date object.
function toDate(val) {
  if (!val) return new Date();

  // Already a proper Date
  if (val instanceof Date && !isNaN(val.getTime())) return val;

  // Raw Unix timestamp (number) — Android DateTimePicker sometimes returns this
  if (typeof val === 'number') return new Date(val);

  // String like "8:00 AM" or "20:00" — parse back to a Date for the picker
  if (typeof val === 'string') {
    // Try parsing "H:MM AM/PM"
    const match12 = val.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (match12) {
      let h = parseInt(match12[1], 10);
      const m   = parseInt(match12[2], 10);
      const period = match12[3].toUpperCase();
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    // Try parsing "HH:MM" (24-hour)
    const match24 = val.match(/^(\d+):(\d+)$/);
    if (match24) {
      const d = new Date();
      d.setHours(parseInt(match24[1], 10), parseInt(match24[2], 10), 0, 0);
      return d;
    }
  }

  // Fallback
  return new Date();
}

export function useAddPillForm() {
  const [name,      setName]      = useState('');
  const [dosage,    setDosage]    = useState('');
  const [quantity,  setQuantity]  = useState('');
  const [frequency, setFrequency] = useState('');
  const [notes,     setNotes]     = useState('');
  const [totalDays, setTotalDays] = useState('');

  const [enableAlarm,   setEnableAlarm]   = useState(false);
  const [alarmTimes,    setAlarmTimes]    = useState([new Date()]);  // always Date[]
  const [openPickerIdx, setOpenPickerIdx] = useState(null);
  const [selectedTone,  setSelectedTone]  = useState(ALARM_TONES[0]);

  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showTonePicker,      setShowTonePicker]      = useState(false);

  // Rebuild alarm times array when frequency changes
  useEffect(() => {
    if (!frequency) return;
    const count = FREQUENCY_ALARM_COUNT[frequency] ?? 1;
    // Wrap each value in toDate() — guarantees Date objects even if
    // buildDefaultAlarmTimes ever returns something unexpected
    setAlarmTimes(buildDefaultAlarmTimes(count).map(toDate));
    setOpenPickerIdx(null);
  }, [frequency]);

  // ── Format a Date (or timestamp/string) → "8:00 AM" ─────
  const formatTime = (rawVal) => {
    const date = toDate(rawVal);  // FIX: coerce before calling .getHours()
    const h    = date.getHours();
    const m    = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m < 10 ? '0' + m : m} ${ampm}`;
  };

  // ── Time picker onChange for a specific slot ─────────────
  const onTimeChange = (index) => (event, selectedTime) => {
    // On Android, close the picker regardless
    if (Platform.OS === 'android') setOpenPickerIdx(null);

    // selectedTime can be: Date | number | undefined
    if (!selectedTime && selectedTime !== 0) return;  // user cancelled

    const safeDate = toDate(selectedTime);  // FIX: always coerce to Date

    setAlarmTimes((prev) => {
      const updated = [...prev];
      updated[index] = safeDate;
      return updated;
    });
  };

  // ── Build final pill data object ─────────────────────────
  const buildPillData = () => ({
    name:           name.trim(),
    dosage:         dosage.trim(),
    quantity:       parseInt(quantity) || 0,
    frequency:      frequency.trim() || 'Once daily',
    notes:          notes.trim(),
    // Store as string array — safe for AsyncStorage + scheduleAlarm
    alarmTimes:     enableAlarm ? alarmTimes.map(formatTime) : [],
    alarmTime:      enableAlarm && alarmTimes[0] ? formatTime(alarmTimes[0]) : null,
    alarmEnabled:   enableAlarm,
    alarmTone:      enableAlarm ? selectedTone.value : null,
    alarmToneLabel: enableAlarm ? selectedTone.label : null,
    totalDays:      parseInt(totalDays) || 0,
    daysCompleted:  0,
    startDate:      new Date().toISOString(),
  });

  const isFormValid = name.trim() && dosage.trim() && quantity.trim();

  return {
    name, setName, dosage, setDosage, quantity, setQuantity,
    frequency, setFrequency, notes, setNotes, totalDays, setTotalDays,
    enableAlarm, setEnableAlarm,
    alarmTimes,       // always Date[] — safe to pass to DateTimePicker
    openPickerIdx, setOpenPickerIdx,
    selectedTone, setSelectedTone,
    onTimeChange,
    formatTime,
    buildPillData,
    isFormValid,
    showFrequencyPicker, setShowFrequencyPicker,
    showTonePicker, setShowTonePicker,
  };
}