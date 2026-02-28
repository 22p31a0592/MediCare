/**
 * modals/AddPillModal/useAddPillForm.js
 * ─────────────────────────────────────────────────────────
 * Custom hook: manages all form state for AddPillModal.
 * Returns fields, setters, and the assembled pill data object.
 * ─────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { Platform } from 'react-native';
import { ALARM_TONES } from './constants';

export function useAddPillForm() {
  // ── Form fields ─────────────────────────────────────────
  const [name,      setName]      = useState('');
  const [dosage,    setDosage]    = useState('');
  const [quantity,  setQuantity]  = useState('');
  const [frequency, setFrequency] = useState('');
  const [notes,     setNotes]     = useState('');
  const [totalDays, setTotalDays] = useState('');

  // ── Alarm ───────────────────────────────────────────────
  const [enableAlarm,     setEnableAlarm]     = useState(false);
  const [alarmTime,       setAlarmTime]       = useState(new Date());
  const [showTimePicker,  setShowTimePicker]  = useState(false);
  const [selectedTone,    setSelectedTone]    = useState(ALARM_TONES[0]);

  // ── Dropdown visibility ─────────────────────────────────
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showTonePicker,      setShowTonePicker]      = useState(false);

  // ── Helpers ─────────────────────────────────────────────
  const formatTime = (date) => {
    const h   = date.getHours();
    const m   = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const dh  = h % 12 || 12;
    const dm  = m < 10 ? `0${m}` : m;
    return `${dh}:${dm} ${ampm}`;
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setAlarmTime(selectedTime);
  };

  /** Assemble final pill data object */
  const buildPillData = () => ({
    name:           name.trim(),
    dosage:         dosage.trim(),
    quantity:       parseInt(quantity) || 0,
    frequency:      frequency.trim() || 'Once daily',
    notes:          notes.trim(),
    alarmTime:      enableAlarm ? formatTime(alarmTime) : null,
    alarmEnabled:   enableAlarm,
    alarmTone:      enableAlarm ? selectedTone.value : null,
    alarmToneLabel: enableAlarm ? selectedTone.label : null,
    totalDays:      parseInt(totalDays) || 0,
    daysCompleted:  0,
    startDate:      new Date().toISOString(),
  });

  const isFormValid = name.trim() && dosage.trim() && quantity.trim();

  return {
    // Fields
    name,      setName,
    dosage,    setDosage,
    quantity,  setQuantity,
    frequency, setFrequency,
    notes,     setNotes,
    totalDays, setTotalDays,
    // Alarm
    enableAlarm,    setEnableAlarm,
    alarmTime,
    showTimePicker, setShowTimePicker,
    selectedTone,   setSelectedTone,
    onTimeChange,
    // Dropdowns
    showFrequencyPicker, setShowFrequencyPicker,
    showTonePicker,      setShowTonePicker,
    // Utils
    formatTime,
    buildPillData,
    isFormValid,
  };
}